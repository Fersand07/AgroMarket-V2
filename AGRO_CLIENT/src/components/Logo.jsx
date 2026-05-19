import React from 'react';

const Logo = ({ variant = 'navbar', onClick, className = '' }) => {
  if (variant === 'large') {
    return (
      <div 
        onClick={onClick}
        className={`relative flex items-center justify-center select-none group ${className}`}
      >
        {/* Glow effect in the background */}
        <div className="absolute w-60 h-60 bg-successLight/15 rounded-full blur-3xl group-hover:bg-successLight/25 transition-all duration-500 pointer-events-none animate-pulse" />
        
        {/* Main circular glass container */}
        <div className="relative w-64 h-64 bg-white/5 backdrop-blur-xl rounded-full flex flex-col items-center justify-center border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-105 hover:border-successLight/30 hover:shadow-[0_20px_50px_rgba(164,214,160,0.15)] cursor-pointer gap-1 p-6 overflow-hidden">
          
          {/* Glass reflection shine effect on hover */}
          <div className="absolute inset-0 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full -translate-y-full group-hover:translate-x-1/2 group-hover:translate-y-1/2 transition-transform duration-1000 ease-out pointer-events-none" />
          
          {/* Circular inner border decoration */}
          <div className="absolute inset-2 border border-white/5 rounded-full pointer-events-none" />
          
          {/* Text: AGRO */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-successLight bg-white/10 px-6 py-2.5 rounded-2xl border border-white/15 shadow-lg font-poppins font-black text-4xl uppercase tracking-widest transition-all duration-300 group-hover:bg-successLight group-hover:text-primaryAltDark group-hover:border-successLight/20 group-hover:scale-105">
              AGRO
            </span>
          </div>

          {/* Decorative Divider */}
          <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-3 relative z-10" />

          {/* Text: MARKET */}
          <span className="relative z-10 text-white font-poppins font-black text-2xl uppercase tracking-[0.2em] drop-shadow-md transition-all duration-500 group-hover:text-successLight group-hover:tracking-[0.25em]">
            MARKET
          </span>

          {/* Styled Premium Accent Dot */}
          <div className="relative z-10 w-2 h-2 bg-successLight rounded-full shadow-[0_0_12px_#A4D6A0] mt-2 animate-bounce" />
        </div>
      </div>
    );
  }

  // Default navbar horizontal logo variant
  return (
    <div 
      onClick={onClick}
      className={`group cursor-pointer flex items-center gap-2 select-none font-poppins font-black text-xl tracking-tight ${className}`}
    >
      <span className="text-successLight bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 shadow-md uppercase tracking-wider transition-all duration-300 group-hover:bg-successLight group-hover:text-primaryAltDark group-hover:border-successLight/20 group-hover:scale-105">
        AGRO
      </span>
      <span className="text-white uppercase tracking-widest drop-shadow-md transition-colors duration-300 group-hover:text-successLight/90">
        MARKET
      </span>
      <span className="w-1.5 h-1.5 bg-successLight rounded-full shadow-[0_0_6px_#A4D6A0] self-end mb-2.5 transition-transform duration-300 group-hover:scale-125" />
    </div>
  );
};

export default Logo;
