// src/pages/Home.jsx
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar'; // lo crearás luego

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-100">
          {/* Contenido principal aquí */}
        </main>
      </div>
    </div>
  );
};

export default Home;
