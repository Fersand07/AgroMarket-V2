// src/pages/Home.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Grid, DollarSign, CreditCard, User } from 'lucide-react';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={toggleSidebar} />

      <div className="flex flex-1">
        {isSidebarOpen && (
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
        )}

        <main className="flex-1 p-8 bg-gray-100">
          <h1 className="text-2xl font-bold">Bienvenido a AgroMarket</h1>
          <p></p>
        </main>
      </div>
    </div>
  );
};

export default Home;
