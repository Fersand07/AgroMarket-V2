import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Route, Package, User, ShoppingBag } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../services/OrderService';
import Button from '../../components/Button'

const OrderDetail = () => {
  const mapRef = useRef(null);
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const role = localStorage.getItem('role')

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

  const isSeller = role === "seller"

  useEffect(() => {
    if (mapLoaded && orderData && mapRef.current) {
      const coordinates = orderData.route?.features?.[0]?.geometry?.coordinates;
      if (!coordinates?.length) return;

      const map = window.L.map(mapRef.current).setView([13.7065, -89.2109], 12);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const latLngCoordinates = coordinates.map(coord => [coord[1], coord[0]]);

      const polyline = window.L.polyline(latLngCoordinates, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [10, 10] });

      window.L.marker(latLngCoordinates[0], {
        icon: window.L.divIcon({
          html: '<div style="background: #10B981; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(map).bindPopup('🏪 Punto de partida (Vendedor)');

      window.L.marker(latLngCoordinates[latLngCoordinates.length - 1], {
        icon: window.L.divIcon({
          html: '<div style="background: #EF4444; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(map).bindPopup(`🏠 Destino (Comprador) - ETA: ${orderData.eta}`);

      return () => {
        map.remove();
      };
    }
  }, [mapLoaded, orderData]);

  const formatDistance = (meters) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
  };

  const navigate = useNavigate();

  const handleOrderStatus = async (status) => {
    try {
      await updateOrderStatus(id, status);
      if (status === 'completed') {
        
        navigate('/orders'); 
        return;
      }

      fetchOrder();
    } catch (error) {
      console.error(error)
    }
  }

  const renderActionButton = () => {
    const currentStatus = orderData?.status;

    if (isSeller) {
      if (currentStatus === 'pending') {
        return (
          <Button 
            onClick={() => handleOrderStatus('in_progress')} 
            className='bg-primaryColor hover:bg-primaryColor/90'
          >
            Enviar pedido
          </Button>
        );
      } else {
        return (
          <Button 
            variant='secondary'
            disabled={true}
            className='cursor-not-allowed hover:cursor-not-allowed'
          >
            Pedido ya enviado
          </Button>
        );
      }
    } else {
      if (currentStatus === 'pending') {
        return (
          <Button 
            onClick={() => handleOrderStatus('cancelled')} 
            className='bg-red-800 hover:bg-red-700'
          >
            Cancelar pedido
          </Button>
        );
      } else if (currentStatus === 'in_progress') {
        return (
          <Button 
            onClick={() => handleOrderStatus('completed')} 
            className='bg-primaryColor'
          >
            Pedido recibido
          </Button>
        );
      } else {
        return (
          <Button 
            className='cursor-not-allowed hover:cursor-not-allowed' 
            variant='secondary'
            disabled
          >
            {currentStatus === 'completed' ? 'Pedido completado' : 'Pedido cancelado'}
          </Button>
        );
      }
    }
  };

  if (loading || !orderData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información de la orden...</p>
        </div>
      </div>
    );
  }

  const order = orderData;
  const routeInfo = order.route?.features?.[0]?.properties?.summary;

  return (
    <div className="max-w-6xl mx-auto p-6 font-poppins bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Seguimiento de Orden</h1>
        <p className="text-gray-600">Orden #{order._id.slice(-8)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[rgba(164,214,160,0.2)] p-4 rounded-lg border border-successLight">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-primaryAltDark mr-3" />
            <div>
              <p className="text-sm text-primaryAltDark font-medium">ETA</p>
              <p className="text-xl font-bold text-primaryAltDark">{order.eta}</p>
            </div>
          </div>
        </div>

        {isSeller && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Route className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">Distancia</p>
                <p className="text-xl font-bold text-green-800">{formatDistance(routeInfo?.distance || 0)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Estado</p>
              <p className="text-xl font-bold text-purple-800 capitalize">{order.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-gray-600" />
            Ruta de Entrega
          </h2>
        </div>
        <div ref={mapRef} className="h-96 w-full" style={{ minHeight: '400px' }}>
          {!mapLoaded && (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <p className="text-gray-600">Cargando mapa...</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-gray-600" />
            Productos a Enviar
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.product?.name || 'Producto'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: #{item.product?._id?.slice(-8) || 'N/A'}
                    </p>
                    {item.product?.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {item.product.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    Cantidad: {item.quantity}
                  </p>
                  {item.price && (
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} c/u
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-[rgba(164,214,160,0.2)] rounded-lg">
            <p className="text-sm text-primaryAltDark">
              <strong>Total de productos:</strong> {order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades
            </p>
          </div>
        </div>
      </div>

      <div className={`mt-6 grid grid-cols-1 ${!isSeller ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Información del Pedido
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Comprador:</span>
              <span className="font-medium">#{order.buyer._id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vendedor:</span>
              <span className="font-medium">#{order.seller._id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cantidad de productos:</span>
              <span className="font-medium">{order.items?.reduce((total, item) => total + item.quantity, 0)} unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Creado:</span>
              <span className="font-medium">{new Date(order.createdAt).toLocaleString('es-ES')}</span>
            </div>
          </div>
        </div>

        {isSeller && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Route className="h-5 w-5 mr-2" />
              Primeros Pasos de la Ruta
            </h3>
            <div className="space-y-2 text-sm">
              {order.route?.features?.[0]?.properties?.segments?.[0]?.steps?.slice(0, 3).map((step, index) => (
                <div key={index} className="flex items-start">
                  <span className="w-5 h-5 bg-[rgba(164,214,160,0.2)] text-primaryAltDark text-xs rounded-full flex items-center justify-center mr-2 mt-0.5 font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{step.instruction}</p>
                    <p className="text-gray-600">{formatDistance(step.distance)}</p>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <button className="text-[rgba(0,48,0,0.55)] hover:text-primaryAltDark text-sm font-medium">
                  Ver todas las instrucciones →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='flex justify-center mt-6'>
        {renderActionButton()}
      </div>
    </div>
  );
};

export default OrderDetail;