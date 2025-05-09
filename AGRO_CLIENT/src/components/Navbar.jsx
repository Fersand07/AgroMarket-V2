import { useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Menu, Search } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-green-800 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <User
          className="cursor-pointer hover:scale-110"
          onClick={() => navigate('/perfil')}
        />
        <ShoppingCart
          className="cursor-pointer hover:scale-110"
          onClick={() => navigate('/carrito')}
        />
        <Menu
          className="cursor-pointer hover:scale-110"
          onClick={onMenuClick}
        />
      </div>

      <div className="flex items-center bg-green-900 px-4 py-2 rounded-full w-full max-w-md">
        <Search className="text-white mr-2" />
        <input
          type="text"
          placeholder="BUSCAR"
          className="bg-transparent outline-none text-white placeholder-white w-full"
        />
      </div>

      <div className="ml-6">
        <img src={logo} alt="AgroMarket" className="h-8 object-contain" />
      </div>
    </nav>
  );
};

export default Navbar;
