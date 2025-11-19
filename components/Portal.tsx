import React from 'react';

const Portal: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Tunnel Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] rounded-full bg-[conic-gradient(from_0deg,transparent,cyan,transparent)] animate-[spin_1s_linear_infinite] opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] rounded-full bg-[conic-gradient(from_180deg,transparent,purple,transparent)] animate-[spin_2s_linear_infinite_reverse] opacity-20 blur-3xl" />
      </div>

      {/* Central Singularity */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        <div className="w-64 h-64 relative">
           <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
           <div className="absolute inset-2 rounded-full border-4 border-purple-500 border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-48 h-48 bg-white rounded-full animate-pulse blur-2xl opacity-50" />
           </div>
        </div>
        <div className="text-center space-y-2">
           <h2 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse">
             TRAVERSING
           </h2>
           <p className="font-mono text-cyan-800 text-sm tracking-[0.5em] animate-bounce">CALIBRATING FLUX</p>
        </div>
      </div>
      
      {/* Speed Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white h-[2px] w-20 rounded-full animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_infinite]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random()}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Portal;
