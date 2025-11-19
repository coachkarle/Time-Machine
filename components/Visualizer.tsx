
import React, { useEffect, useState } from 'react';
import { EraDetails } from '../types';
import { Eye, Wind, Music, Info, Aperture, Volume2, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { soundManager } from '../services/audioFx';
import { generateSpeech } from '../services/geminiService';

interface VisualizerProps {
  imageUrl: string | null;
  details: EraDetails;
}

const Visualizer: React.FC<VisualizerProps> = ({ imageUrl, details }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSensory, setShowSensory] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setShowSensory(false);
  }, [imageUrl]);

  const handlePlayLog = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    soundManager.playClick();
    try {
        const audioBase64 = await generateSpeech(details.summary, 'system');
        if (audioBase64) {
            const source = await soundManager.playPCM(audioBase64);
            if (source) {
                source.onended = () => setIsSpeaking(false);
            } else {
                setIsSpeaking(false);
            }
        }
    } catch (e) {
        setIsSpeaking(false);
    }
  };

  const toggleSensory = () => {
    soundManager.playClick();
    setShowSensory(!showSensory);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 animate-in fade-in duration-1000 mb-4">
      {/* Main Viewport - The "Window" into time */}
      <div className="lg:w-3/4 relative group rounded-xl overflow-hidden border border-gray-800 bg-black shadow-2xl h-[400px] lg:h-[500px]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0" />
        
        {/* Media Container */}
        <div className="relative w-full h-full flex items-center justify-center bg-gray-900 overflow-hidden">
          
          {/* Static Image */}
          {imageUrl && (
            <>
               {!imageLoaded && (
                 <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 animate-pulse z-10" />
               )}
               <img 
                 src={imageUrl} 
                 alt="Time Window" 
                 className={`w-full h-full object-cover transition-all duration-1000 ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'}`}
                 onLoad={() => setImageLoaded(true)}
               />
            </>
          )}
          
          {!imageUrl && (
             <div className="text-gray-600 font-mono text-sm flex flex-col items-center gap-2">
                <Aperture className="animate-spin text-cyan-900" size={40} />
                <span>Awaiting Visual Telemetry...</span>
             </div>
          )}

          {/* Overlay Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none" />
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none z-20" />
          
          {/* HUD Elements */}
          <div className="absolute top-4 left-4 z-30 flex flex-col gap-1">
             <div className="bg-black/70 backdrop-blur text-cyan-400 px-3 py-1 rounded border-l-2 border-cyan-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               Visual Feed Active
             </div>
             <div className="bg-black/70 backdrop-blur text-white/80 px-3 py-1 rounded border-l-2 border-purple-500 font-display text-sm uppercase">
               {details.location} // {details.year}
             </div>
          </div>
        </div>
      </div>

      {/* Data Panel - Reordered & Compact */}
      <div className="lg:w-1/4 flex flex-col gap-3 font-light">
        
        {/* 1. Stability Meter (Moved to Top) */}
        <div className="bg-gray-900/80 border border-gray-800 p-3 rounded-xl shadow-lg">
            <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase mb-1">
                <span className="flex items-center gap-1"><Activity size={10} /> Flux Stability</span>
                <span className="text-green-400">98.4%</span>
            </div>
            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[98%] shadow-[0_0_10px_lime]"></div>
            </div>
        </div>

        {/* 2. Fun Fact (Moved to Second) */}
        <div className="bg-yellow-900/10 border border-yellow-900/30 p-3 rounded-xl shadow-lg">
           <div className="text-yellow-500/70 text-[10px] font-mono uppercase mb-1">Historical Note</div>
           <div className="text-yellow-100/60 text-[11px] italic leading-relaxed">"{details.funFact}"</div>
        </div>

        {/* 3. Summary & Sensory Dropdown */}
        <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-xl shadow-lg backdrop-blur-sm flex flex-col gap-3 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-cyan-400 font-display text-sm flex items-center uppercase tracking-wider">
              <Info className="w-3 h-3 mr-2" />
              Log
            </h3>
            <button 
              onClick={handlePlayLog}
              disabled={isSpeaking}
              className="p-1 rounded-full hover:bg-cyan-900/30 text-cyan-400 transition-colors disabled:opacity-50"
              title="Play Audio Log"
            >
              <Volume2 size={14} className={isSpeaking ? 'animate-pulse' : ''} />
            </button>
          </div>
          
          <p className="text-gray-300 leading-relaxed text-xs font-mono border-l-2 border-gray-700 pl-3">
            {details.summary}
          </p>

          {/* Collapsible Sensory Details */}
          <div className="mt-auto pt-2 border-t border-gray-800">
            <button 
              onClick={toggleSensory}
              className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500 hover:text-cyan-400 transition-colors py-1"
            >
              Sensory Telemetry
              {showSensory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showSensory && (
              <div className="grid grid-cols-1 gap-2 mt-2 animate-in slide-in-from-top-2 duration-300">
                 <div className="bg-black/40 p-2 rounded border border-gray-800">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                        <Eye size={12} />
                        <span className="text-[10px] uppercase font-bold">Visual</span>
                    </div>
                    <div className="text-[10px] text-gray-400 leading-tight">{details.sensoryDetails.visual}</div>
                 </div>
                 <div className="bg-black/40 p-2 rounded border border-gray-800">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                        <Music size={12} />
                        <span className="text-[10px] uppercase font-bold">Audio</span>
                    </div>
                    <div className="text-[10px] text-gray-400 leading-tight">{details.sensoryDetails.auditory}</div>
                 </div>
                 <div className="bg-black/40 p-2 rounded border border-gray-800">
                    <div className="flex items-center gap-2 text-orange-400 mb-1">
                        <Wind size={12} />
                        <span className="text-[10px] uppercase font-bold">Smell</span>
                    </div>
                    <div className="text-[10px] text-gray-400 leading-tight">{details.sensoryDetails.olfactory}</div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
