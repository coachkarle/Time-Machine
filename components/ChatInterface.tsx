
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Volume2, XCircle, MessageSquare } from 'lucide-react';
import { Chat } from '@google/genai';
import { generateSpeech } from '../services/geminiService';
import { soundManager } from '../services/audioFx';

interface ChatInterfaceProps {
  personaName: string;
  personaRole: string;
  personaGender: 'male' | 'female';
  suggestedQuestions: string[];
  chatInstance: Chat | null;
  initialMessage: string;
  portraitUrl: string | null;
  onDisconnect: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  personaName, 
  personaRole, 
  personaGender,
  suggestedQuestions,
  chatInstance, 
  initialMessage,
  portraitUrl,
  onDisconnect
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize greeting immediately, fetch audio in background
  useEffect(() => {
    const initMsgId = 'init-' + Date.now();
    
    // 1. Show text immediately
    const greetingMsg: ChatMessage = {
        id: initMsgId,
        sender: 'inhabitant',
        text: initialMessage,
        timestamp: Date.now()
    };
    setMessages([greetingMsg]);

    // 2. Generate audio in background
    const loadAudio = async () => {
        try {
            const audioData = await generateSpeech(initialMessage, personaGender);
            if (audioData) {
                setMessages(prev => prev.map(m => 
                    m.id === initMsgId ? { ...m, audioUrl: audioData } : m
                ));
            }
        } catch (e) {
            console.error("Initial TTS failed", e);
        }
    };
    loadAudio();

    return () => {
      if(sourceRef.current) sourceRef.current.stop();
    };
  }, [initialMessage, personaName, personaGender]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handlePlayAudio = async (base64: string, id: string) => {
    if (playingId === id) {
        if(sourceRef.current) {
            sourceRef.current.stop();
            setPlayingId(null);
        }
        return; 
    }
    setPlayingId(id);
    const source = await soundManager.playPCM(base64);
    if (source) {
        sourceRef.current = source;
        source.onended = () => setPlayingId(null);
    } else {
        setPlayingId(null);
    }
  };

  const handleDisconnect = () => {
    soundManager.playClick();
    onDisconnect();
  }

  const handleSuggestionClick = (question: string) => {
    handleSend(question);
  }

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !chatInstance) return;

    soundManager.playClick();

    // 1. Optimistic UI Update for User Message
    const userMsgId = Date.now().toString();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 2. Get Text Response (Faster than waiting for audio)
      const result = await chatInstance.sendMessage({ message: userMsg.text });
      const responseText = result.text || '...';
      
      const botMsgId = (Date.now() + 1).toString();
      const replyMsg: ChatMessage = {
        id: botMsgId,
        sender: 'inhabitant',
        text: responseText,
        timestamp: Date.now(),
        // audioUrl undefined initially
      };
      
      // 3. Show Text Response Immediately
      setMessages(prev => [...prev, replyMsg]);
      setIsTyping(false);

      // 4. Generate Audio in Background
      generateSpeech(responseText, personaGender).then(audioData => {
        if (audioData) {
             setMessages(prev => prev.map(m => 
                m.id === botMsgId ? { ...m, audioUrl: audioData } : m
             ));
             // Optional: Auto-play if you want, but might be intrusive if typing fast
             // handlePlayAudio(audioData, botMsgId); 
        }
      });

    } catch (error) {
      console.error("Chat error", error);
       const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'system',
        text: 'Comm link disrupted due to temporal interference.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900/90 border border-cyan-900/50 rounded-xl shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-gray-950 p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-600 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-transform hover:scale-105 duration-300">
              {portraitUrl ? (
                <img src={portraitUrl} alt={personaName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-blue-900 flex items-center justify-center text-white font-bold text-2xl">
                  {personaName[0]}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-gray-900 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-display text-cyan-100 tracking-wide text-2xl font-bold mb-1">{personaName}</h3>
            <p className="text-sm text-cyan-500/80 uppercase tracking-wider font-mono bg-cyan-900/20 inline-block px-2 py-0.5 rounded border border-cyan-900/50">{personaRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden sm:block px-2 py-1 bg-red-900/20 border border-red-900/50 rounded text-[10px] text-red-400 animate-pulse uppercase tracking-widest font-mono">
            LIVE LINK
            </div>
            <button 
                onClick={handleDisconnect}
                className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-red-900/10 rounded-full"
                title="Terminate Link"
            >
                <XCircle size={24} />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-sm relative group ${
                msg.sender === 'user'
                  ? 'bg-cyan-900/40 text-cyan-50 rounded-tr-none border border-cyan-800/50'
                  : msg.sender === 'system'
                  ? 'bg-red-900/20 text-red-300 border border-red-900'
                  : 'bg-gray-800/60 text-gray-200 rounded-tl-none border border-gray-700'
              }`}
            >
              {msg.text}
              
              {msg.sender === 'inhabitant' && (
                <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center gap-2 min-h-[24px]">
                    {msg.audioUrl ? (
                        <>
                            <button 
                                onClick={() => handlePlayAudio(msg.audioUrl!, msg.id)}
                                className={`p-1.5 rounded-full transition-all ${playingId === msg.id ? 'bg-cyan-500 text-black animate-pulse' : 'bg-gray-700 text-cyan-400 hover:bg-gray-600'}`}
                            >
                                <Volume2 size={14} />
                            </button>
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                                {playingId === msg.id ? 'Transmitting...' : 'Replay Voice'}
                            </span>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 opacity-50">
                            <div className="w-3 h-3 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
                            <span className="text-[10px] font-mono text-gray-500 uppercase">Decrypting Audio...</span>
                        </div>
                    )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-gray-800/60 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-700 flex items-center gap-1">
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-950 border-t border-gray-800 flex flex-col gap-3">
        {/* Suggested Questions Chips */}
        {!isTyping && messages.length < 4 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mask-linear">
                {suggestedQuestions.map((q, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSuggestionClick(q)}
                        className="whitespace-nowrap text-xs bg-gray-900 border border-gray-700 text-cyan-400 px-3 py-1.5 rounded-full hover:bg-gray-800 hover:border-cyan-500 transition-all flex items-center gap-2 group"
                    >
                        <MessageSquare size={12} className="group-hover:text-white" />
                        {q}
                    </button>
                ))}
            </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Transmit message..."
            className="flex-1 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all placeholder-gray-600 font-mono text-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            onMouseEnter={() => soundManager.playHover()}
            className="bg-cyan-700 hover:bg-cyan-600 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
