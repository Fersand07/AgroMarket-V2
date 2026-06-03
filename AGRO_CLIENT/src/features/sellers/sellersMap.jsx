import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Users, TrendingUp, Package } from 'lucide-react';
import { getSellers, getUserInfo } from '../../services/UserService';

const SellersMap = () => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    try {
        const data = await getSellers();
        console.log('Sellers data:', data);
        setSellers(data)
    } catch (error) {
        console.error('Error fetching sellers:', error)
    }
  }

  const fetchUser = async () => {
    try {
        const data = await getUserInfo();
        setUser(data.user);
    } catch (error) {
        console.error('Error fetching user:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSellers(), fetchUser()]);
      setLoading(false);
    };
    
    loadData();

    // Cargar Leaflet si no está disponible
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    
    if (mapLoaded && !loading && mapRef.current) {
      // Limpiar mapa existente
      if (mapRef.current._leaflet_id) {
        mapRef.current._leaflet_map?.remove();
      }

      // Inicializar mapa
      const map = window.L.map(mapRef.current).setView([13.697, -89.232], 13);

      // Agregar tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Crear icono personalizado para sellers
      const sellerIcon = window.L.divIcon({
        className: 'custom-seller-icon',
        html: `<div style="
          background: linear-gradient(135deg, #10b981, #059669);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 4px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4), 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        ">🛒
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #ef4444;
          border: 2px solid white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      // Ícono para el usuario
      const userIcon = window.L.divIcon({
        className: 'custom-user-icon',
        html: `<div style="
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 4px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: all 0.3s ease;
        ">🧍‍♂️</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const markers = [];

      // Agregar marcadores de sellers
      if (sellers && sellers.length > 0) {
        sellers.forEach(seller => {
          if (seller.location && seller.location.coordinates) {
            const [lng, lat] = seller.location.coordinates;
            console.log(`Adding seller marker: ${seller.username} at [${lat}, ${lng}]`);
            
            const marker = window.L.marker([lat, lng], { icon: sellerIcon })
              .addTo(map)
              .bindPopup(`
                <div style="text-align: center; padding: 8px; font-family: 'Poppins', sans-serif;">
                  <h3 style="margin: 0 0 8px 0; font-size: 1.125rem; font-weight: 600; color: #111827;">
                    🛍️ ${seller.username}
                  </h3>
                </div>
              `);
            
            markers.push(marker);
          }
        });
      }

      // Agregar marcador del usuario y círculo de cobertura
      let userLat = null;
      let userLng = null;

      if (user && user.location && user.location.coordinates && Array.isArray(user.location.coordinates)) {
        userLng = user.location.coordinates[0];
        userLat = user.location.coordinates[1];
      } else if (user && typeof user.lat === 'number' && typeof user.lng === 'number') {
        userLat = user.lat;
        userLng = user.lng;
      }

      if (userLat !== null && userLng !== null) {
        console.log(`Adding user marker: ${user.username} at [${userLat}, ${userLng}]`);
        
        const userMarker = window.L.marker([userLat, userLng], { icon: userIcon })
            .addTo(map)
            .bindPopup(`
            <div style="text-align: center; padding: 8px; font-family: 'Poppins', sans-serif;">
                <h3 style="margin: 0 0 8px 0; font-size: 1.125rem; font-weight: 600; color: #111827;">
                🙋 ${user.username} (Tú)
                </h3>
            </div>
            `);

        markers.push(userMarker);

        // Añadir el círculo de cobertura georreferenciada de 15 km (15000 metros)
        const coverageCircle = window.L.circle([userLat, userLng], {
          color: '#10B981',      
          fillColor: '#10B981',  
          fillOpacity: 0.1,
          radius: 15000,         
          weight: 2,
          dashArray: '8, 8',     
        }).addTo(map);
      } else {
        console.log('User marker not added - missing location data');
        console.log('User object:', user);
      }

      // Ajustar vista para mostrar todos los marcadores
      if (markers.length > 0) {
        const group = new window.L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      }

      // Agregar eventos interactivos
      markers.forEach(marker => {
        marker.on('mouseover', function() {
          this.openPopup();
        });
        
        marker.on('click', function() {
          map.setView(this.getLatLng(), 16, {
            animate: true,
            duration: 1
          });
        });
      });

      // Agregar controles
      window.L.control.scale().addTo(map);
      
      // Control para centrar mapa
      const centerControl = window.L.control({position: 'topleft'});
      centerControl.onAdd = function() {
        const div = window.L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = `
          <a href="#" title="Centrar mapa" style="
            background: white;
            color: #6b7280;
            text-decoration: none;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          ">🎯</a>
        `;
        div.onclick = function() {
          if (markers.length > 0) {
            const group = new window.L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
          }
          return false;
        };
        return div;
      };
      centerControl.addTo(map);

      // Guardar referencia del mapa
      mapRef.current._leaflet_map = map;

      return () => {
        if (map) {
          map.remove();
        }
      };
    }
  }, [mapLoaded, sellers, user, loading]);

  return (
    <div className="max-w-6xl mx-auto py-2 font-poppins select-none animate-fade-in">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-wide">Mapa de Vendedores</h1>
        <p className="text-white/60 text-sm mt-1">Localiza de forma interactiva a todos los productores y vendedores de la zona</p>
      </div>

      {/* Glassmorphic Map Container */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden mb-6">
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-successLight/15 via-primaryColor/25 to-primaryAltDark/30 px-6 py-4.5 border-b border-white/10">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="h-5 w-5 text-successLight shrink-0 animate-pulse" />
            Ubicaciones en el Mapa
          </h2>
        </div>

        {/* Leaflet Map Frame */}
        <div 
          ref={mapRef} 
          className="h-96 w-full rounded-b-3xl relative" 
          style={{ minHeight: '450px' }}
        >
          {(!mapLoaded || loading) && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#09110a]/90 backdrop-blur-md">
              <div className="text-center font-poppins">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-successLight mx-auto shadow-[0_0_15px_#A4D6A0]"></div>
                <p className="mt-4 text-white/70 font-semibold tracking-wide">
                  {!mapLoaded ? 'Inicializando mapa Leaflet...' : 'Cargando coordenadas locales...'}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SellersMap;