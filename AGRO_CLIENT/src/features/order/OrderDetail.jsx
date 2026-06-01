import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Route, Package, User, ShoppingBag } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../services/OrderService';
import Button from '../../components/Button';
import { customSwal } from '../../helpers/swalHelper';

const OrderDetail = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const role = localStorage.getItem('role');

  const isSeller = role === "seller";

  useEffect(() => {
    if (orderData && orderData.status === 'pending' && !isSeller) {
      const calculateTime = () => {
        const diffMin = (Date.now() - new Date(orderData.createdAt).getTime()) / (1000 * 60);
        setTimeElapsed(diffMin);
      };
      calculateTime();
      const interval = setInterval(calculateTime, 10000); // recalcular cada 10s
      return () => clearInterval(interval);
    }
  }, [orderData, isSeller]);

  const fetchOrder = React.useCallback(async () => {
    try {
      const data = await getOrderById(id);
      console.log('Respuesta de la orden:', data);
      setOrderData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();

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
  }, [fetchOrder]);

  useEffect(() => {
    if (mapLoaded && orderData && mapRef.current) {
      // Destruir instancia anterior si existe para evitar "Map container is being reused"
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn("Error al remover mapa anterior:", e);
        }
        mapInstanceRef.current = null;
      }

      // Asegurar que el contenedor DOM esté libre de residuos de Leaflet
      if (mapRef.current) {
        mapRef.current._leaflet_id = null;
      }

      const routeCoordinates = orderData.route?.features?.[0]?.geometry?.coordinates;
      let latLngCoordinates = [];
      let isFallbackRoute = false;

      const sellerLat = parseFloat(orderData.seller?.lat);
      const sellerLng = parseFloat(orderData.seller?.lng);
      const buyerLat = parseFloat(orderData.buyer?.lat);
      const buyerLng = parseFloat(orderData.buyer?.lng);

      if (routeCoordinates && routeCoordinates.length > 0) {
        latLngCoordinates = routeCoordinates.map(coord => [coord[1], coord[0]]);
      } else if (!isNaN(sellerLat) && !isNaN(sellerLng) && !isNaN(buyerLat) && !isNaN(buyerLng)) {
        latLngCoordinates = [
          [sellerLat, sellerLng],
          [buyerLat, buyerLng]
        ];
        isFallbackRoute = true;
      }

      if (latLngCoordinates.length < 2) {
        console.warn("Coordenadas insuficientes para renderizar la ruta.");
        return;
      }

      // Inicializar mapa y guardar referencia
      const map = window.L.map(mapRef.current).setView(latLngCoordinates[0], 12);
      mapInstanceRef.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Dibujar la línea de ruta
      const polyline = window.L.polyline(latLngCoordinates, {
        color: isFallbackRoute ? '#FBBF24' : '#10B981', // Ámbar si es fallback, Esmeralda si es real
        weight: 5,
        opacity: 0.8,
        dashArray: isFallbackRoute ? '8, 8' : undefined,
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

      // Marcador del Vendedor
      window.L.marker([sellerLat, sellerLng], {
        icon: window.L.divIcon({
          html: '<div style="background: #10B981; border-radius: 50%; width: 22px; height: 22px; border: 4px solid white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);"></div>',
          className: 'custom-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
      }).addTo(map).bindPopup(`🏪 Punto de partida (Vendedor): @${orderData.seller?.username || 'Vendedor'}`);

      // Marcador del Comprador
      window.L.marker([buyerLat, buyerLng], {
        icon: window.L.divIcon({
          html: '<div style="background: #EF4444; border-radius: 50%; width: 22px; height: 22px; border: 4px solid white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);"></div>',
          className: 'custom-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
      }).addTo(map).bindPopup(`🏠 Destino (Comprador): @${orderData.buyer?.username || 'Comprador'} - ETA: ${orderData.eta || '30 min'}`);

      // Marcador del camión de reparto animado (🚚)
      const truckIcon = window.L.divIcon({
        html: '<div style="background: #3b82f6; border-radius: 50%; width: 30px; height: 30px; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5); font-size: 16px;">🚚</div>',
        className: 'custom-truck-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const truckMarker = window.L.marker(latLngCoordinates[0], { icon: truckIcon }).addTo(map);

      let currentStep = 0;
      let animationFrameId = null;
      let timeoutId = null;

      const animateTruck = () => {
        if (currentStep < latLngCoordinates.length) {
          truckMarker.setLatLng(latLngCoordinates[currentStep]);
          currentStep++;
          timeoutId = setTimeout(() => {
            animationFrameId = requestAnimationFrame(animateTruck);
          }, 150);
        } else {
          // Bucle infinito: Espera 2s al llegar y vuelve al inicio
          currentStep = 0;
          timeoutId = setTimeout(() => {
            animationFrameId = requestAnimationFrame(animateTruck);
          }, 2000);
        }
      };

      animateTruck();

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            // Ignorar errores durante el desmontaje
          }
          mapInstanceRef.current = null;
        }
        if (mapRef.current) {
          mapRef.current._leaflet_id = null;
        }
      };
    }
  }, [mapLoaded, orderData]);

  const formatDistance = (meters) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
  };

  const navigate = useNavigate();

  const handleOrderStatus = async (status) => {
    try {
      if (status === 'cancelled') {
        const confirmResult = await customSwal.fire({
          title: '¿Confirmar cancelación?',
          text: '¿Estás seguro de que deseas cancelar este pedido? Los fondos serán reembolsados.',
          icon: 'warning',
          iconColor: '#EF4444',
          showCancelButton: true,
          confirmButtonText: 'Sí, cancelar',
          cancelButtonText: 'No, mantener pedido',
          reverseButtons: true
        });
        if (!confirmResult.isConfirmed) return;
      }

      await updateOrderStatus(id, status);

      customSwal.fire({
        title: status === 'cancelled' ? 'Pedido Cancelado' : status === 'in_progress' ? 'Pedido en Ruta' : 'Pedido Completado',
        text: status === 'cancelled' ? 'El pedido ha sido cancelado con éxito.' : status === 'in_progress' ? 'El pedido se ha enviado a ruta.' : '¡Gracias por confirmar tu entrega!',
        icon: 'success',
        iconColor: '#A4D6A0',
        timer: 2000,
        showConfirmButton: false
      });

      if (status === 'completed') {
        navigate('/orders'); 
        return;
      }
      fetchOrder();
    } catch (error) {
      console.error(error);
      customSwal.fire({
        title: 'Error al cambiar estado',
        text: error.message || 'No se pudo realizar el cambio de estado.',
        icon: 'error',
        iconColor: '#EF4444'
      });
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'preparing':
        return 'Preparando';
      case 'on_way':
        return 'En Camino';
      case 'completed':
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderActionButton = () => {
    const currentStatus = orderData?.status;

    if (isSeller) {
      if (currentStatus === 'pending') {
        return (
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => handleOrderStatus('in_progress')} 
              className='bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.25)]'
            >
              Enviar Pedido a Ruta
            </Button>
            <Button 
              onClick={() => handleOrderStatus('cancelled')} 
              className='bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all duration-300 shadow-md'
            >
              Cancelar Pedido
            </Button>
          </div>
        );
      } else if (currentStatus === 'in_progress') {
        return (
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              disabled={true}
              className='bg-neutral-800 text-neutral-500 border border-neutral-700/50 cursor-not-allowed hover:bg-neutral-800 font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl'
            >
              Pedido en Ruta
            </Button>
            <Button 
              onClick={() => handleOrderStatus('cancelled')} 
              className='bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all duration-300 shadow-md'
            >
              Cancelar Pedido
            </Button>
          </div>
        );
      } else {
        return (
          <Button 
            variant='secondary'
            disabled={true}
            className='bg-neutral-800 text-neutral-500 border border-neutral-700/50 cursor-not-allowed hover:bg-neutral-800 font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl'
          >
            {currentStatus === 'completed' || currentStatus === 'delivered' ? 'Pedido Entregado' : 'Pedido Cancelado'}
          </Button>
        );
      }
    } else {
      if (currentStatus === 'pending') {
        const canCancel = timeElapsed <= 10;
        if (canCancel) {
          const minutesRemaining = Math.max(0, Math.ceil(10 - timeElapsed));
          return (
            <div className="flex flex-col items-center gap-2">
              <Button 
                onClick={() => handleOrderStatus('cancelled')} 
                className='bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all duration-300 shadow-md'
              >
                Cancelar Pedido
              </Button>
              <p className="text-[10px] text-white/50">Tiempo restante para cancelar: <strong className="text-successLight">{minutesRemaining} min</strong></p>
            </div>
          );
        } else {
          return (
            <div className="flex flex-col items-center gap-2">
              <Button 
                disabled={true}
                className='bg-neutral-800 text-neutral-500 border border-neutral-700/50 cursor-not-allowed hover:bg-neutral-800 font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl'
              >
                Cancelar Pedido
              </Button>
              <p className="text-[10px] text-red-400 font-medium">Límite de tiempo para cancelar (10 min) superado.</p>
            </div>
          );
        }
      } else if (currentStatus === 'in_progress') {
        return (
          <Button 
            onClick={() => handleOrderStatus('completed')} 
            className='bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.25)]'
          >
            Confirmar Pedido Recibido
          </Button>
        );
      } else {
        return (
          <Button 
            className='bg-neutral-800 text-neutral-500 border border-neutral-700/50 cursor-not-allowed hover:bg-neutral-800 font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl' 
            variant='secondary'
            disabled
          >
            {currentStatus === 'completed' || currentStatus === 'delivered' ? 'Pedido Completado' : 'Pedido Cancelado'}
          </Button>
        );
      }
    }
  };

  if (loading || !orderData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center font-poppins">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-successLight mx-auto shadow-[0_0_15px_#A4D6A0]"></div>
          <p className="mt-4 text-white/60 font-semibold animate-pulse">Cargando detalles de la orden...</p>
        </div>
      </div>
    );
  }

  const order = orderData;
  const routeInfo = order.route?.features?.[0]?.properties?.summary;

  return (
    <div className="max-w-6xl mx-auto py-2 font-poppins select-none animate-fade-in">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-wide">Seguimiento de Orden</h1>
        <p className="text-white/60 text-sm mt-1">Orden de Compra #{order._id.slice(-8).toUpperCase()}</p>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        
        {/* ETA Metric Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-successLight/10 rounded-xl border border-successLight/20 text-successLight shrink-0">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xxs font-black text-successLight uppercase tracking-widest">ETA Estimado</p>
            <p className="text-xl font-black text-white tracking-tight mt-0.5">{order.eta || 'Calculando...'}</p>
          </div>
        </div>

        {/* Distance Metric Card (Sellers only) */}
        {isSeller && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-successLight/10 rounded-xl border border-successLight/20 text-successLight shrink-0">
              <Route className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-black text-successLight uppercase tracking-widest">Distancia de Ruta</p>
              <p className="text-xl font-black text-white tracking-tight mt-0.5">{formatDistance(routeInfo?.distance || 0)}</p>
            </div>
          </div>
        )}

        {/* Status Metric Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xxs font-black text-purple-400 uppercase tracking-widest">Estado Actual</p>
            <p className="text-xl font-black text-white tracking-tight mt-0.5 capitalize">{getStatusText(order.status)}</p>
          </div>
        </div>
      </div>

      {/* Map Delivery Route Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-successLight/15 via-primaryColor/25 to-primaryAltDark/30 px-6 py-4.5 border-b border-white/10">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="h-5 w-5 text-successLight shrink-0 animate-pulse" />
            Mapa de Ruta de Entrega
          </h2>
        </div>
        <div ref={mapRef} className="h-96 w-full rounded-b-3xl relative" style={{ minHeight: '400px' }}>
          {!mapLoaded && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#09110a]/90">
              <div className="text-center font-poppins">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-successLight mx-auto shadow-[0_0_15px_#A4D6A0]"></div>
                <p className="mt-4 text-white/70 font-semibold">Cargando mapa Leaflet...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products list Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-successLight/15 via-primaryColor/25 to-primaryAltDark/30 px-6 py-4.5 border-b border-white/10">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-successLight shrink-0" />
            Productos Comprados
          </h2>
        </div>
        <div className="p-6 md:p-8">
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center justify-between p-5 bg-white/2 border border-white/5 rounded-2xl gap-4 hover:bg-white/5 transition-all duration-300 shadow-md">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center shadow-inner shrink-0">
                    <Package className="h-7 w-7 text-successLight/50" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base tracking-wide">
                      {item.product?.name || 'Producto'}
                    </h3>
                    <p className="text-xxs font-black tracking-widest text-successLight/70 uppercase mt-0.5">
                      ID: #{item.product?._id?.slice(-8).toUpperCase() || 'N/A'}
                    </p>
                    {item.product?.description && (
                      <p className="text-white/60 text-xs mt-1 leading-relaxed max-w-md">
                        {item.product.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto flex justify-between sm:block border-t border-white/5 sm:border-t-0 pt-3 sm:pt-0">
                  <p className="text-base font-extrabold text-white">
                    Cantidad: <span className="text-successLight">{item.quantity}</span>
                  </p>
                  {item.product?.price !== undefined && (
                    <p className="text-xs text-white/50 font-semibold mt-0.5">
                      ${item.product.price.toFixed(2)} c/u
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-successLight/10 border border-successLight/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <span className="text-xxs font-black text-successLight uppercase tracking-widest">Resumen de la Orden</span>
              <span className="text-xs text-white/60 font-semibold">{order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades en total</span>
            </div>
            <span className="text-base font-black text-white">
              Total de la Orden: <span className="text-successLight">${order.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0).toFixed(2)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid of detail tables */}
      <div className={`mt-6 grid grid-cols-1 ${!isSeller ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
        
        {/* Order Meta details */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <h3 className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-2 border-b border-white/10 pb-3">
            <User className="h-4.5 w-4.5 text-successLight" />
            Detalles Generales del Pedido
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-white/50 font-medium">Comprador</span>
              <span className="font-semibold text-white">@{order.buyer?.username || 'Usuario'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 font-medium">Vendedor</span>
              <span className="font-semibold text-white">@{order.seller?.username || 'Vendedor'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 font-medium">Items de compra</span>
              <span className="font-semibold text-white">{order.items?.reduce((total, item) => total + item.quantity, 0)} unidades</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 font-medium">Fecha y Hora</span>
              <span className="font-semibold text-white">{new Date(order.createdAt).toLocaleString('es-SV')}</span>
            </div>
          </div>
        </div>

        {/* Route Instructions (Sellers only) */}
        {isSeller && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <h3 className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-2 border-b border-white/10 pb-3">
              <Route className="h-4.5 w-4.5 text-successLight" />
              Primeros Pasos del Despacho
            </h3>
            <div className="space-y-4">
              {order.route ? (
                (order.route?.features?.[0]?.properties?.segments?.[0]?.steps || []).slice(0, 3).map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="w-5.5 h-5.5 bg-successLight/15 text-successLight border border-successLight/20 text-xs rounded-lg flex items-center justify-center shrink-0 font-black mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-white text-xs leading-relaxed">{step.instruction}</p>
                      <p className="text-white/40 text-xxs font-semibold uppercase tracking-wider mt-0.5">{formatDistance(step.distance)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-white/2 border border-white/5 rounded-xl">
                  <p className="text-white/50 text-xs italic">Instrucciones de despacho no disponibles para esta orden.</p>
                </div>
              )}
              {order.route && (
                <div className="text-center pt-2">
                  <button className="text-successLight/70 hover:text-white text-xs font-black uppercase tracking-wider transition-colors duration-300">
                    Ver instrucciones completas →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action button trigger area */}
      <div className='flex justify-center mt-8'>
        {renderActionButton()}
      </div>

    </div>
  );
};

export default OrderDetail;