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
      setOrders(data)
    } catch (error) {
      console.error(error)
    }
  }

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
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen font-poppins">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Órdenes</h1>
        <p className="text-gray-600">Gestiona todas tus órdenes</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'current'
                ? 'text-altLight border-b-2 border-altLight bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Timer className="w-4 h-4" />
              <span>Órdenes Actuales</span>
              <span className="bg-blue-100 text-altLight text-xs px-2 py-1 rounded-full">
                {currentOrdersCount}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'past'
                ? 'text-altLight border-b-2 border-altLight bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Órdenes Pasadas</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                {pastOrdersCount}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Contenido de tabs */}
      <div className="space-y-0">
        {activeTab === 'current' ? (
          <div>
            {currentOrders.length > 0 ? (
              <div>
                <div className="mb-4 text-sm text-gray-600">
                  Mostrando {currentOrders.length} orden(es) activa(s)
                </div>
                {currentOrders.map((order) => (
                  <OrderCard key={order._id} order={order} isPast={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes activas</h3>
                <p className="text-gray-600">Todas las órdenes están completadas o no hay órdenes nuevas.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {pastOrders.length > 0 ? (
              <div>
                <div className="mb-4 text-sm text-gray-600">
                  Mostrando {pastOrders.length} orden(es) completada(s)
                </div>
                {pastOrders.map((order) => (
                  <OrderCard key={order._id} order={order} isPast={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes pasadas</h3>
                <p className="text-gray-600">Aún no se han completado órdenes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPreview;