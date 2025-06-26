import { ArrowRight, Clock, Package, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0).toFixed(2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-SV', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OrderCard = ({ order, isPast = false }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm border font-poppins border-gray-200 mb-4 overflow-hidden hover:shadow-md transition-shadow">
      
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium text-gray-900">#{order._id.slice(-8)}</div>
            <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
          </div>
          {!isPast && (
            <div className="flex items-center text-sm text-primaryColor bg-[rgba(80,136,69,0.25)] px-2 py-1 rounded">
              <Clock className="w-3 h-3 mr-1" />
              {order.eta || "No disponible"}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
          <div className="text-lg font-bold text-gray-900">
            ${calculateTotal(order.items)}
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <User className="w-3 h-3 mr-1" />
              <span className="truncate">{order.buyer.username}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Package className="w-3 h-3 mr-1" />
              <span className="truncate">{order.seller.username}</span>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
          </div>
        </div>

        <div className="space-y-1 mb-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600 truncate">
                {item.quantity}x {item.product.name}
              </span>
              <span className="text-gray-900 font-medium">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {!isPast && (
          <button
            onClick={() => navigate(`/orders/${order._id}`)}
            className="mt-2  cursor-pointer flex items-center text-sm text-altLight hover:underline hover:text-altDark"
          >
            Ver más <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};


export default OrderCard