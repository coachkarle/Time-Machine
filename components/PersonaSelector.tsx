
import React from 'react';
import { Inhabitant } from '../types';
import { Users, Shield, MessageCircle, User, Cpu } from 'lucide-react';
import { soundManager } from '../services/audioFx';

interface PersonaSelectorProps {
  inhabitants: Inhabitant[];
  onSelect: (inhabitant: Inhabitant) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ inhabitants, onSelect }) => {
  
  const handleSelect = (i: Inhabitant) => {
    soundManager.playClick();
    onSelect(i);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gray-900/50 border border-gray-800 rounded-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-2">
         <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-500/30 animate-pulse">
           <Users className="text-purple-400 w-5 h-5" />
         </div>
         <div>
            <h3 className="text-lg font-display text-purple-100 tracking-wider">LIFEFORM SCANNER</h3>
            <p className="text-[10px] text-purple-400/70 font-mono uppercase tracking-widest">3 SIGNATURES DETECTED</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto">
        {inhabitants.map((person, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(person)}
            onMouseEnter={() => soundManager.playHover()}
            className="group relative flex items-start gap-4 p-4 rounded-lg border border-gray-700 bg-gray-950/50 hover:bg-purple-900/10 hover:border-purple-500 transition-all duration-300 text-left"
          >
            {/* Icon Avatar based on index for variety */}
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center border
              ${idx === 0 ? 'bg-amber-900/20 border-amber-700 text-amber-400' : ''}
              ${idx === 1 ? 'bg-cyan-900/20 border-cyan-700 text-cyan-400' : ''}
              ${idx === 2 ? 'bg-emerald-900/20 border-emerald-700 text-emerald-400' : ''}
            `}>
              {idx === 0 && <Shield size={20} />}
              {idx === 1 && <User size={20} />}
              {idx === 2 && <Cpu size={20} />} 
            </div>

            <div className="flex-1">
              <h4 className="font-display text-gray-200 text-lg group-hover:text-white transition-colors">
                {person.name}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] uppercase tracking-wider px-1.5 rounded
                  ${idx === 0 ? 'bg-amber-900/30 text-amber-300' : ''}
                  ${idx === 1 ? 'bg-cyan-900/30 text-cyan-300' : ''}
                  ${idx === 2 ? 'bg-emerald-900/30 text-emerald-300' : ''}
                `}>
                  {person.role}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono italic border-l-2 border-gray-800 pl-2 group-hover:border-purple-500/50 transition-colors">
                "{person.greeting.substring(0, 60)}..."
              </p>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
               <MessageCircle className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-800/50 flex justify-center">
         <p className="text-cyan-500/80 font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse bg-black/40 px-4 py-2 rounded-full border border-cyan-900/30">
           &gt;&gt; Select Subject to Establish Communication Link
         </p>
      </div>
    </div>
  );
};

export default PersonaSelector;
