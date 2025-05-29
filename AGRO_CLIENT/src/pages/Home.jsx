import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={toggleSidebar} />

      <div className="flex flex-1">
        {isSidebarOpen && <Sidebar />}

        <main className="flex-1 p-8 bg-gray-100">
          <h1 className="text-2xl font-bold">Bienvenido a AgroMarket</h1>
          <p></p>
        </main>
      </div>
    </div>
  );
};

export default Home;
