
import React, { useState } from 'react';
import { Timer, MapPin, Zap } from 'lucide-react';
import { SimulationState, TimeJumpRequest } from '../types';
import { soundManager } from '../services/audioFx';

interface ControlPanelProps {
  onEngage: (request: TimeJumpRequest) => void;
  state: SimulationState;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onEngage, state }) => {
  const [year, setYear] = useState<string>('1985');
  const [location, setLocation] = useState<string>('Hill Valley, California');

  const isLocked = state !== SimulationState.IDLE && state !== SimulationState.ARRIVED;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLocked) {
      soundManager.playClick();
      onEngage({ year, location });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black/40 backdrop-blur-md border border-cyan-900/50 rounded-xl p-6 shadow-[0_0_20px_rgba(0,210,255,0.1)] relative overflow-hidden group">
      {/* Decorative glowing borders */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

      <h2 className="text-xl font-display text-cyan-400 mb-6 flex items-center justify-center tracking-widest uppercase">
        <Timer className="mr-2 w-5 h-5" />
        Temporal Coordinates
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2" onMouseEnter={() => soundManager.playHover()}>
          <label className="text-xs text-cyan-600 uppercase tracking-wider font-bold pl-1">Target Era (Year)</label>
          <div className="relative">
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={isLocked}
              className="w-full bg-black/60 border border-cyan-900 text-cyan-100 px-4 py-3 rounded-lg font-display text-2xl focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all placeholder-cyan-900/50"
              placeholder="e.g. 2050 or 100 BC"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-800 pointer-events-none font-mono text-xs">
              YYYY
            </div>
          </div>
        </div>

        <div className="space-y-2" onMouseEnter={() => soundManager.playHover()}>
          <label className="text-xs text-purple-600 uppercase tracking-wider font-bold pl-1">Spatial Vector</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-800 w-5 h-5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLocked}
              className="w-full bg-black/60 border border-purple-900 text-purple-100 pl-10 pr-4 py-3 rounded-lg font-sans text-lg focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all placeholder-purple-900/50"
              placeholder="e.g. Ancient Rome"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLocked}
          onMouseEnter={() => !isLocked && soundManager.playHover()}
          className={`
            w-full relative overflow-hidden group/btn
            bg-gradient-to-r from-cyan-900 to-blue-900 
            hover:from-cyan-700 hover:to-blue-700
            text-white font-display font-bold py-4 rounded-lg
            transition-all duration-300 uppercase tracking-[0.2em]
            border border-cyan-500/30
            ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-[0_0_30px_rgba(0,210,255,0.4)]'}
          `}
        >
          <span className="relative z-10 flex items-center justify-center">
             {state === SimulationState.TRAVELING ? 'Displacing...' : 'Engage Jump'}
             {!isLocked && <Zap className="ml-2 w-5 h-5 group-hover/btn:text-yellow-400 transition-colors" />}
          </span>
          {/* Button internal glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
        </button>
      </form>
    </div>
  );
};

export default ControlPanel;
