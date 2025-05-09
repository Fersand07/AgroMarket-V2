import { useState } from 'react';
import Navbar from './Navbar';


const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev); 
  };

  return (
    <div className="flex h-screen">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={toggleSidebar} />
      )}

      <div className={`fixed z-50 top-0 left-0 h-full transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={toggleSidebar} />
        <main className="p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;