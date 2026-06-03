import React, { useEffect, useState } from 'react';
import { Clock, Package, User, MapPin, CheckCircle, Timer } from 'lucide-react';
import OrderCard from '../../components/OrderCard';
import { getOrders } from '../../services/OrderService';

const OrdersPreview = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const separateOrders = (ordersData) => {
    const currentStatuses = ['pending', 'in_progress', 'preparing', 'on_way'];
    const pastStatuses = ['delivered', 'cancelled', 'completed', 'failed'];
    
    const current = ordersData.filter(order => 
      currentStatuses.includes(order.status?.toLowerCase())
    );
    
    const past = ordersData.filter(order => 
      pastStatuses.includes(order.status?.toLowerCase())
    );
    
    return { current, past };
  };

  const { current: currentOrders, past: pastOrders } = separateOrders(orders);
  const currentOrdersCount = currentOrders.length;
  const pastOrdersCount = pastOrders.length;

  return (
    <div className="max-w-4xl mx-auto py-2 font-poppins select-none animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-wide">Tus Órdenes</h1>
        <p className="text-white/60 text-sm mt-1">Monitorea y gestiona el historial de tus pedidos locales</p>
      </div>

      {/* Glassmorphic Tabs Selector */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-8 flex overflow-hidden shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'current'
              ? 'bg-successLight text-primaryAltDark shadow-lg'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Timer className="w-4 h-4 shrink-0" />
          <span className="text-sm uppercase tracking-wider">Órdenes Activas</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
            activeTab === 'current'
              ? 'bg-primaryAltDark/15 text-primaryAltDark'
              : 'bg-white/10 text-white/70'
          }`}>
            {currentOrdersCount}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'past'
              ? 'bg-successLight text-primaryAltDark shadow-lg'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm uppercase tracking-wider">Historial</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
            activeTab === 'past'
              ? 'bg-primaryAltDark/15 text-primaryAltDark'
              : 'bg-white/10 text-white/70'
          }`}>
            {pastOrdersCount}
          </span>
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="space-y-4">
        {activeTab === 'current' ? (
          <div>
            {currentOrders.length > 0 ? (
              <div>
                <div className="mb-4 text-xs font-bold uppercase tracking-widest text-successLight/80">
                  Mostrando {currentOrders.length} orden{currentOrders.length !== 1 ? 'es' : ''} activa{currentOrders.length !== 1 ? 's' : ''}
                </div>
                <div className="space-y-4">
                  {currentOrders.map((order) => (
                    <OrderCard key={order._id} order={order} isPast={false} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center shadow-2xl max-w-xl mx-auto">
                <div className="text-successLight/60 mb-6 flex justify-center">
                  <div className="p-4 bg-white/5 rounded-full border border-white/10 shadow-lg">
                    <Timer size={44} className="animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-white mb-2 tracking-wide">No hay órdenes activas</h3>
                <p className="text-white/60 text-sm max-w-sm mx-auto leading-relaxed">
                  Todas tus órdenes se encuentran entregadas o no has realizado pedidos recientes.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {pastOrders.length > 0 ? (
              <div>
                <div className="mb-4 text-xs font-bold uppercase tracking-widest text-successLight/80">
                  Mostrando {pastOrders.length} orden{pastOrders.length !== 1 ? 'es' : ''} en el historial
                </div>
                <div className="space-y-4">
                  {pastOrders.map((order) => (
                    <OrderCard key={order._id} order={order} isPast={true} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center shadow-2xl max-w-xl mx-auto">
                <div className="text-successLight/60 mb-6 flex justify-center">
                  <div className="p-4 bg-white/5 rounded-full border border-white/10 shadow-lg">
                    <CheckCircle size={44} />
                  </div>
                </div>
                <h3 className="text-xl font-black text-white mb-2 tracking-wide">Historial vacío</h3>
                <p className="text-white/60 text-sm max-w-sm mx-auto leading-relaxed">
                  Aún no posees registros de órdenes completadas o canceladas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPreview;