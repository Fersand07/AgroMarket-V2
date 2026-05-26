import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AgroHelpChat from './AgroHelpChat';

const Layout = () => {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#09110a] text-white select-none font-poppins">
      
      {/* Soft, extremely subtle ambient glows in the background for a premium dark mode effect */}
      <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-successLight/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />
      
      {/* Subtle fine dotted grid pattern overlay for neatness */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main content layer */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet /> 
          </div>
        </main>
      </div>

      {/* Global Floating AI Assistance Chatbot */}
      <AgroHelpChat />
    </div>
  );
};

export default Layout;
