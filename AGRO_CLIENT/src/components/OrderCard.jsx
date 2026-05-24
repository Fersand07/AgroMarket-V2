import { ArrowRight, Clock, Package, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'in_progress':
    case 'preparing':
    case 'on_way':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'delivered':
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'cancelled':
    case 'failed':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-white/5 text-white/70 border-white/10';
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
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border font-poppins border-white/10 mb-4 overflow-hidden hover:border-successLight/30 hover:shadow-[0_12px_40px_rgba(164,214,160,0.08)] transition-all duration-300 shadow-2xl group select-none">
      
      {/* Card Header Row */}
      <div className="px-5 py-4 border-b border-white/10 flex flex-wrap justify-between items-center bg-white/2 gap-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="font-extrabold text-white text-base">#{order._id.slice(-8).toUpperCase()}</div>
            <div className="text-xxs text-white/50 font-semibold tracking-wider mt-0.5">{formatDate(order.createdAt)}</div>
          </div>
          {!isPast && (
            <div className="flex items-center text-xs text-successLight bg-successLight/10 border border-successLight/20 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
              {order.eta || "Calculando..."}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4.5">
          <span className={`px-3 py-1 rounded-full text-xxs font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
          <div className="text-xl font-black text-successLight tracking-tight">
            ${calculateTotal(order.items)}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-5 py-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center text-xs text-white/70 font-semibold">
              <User className="w-3.5 h-3.5 mr-2 text-white/40 shrink-0" />
              <span className="text-white/40 mr-1 font-bold">Comprador:</span>
              <span className="truncate text-white/90">@{order.buyer.username}</span>
            </div>
            <div className="flex items-center text-xs text-white/70 font-semibold">
              <Package className="w-3.5 h-3.5 mr-2 text-white/40 shrink-0" />
              <span className="text-white/40 mr-1 font-bold">Vendedor:</span>
              <span className="truncate text-white/90">@{order.seller.username}</span>
            </div>
          </div>
          <div className="text-right text-xs text-white/40 font-bold uppercase tracking-wider">
            {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
          </div>
        </div>

        {/* Items list detail preview */}
        <div className="space-y-2 mb-4 bg-white/2 rounded-xl p-3 border border-white/5 shadow-inner">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-white/70 font-medium truncate">
                <strong className="text-successLight/90 mr-1">{item.quantity}x</strong> {item.product.name}
              </span>
              <span className="text-white font-bold tracking-tight">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {!isPast && (
          <button
            onClick={() => navigate(`/orders/${order._id}`)}
            className="mt-2 cursor-pointer flex items-center text-xxs font-black uppercase tracking-widest text-successLight hover:text-white transition-colors duration-300 gap-1"
          >
            Ver más detalles <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;