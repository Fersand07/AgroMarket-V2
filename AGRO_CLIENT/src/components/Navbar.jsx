import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, ShoppingCart, Search, House, LogOut, X, ClipboardList, Map } from 'lucide-react';
import Logo from './Logo';
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../hooks/UseAuth';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useMemo(() => localStorage.getItem('role'), []);
  const isSeller = role === "seller";
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchTerm(query);
  }, [searchParams]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const newSearchParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newSearchParams.set('search', value);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/home' && currentPath !== '/' && !currentPath.includes('/seller/home')) {
        navigate(`${isSeller ? '/seller/home' : '/home'}?search=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('search');
    setSearchParams(newSearchParams);
  };

  const AnimatedNavIcon = ({ icon: Icon, text, onClick, className = "" }) => (
    <div 
      className={`group cursor-pointer flex items-center overflow-hidden bg-white/10 hover:bg-successLight hover:text-primaryAltDark border border-white/5 rounded-full transition-all duration-300 ease-in-out ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center px-4.5 py-2.5 transition-all duration-300 ease-in-out">
        <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap font-poppins font-bold text-xs uppercase tracking-wide transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:max-w-xs">
          {text}
        </span>
      </div>
    </div>
  );

  return (
    <nav className="bg-green-950/95 backdrop-blur-md border-b border-white/10 text-white px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-5 shadow-2xl select-none">
      
      {/* Left side: Navigation Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 order-2 lg:order-1">
        <AnimatedNavIcon
          icon={House}
          text="Inicio"
          onClick={() => navigate(isSeller ? "/seller/home" : "/home")}
        />
        
        <AnimatedNavIcon
          icon={User}
          text="Perfil"
          onClick={() => navigate('/profile')}
        />
        
        {!isSeller && (
          <AnimatedNavIcon
            icon={ShoppingCart}
            text="Carrito"
            onClick={() => navigate('/cart')}
          />
        )}
        
        <AnimatedNavIcon
          icon={ClipboardList}
          text="Pedidos"
          onClick={() => navigate('/orders')}
        />

        {!isSeller && (
          <AnimatedNavIcon
            icon={Map}
            text="Mapa"
            onClick={() => navigate('/map')}
          />
        )}
        
        <AnimatedNavIcon
          icon={LogOut}
          text="Salir"
          onClick={() => logout()}
          className="hover:bg-red-500/20 hover:text-red-200 border-red-500/10"
        />
      </div>

      {/* Middle: Premium Search Bar */}
      <div className="flex items-center bg-white/5 border border-white/10 focus-within:border-successLight/40 focus-within:bg-white/10 px-5 py-2.5 rounded-full w-full max-w-md relative transition-all duration-300 order-3 lg:order-2">
        <Search className="text-white/60 mr-2 w-5 h-5" />
        <input
          type="text"
          placeholder="¿Qué estás buscando hoy?..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyPress={handleSearchSubmit}
          className="bg-transparent outline-none font-poppins font-semibold text-sm text-white placeholder-white/50 w-full"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="text-white/60 hover:text-white ml-2 transition-colors duration-200"
            title="Limpiar búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right side: Premium Vector Text Logo */}
      <div className="order-1 lg:order-3">
        <Logo 
          variant="navbar"
          onClick={() => navigate(isSeller ? "/seller/home" : "/home")} 
        />
      </div>

    </nav>
  );
};

export default Navbar;