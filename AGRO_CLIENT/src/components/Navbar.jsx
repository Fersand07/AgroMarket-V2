import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, ShoppingCart, Menu, Search, House, LogOut, X } from 'lucide-react';
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
 
  return (
    <nav className="bg-green-800 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <House
          className='cursor-pointer hover:scale-110'
          onClick={() => navigate(isSeller ? "/seller/home" : "/home")}
        />
        <User
          className="cursor-pointer hover:scale-110"
          onClick={() => navigate('/profile')}
        />
        {
          isSeller ? null : <ShoppingCart className="cursor-pointer hover:scale-110" onClick={() => navigate('/cart')} />
        }
        <LogOut
          className='cursor-pointer hover:scale-110'
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
            className="text-white hover:text-gray-300 ml-2"
            title="Limpiar búsqueda"
          >
            <X/>
          </button>
        )}
      </div>
 
      <div className="ml-6">
        <img src={logo} alt="AgroMarket" className="h-8 object-contain" />
      </div>
    </nav>
  );
};
 
export default Navbar;