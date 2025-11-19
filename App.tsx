
import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import Visualizer from './components/Visualizer';
import ChatInterface from './components/ChatInterface';
import PersonaSelector from './components/PersonaSelector';
import Portal from './components/Portal';
import { SimulationState, TimeJumpRequest, EraDetails, Inhabitant } from './types';
import { getEraDetails, generateEraImage, createLocalChat, generateCharacterImage } from './services/geminiService';
import { soundManager } from './services/audioFx';
import { Chat } from '@google/genai';
import { History } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>(SimulationState.IDLE);
  const [eraData, setEraData] = useState<EraDetails | null>(null);
  const [eraImage, setEraImage] = useState<string | null>(null);
  const [charImage, setCharImage] = useState<string | null>(null);
  
  // Chat Logic
  const [selectedInhabitant, setSelectedInhabitant] = useState<Inhabitant | null>(null);
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);

  const handleEngage = async (request: TimeJumpRequest) => {
    soundManager.playWarpStart();
    setState(SimulationState.TRAVELING);
    
    // Reset previous state
    setSelectedInhabitant(null);
    setChatInstance(null);
    setEraImage(null);
    setCharImage(null);

    // Minimum animation time for effect (3s)
    const minTime = new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // 1. Get Text Details First (Fast)
      const details = await getEraDetails(request);
      
      // 2. Start Image Gen (Fast-ish) in parallel with min wait time
      const imagePromise = generateEraImage(
        request, 
        details.sensoryDetails.visual,
        details.summary
      );
      
      const [imageResult] = await Promise.all([imagePromise, minTime]);

      setEraData(details);
      setEraImage(imageResult);
      
      setState(SimulationState.ARRIVED);
      soundManager.playSuccess();

    } catch (e) {
      console.error(e);
      alert("Temporal displacement failed. Paradox detected.");
      setState(SimulationState.IDLE);
    }
  };

  const handleSelectPersona = async (inhabitant: Inhabitant) => {
    if (!eraData) return;
    
    setSelectedInhabitant(inhabitant);
    
    // Create the chat session
    const chat = createLocalChat(inhabitant, eraData.year, eraData.location);
    setChatInstance(chat);

    // Generate Portrait for the selected character
    setCharImage(null); // Clear old
    generateCharacterImage(
      inhabitant.name, 
      inhabitant.role, 
      eraData.year, 
      eraData.location
    ).then(img => {
      if (img) setCharImage(img);
    });
  };

  const handleReset = () => {
    soundManager.playClick();
    setState(SimulationState.IDLE);
    setEraData(null);
    setEraImage(null);
    setCharImage(null);
    setChatInstance(null);
    setSelectedInhabitant(null);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 relative overflow-x-hidden font-sans selection:bg-cyan-500/30">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
      
      {/* Portal Overlay */}
      {state === SimulationState.TRAVELING && <Portal />}

      <header className="p-6 flex items-center justify-between border-b border-gray-900 bg-black/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="flex items-center gap-3">
           <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-2 rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.6)] animate-pulse">
             <History className="text-white w-6 h-6" />
           </div>
           <div>
             <h1 className="text-3xl font-display font-bold tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
               CHRONO<span className="text-cyan-500">VISOR</span>
             </h1>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-[0.3em]">Quantum Link Stable</p>
             </div>
           </div>
        </div>
        
        {state === SimulationState.ARRIVED && (
          <button 
            onClick={handleReset}
            onMouseEnter={() => soundManager.playHover()}
            className="px-6 py-2 rounded border border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-200 hover:border-red-500 transition-all font-mono text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(220,38,38,0.2)]"
          >
            Abort / Return
          </button>
        )}
      </header>

      {/* Main Container: Flex center ONLY on IDLE, otherwise block layout for scrolling */}
      <main 
        className={`container mx-auto p-4 lg:p-8 transition-all duration-500 ${
          state === SimulationState.IDLE 
            ? 'min-h-[calc(100vh-100px)] flex flex-col items-center justify-center' 
            : 'block pb-20'
        }`}
      >
        
        {state === SimulationState.IDLE && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="text-center space-y-4 mb-8 relative">
               <div className="absolute -inset-10 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
               <h2 className="text-5xl lg:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-700 drop-shadow-2xl">
                 TEMPORAL<br/>LOCATOR
               </h2>
               <p className="text-cyan-400/80 font-mono text-sm tracking-widest">INITIALIZE TARGET COORDINATES</p>
            </div>
            <ControlPanel onEngage={handleEngage} state={state} />
          </div>
        )}

        {state === SimulationState.ARRIVED && eraData && (
          <div className="w-full max-w-6xl mx-auto space-y-6 animate-in zoom-in-95 duration-700 ease-out">
            {/* Visualizer Section */}
            <Visualizer imageUrl={eraImage} details={eraData} />

            {/* Interaction Section - Directly Below */}
            <div className="w-full bg-gray-900/30 rounded-xl border border-gray-800/50 backdrop-blur-sm p-1 animate-in slide-in-from-bottom-10 duration-1000 delay-300">
                <div className="h-[600px]">
                    {!selectedInhabitant ? (
                    <PersonaSelector 
                        inhabitants={eraData.inhabitants} 
                        onSelect={handleSelectPersona} 
                    />
                    ) : (
                    <ChatInterface 
                        personaName={selectedInhabitant.name}
                        personaRole={selectedInhabitant.role}
                        personaGender={selectedInhabitant.voiceGender}
                        suggestedQuestions={selectedInhabitant.questions}
                        initialMessage={selectedInhabitant.greeting}
                        chatInstance={chatInstance}
                        portraitUrl={charImage}
                        onDisconnect={() => setSelectedInhabitant(null)}
                    />
                    )}
                </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
