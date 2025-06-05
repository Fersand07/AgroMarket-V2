// src/components/Sidebar.jsx
import { useNavigate } from 'react-router-dom';
import { Grid, DollarSign, CreditCard, User } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="bg-green-900 w-56 min-h-screen p-6">
      <ul className="space-y-6">
        <li
          className="flex items-center gap-3 text-white hover:text-black hover:bg-green-700 cursor-pointer p-2 rounded transition-colors"
          onClick={() => navigate('/categorias')}
        >
          <Grid size={20} />
          <span>Categorías</span>
        </li>
        <li
          className="flex items-center gap-3 text-white hover:text-black hover:bg-green-700 cursor-pointer p-2 rounded transition-colors"
          onClick={() => navigate('/vender')}
        >
          <DollarSign size={20} />
          <span>Vender</span>
        </li>
        <li
          className="flex items-center gap-3 text-white hover:text-black hover:bg-green-700 cursor-pointer p-2 rounded transition-colors"
          onClick={() => navigate('/creditos')}
        >
          <CreditCard size={20} />
          <span>Créditos</span>
        </li>
        <li
          className="flex items-center gap-3 text-white hover:text-black hover:bg-green-700 cursor-pointer p-2 rounded transition-colors"
          onClick={() => navigate('/perfil')}
        >
          <User size={20} />
          <span>Perfil</span>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
