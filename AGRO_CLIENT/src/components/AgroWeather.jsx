import { useEffect, useState } from "react";
import { getUserInfo } from "../services/UserService";
import { geolocationService } from "../services/geolocationService";
import { 
  CloudSun, CloudRain, Sun, Wind, Droplets, 
  Thermometer, ShieldAlert, Sparkles, AlertTriangle 
} from "lucide-react";

const AgroWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState({ lat: 13.6929, lng: -89.2182, address: "San Salvador" });

  const fetchWeather = async () => {
    try {
      setLoading(true);
      // Coordenadas por defecto (San Salvador)
      let lat = 13.6929;
      let lng = -89.2182;
      let addressName = "San Salvador";

      // 1. Intentar obtener la ubicación física del navegador en tiempo real (GPS)
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });

          lat = position.coords.latitude;
          lng = position.coords.longitude;
          
          // Reversar coordenadas usando la API Nominatim de OpenStreetMap
          try {
            const displayAddress = await geolocationService(lat, lng);
            if (displayAddress) {
              const parts = displayAddress.split(",");
              // Tomar barrio/calle o municipio + departamento
              addressName = `${parts[0] || ""}, ${parts[2] || parts[1] || ""}`.trim();
            }
          } catch (geoErr) {
            console.warn("Error consultando Nominatim para el GPS real:", geoErr);
            addressName = "Ubicación GPS Real";
          }
        } catch (gpsError) {
          console.warn("Geolocalización del navegador rechazada/con timeout. Usando base de datos:", gpsError.message);
          
          // Fallback a los datos configurados en el perfil de base de datos Neon
          try {
            const data = await getUserInfo();
            if (data && data.user && data.user.lat && data.user.lng) {
              lat = parseFloat(data.user.lat);
              lng = parseFloat(data.user.lng);
              if (data.user.address) {
                const parts = data.user.address.split(",");
                addressName = parts[0] || data.user.address;
              }
            }
          } catch (err) {
            console.warn("No se pudo obtener la ubicación del usuario de la base de datos:", err);
          }
        }
      }

      setUserCoords({ lat, lng, address: addressName });

      // 2. Consultar API libre y gratuita de Open-Meteo con las coordenadas definitivas
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&relative_humidity_2m=true&hourly=relative_humidity_2m`
      );

      if (!response.ok) {
        throw new Error("Error consultando Open-Meteo");
      }

      const data = await response.json();
      
      // Obtener la humedad del registro horario de la hora actual
      let currentHumidity = 65; // valor de fallback
      if (data.hourly && data.hourly.relative_humidity_2m) {
        const currentHourIndex = new Date().getHours();
        currentHumidity = data.hourly.relative_humidity_2m[currentHourIndex] || 65;
      }

      setWeather({
        temp: data.current_weather.temperature,
        windspeed: data.current_weather.windspeed,
        weathercode: data.current_weather.weathercode,
        humidity: currentHumidity
      });
    } catch (err) {
      console.error("Error al cargar clima satelital:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  // Mapear código de clima a texto e icono
  const getWeatherDetails = (code) => {
    // Códigos WMO de clima
    if (code === 0) return { text: "Despejado", icon: <Sun className="w-10 h-10 text-amber-400 animate-spin-slow" /> };
    if ([1, 2, 3].includes(code)) return { text: "Parcialmente Nublado", icon: <CloudSun className="w-10 h-10 text-white/80" /> };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return { text: "Lluvia Activa", icon: <CloudRain className="w-10 h-10 text-blue-400 animate-bounce" /> };
    }
    return { text: "Nublado", icon: <CloudSun className="w-10 h-10 text-white/60" /> };
  };

  // Generar alertas agrícolas basadas en clima real
  const generateAgroAlerts = () => {
    if (!weather) return [];
    const alerts = [];

    // Alerta de Temperatura Alta (Estrés hídrico)
    if (weather.temp >= 30) {
      alerts.push({
        type: "danger",
        title: "¡Calor Extremo Detectado!",
        desc: `Temperatura de ${weather.temp}°C propensa al estrés hídrico. Incrementa el riego por goteo en hortalizas tiernas (lechugas, tomates) y considera usar mallas de sombreado.`
      });
    }
    
    // Alerta de Temperatura Baja (Heladas/Protección)
    if (weather.temp <= 16) {
      alerts.push({
        type: "warning",
        title: "Bajas Temperaturas",
        desc: `Registro frío de ${weather.temp}°C. Protege semilleros jóvenes y cubre cultivos sensibles por la noche para evitar quemaduras por frío.`
      });
    }

    // Alerta de Humedad Alta (Riesgo biológico - hongos)
    if (weather.humidity >= 80) {
      alerts.push({
        type: "danger",
        title: "Riesgo de Plaga Fúngica",
        desc: `Humedad relativa crítica del ${weather.humidity}%. Muy alta propensión a hongos como mildiu o tizón en las hojas. Evita riegos foliares directos y mejora la ventilación.`
      });
    }

    // Alerta de Humedad Seca (Deshidratación)
    if (weather.humidity <= 45) {
      alerts.push({
        type: "warning",
        title: "Entorno Sumamente Seco",
        desc: `Humedad de apenas ${weather.humidity}%. Alto riesgo de desecación foliar acelerada. Asegura que la humedad del suelo en raíz sea constante.`
      });
    }

    // Alerta de Vientos Fuertes
    if (weather.windspeed >= 20) {
      alerts.push({
        type: "warning",
        title: "Vientos Ráfagas Moderadas",
        desc: `Vientos de ${weather.windspeed} km/h. Asegura coberturas plásticas, invernaderos y apuntala plantas jóvenes con tutores firmes.`
      });
    }

    // Si todo está perfecto
    if (alerts.length === 0) {
      alerts.push({
        type: "success",
        title: "Condiciones de Cosecha Ideales",
        desc: "Temperatura y humedad óptimas para el crecimiento vegetativo. Excelente momento para recolección de hortalizas y labores de poda en el campo."
      });
    }

    return alerts;
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 font-poppins text-white animate-pulse flex flex-col md:flex-row gap-6 items-center justify-between select-none">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 bg-white/10 rounded-xl" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-white/10 rounded" />
            <div className="w-24 h-3 bg-white/10 rounded" />
          </div>
        </div>
        <div className="w-full md:w-1/2 h-8 bg-white/10 rounded-xl" />
      </div>
    );
  }

  const details = getWeatherDetails(weather?.weathercode ?? 0);
  const alerts = generateAgroAlerts();

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 font-poppins text-white shadow-xl flex flex-col lg:flex-row gap-6 items-stretch justify-between select-none animate-fade-in relative overflow-hidden group">
      
      {/* Glow Effects */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-successLight/10 rounded-full blur-2xl pointer-events-none group-hover:bg-successLight/15 transition duration-500" />
      
      {/* Left Area: Weather Information */}
      <div className="flex flex-col sm:flex-row items-center gap-6 z-10 shrink-0">
        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-inner flex items-center justify-center">
          {details.icon}
        </div>
        
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xxs font-black tracking-widest uppercase px-2 py-0.5 rounded bg-successLight/10 border border-successLight/20 text-successLight">
              Monitoreo Satelital
            </span>
            <span className="text-xxs text-white/40 font-semibold">{userCoords.address}</span>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-1">
            {weather.temp}°C
            <span className="text-sm text-white/50 font-normal">/ {details.text}</span>
          </h3>
          
          <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-white/60">
            <p className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              Humedad: <strong className="text-white">{weather.humidity}%</strong>
            </p>
            <p className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              Viento: <strong className="text-white">{weather.windspeed} km/h</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Right Area: Smart Farming Alerts Panel */}
      <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-center min-h-[100px] lg:min-h-0 z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xxs font-black text-successLight uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Asistente AgroClima IA</span>
          </div>
          
          <div className="space-y-1">
            {alerts.map((alert, idx) => {
              let alertIcon = <Sparkles className="w-4 h-4 text-successLight shrink-0" />;
              let alertColor = "text-successLight bg-successLight/5 border-successLight/10";
              
              if (alert.type === "danger") {
                alertIcon = <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />;
                alertColor = "text-red-400 bg-red-500/5 border-red-500/10";
              } else if (alert.type === "warning") {
                alertIcon = <AlertTriangle className="w-4 h-4 text-yellow-500/80 shrink-0" />;
                alertColor = "text-yellow-500/90 bg-yellow-500/5 border-yellow-500/10";
              }

              return (
                <div key={idx} className={`p-2.5 rounded-xl border flex gap-3 text-xs leading-relaxed ${alertColor}`}>
                  {alertIcon}
                  <div className="space-y-0.5">
                    <p className="font-black uppercase tracking-wide text-[10px]">{alert.title}</p>
                    <p className="text-white/70">{alert.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AgroWeather;
