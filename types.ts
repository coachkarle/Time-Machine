export enum SimulationState {
  IDLE = 'IDLE',
  CHARGING = 'CHARGING',
  TRAVELING = 'TRAVELING',
  ARRIVED = 'ARRIVED',
  ERROR = 'ERROR'
}

export interface Inhabitant {
  name: string;
  role: string;
  greeting: string;
  context: string;
  voiceGender: 'male' | 'female';
  questions: string[];
}

export interface EraDetails {
  year: string;
  location: string;
  summary: string;
  sensoryDetails: {
    visual: string;
    auditory: string;
    olfactory: string;
  };
  inhabitants: Inhabitant[];
  funFact: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | 'inhabitant';
  text: string;
  timestamp: number;
  audioUrl?: string; // For TTS playback
}

export interface TimeJumpRequest {
  year: string;
  location: string;
}