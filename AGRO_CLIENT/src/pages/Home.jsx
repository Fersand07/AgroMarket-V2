import { useState } from 'react';
import Navbar from '../components/Navbar';
import {
  Menu,
  CreditCard,
  DollarSign,
  Grid,
  User,
} from 'lucide-react';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={toggleSidebar} />

      <div className="flex flex-1">
        {isSidebarOpen && (
          <aside className="bg-green-900 text-white w-56 min-h-screen p-6">
            <ul className="space-y-6">
              <li className="flex items-center gap-3 hover:text-black cursor-pointer transition-colors">
                <Grid size={20} />
                <span>Categorías</span>
              </li>
              <li className="flex items-center gap-3 hover:text-black cursor-pointer transition-colors">
                <DollarSign size={20} />
                <span>Vender</span>
              </li>
              <li className="flex items-center gap-3 hover:text-black cursor-pointer transition-colors">
                <CreditCard size={20} />
                <span>Créditos</span>
              </li>
              <li className="flex items-center gap-3 hover:text-black cursor-pointer transition-colors">
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
