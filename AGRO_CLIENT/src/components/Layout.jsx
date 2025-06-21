import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Layout = () => {

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-4 overflow-auto bg-gray-100">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default Layout;
