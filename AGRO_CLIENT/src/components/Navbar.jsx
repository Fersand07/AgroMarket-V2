import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, ShoppingCart, Search, House, LogOut, X, ClipboardList, Map } from 'lucide-react';
import logo from '../assets/logo.png';
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
      className={`group cursor-pointer flex items-center overflow-hidden bg-green-700 rounded-full transition-all duration-600 ease-in-out hover:bg-primaryAltDark ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center px-3 py-2 transition-all duration-300 ease-in-out group-hover:px-4">
        <Icon className="transition-transform duration-600 group-hover:scale-110" />
        <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap font-semibold transition-all duration-600 ease-in-out group-hover:ml-2 group-hover:max-w-xs">
          {text}
        </span>
      </div>
    </div>
  );

  return (
    <nav className="bg-green-800 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-1 w-90">
        <AnimatedNavIcon
          icon={House}
          text="INICIO"
          onClick={() => navigate(isSeller ? "/seller/home" : "/home")}
        />
        
        <AnimatedNavIcon
          icon={User}
          text="PERFIL"
          onClick={() => navigate('/profile')}
        />
        
        {!isSeller && (
          <AnimatedNavIcon
            icon={ShoppingCart}
            text="CARRITO"
            onClick={() => navigate('/cart')}
          />
        )}
        
        <AnimatedNavIcon
          icon={ClipboardList}
          text="PEDIDOS"
          onClick={() => navigate('/orders')}
        />

        <AnimatedNavIcon
          icon={Map}
          text="MAPA"
          onClick={() => navigate('/map')}
        />
        
        <AnimatedNavIcon
          icon={LogOut}
          text="SALIR"
          onClick={() => logout()}
        />
      </div>

      <div className="flex items-center bg-primaryAltDark px-4 py-2 rounded-full w-full max-w-md relative">
        <Search className="text-white mr-2" />
        <input
          type="text"
          placeholder="BUSCAR"
          value={searchTerm}
          onChange={handleSearch}
          onKeyPress={handleSearchSubmit}
          className="bg-transparent outline-none font-poppins font-semibold text-white placeholder-white w-full"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="text-white hover:text-gray-300 ml-2 transition-colors duration-200"
            title="Limpiar búsqueda"
          >
            <X/>
          </button>
        )}
      </div>

      <div>
        <img src={logo} alt="AgroMarket" className="h-8 object-contain" />
      </div>
    </nav>
  );
};

export default Navbar;