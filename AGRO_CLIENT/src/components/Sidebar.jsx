import { NavLink } from 'react-router-dom';
import { CreditCard, DollarSign, Grid, User } from 'lucide-react';


const Sidebar = () => {
  const btnLink = 'flex items-center px-7 py-4 text-white transition-colors duration-300 transform rounded-lg hover:bg-gray-100 hover:text-black';
  const activeLink = `${btnLink} bg-gray-100 text-black`;

  return (
    <aside className="bg-green-900 w-56 min-h-screen p-6">
      <div className="flex items-center justify-center mb-6">
        <span className="text-xl font-bold text-white">Menú</span>
      </div>

      <ul className="space-y-6">
        <li>
          <NavLink to="/categories" className={({ isActive }) => isActive ? activeLink : btnLink}>
            <Grid size={20} />
            <span className="ml-3">Categorías</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/sell" className={({ isActive }) => isActive ? activeLink : btnLink}>
            <DollarSign size={20} />
            <span className="ml-3">Vender</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/credits" className={({ isActive }) => isActive ? activeLink : btnLink}>
            <CreditCard size={20} />
            <span className="ml-3">Créditos</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => isActive ? activeLink : btnLink}>
            <User size={20} />
            <span className="ml-3">Perfil</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
