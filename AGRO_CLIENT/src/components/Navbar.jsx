import { User, ShoppingCart, Menu, Search } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-green-800 text-white p-4 flex items-center justify-between">
      {/* Iconos izquierdos */}
      <div className="flex items-center gap-6">
        <User className="cursor-pointer" />
        <ShoppingCart className="cursor-pointer" />
        <Menu className="cursor-pointer" />
      </div>

      {/* Input de búsqueda */}
      <div className="flex items-center bg-green-900 px-4 py-2 rounded-full w-full max-w-md">
        <Search className="text-white mr-2" />
        <input
          type="text"
          placeholder="BUSCAR"
          className="bg-transparent outline-none text-white placeholder-white w-full"
        />
      </div>

      {/* Logo */}
      <div className="ml-6">
        <img src={logo} alt="AgroMarket" className="h-8 object-contain" />
      </div>
    </nav>
  );
};

export default Navbar;
