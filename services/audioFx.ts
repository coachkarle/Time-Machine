
/**
 * A procedural audio synthesizer for UI sound effects.
 * Generates sci-fi beeps, boops, and drones using Web Audio API.
 * No external assets required.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // Initialize loosely; real init happens on user interaction
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // Master volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createOscillator(type: OscillatorType, freq: number, duration: number, vol: number = 0.1) {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playHover() {
    this.init();
    // High tech blip
    this.createOscillator('sine', 800, 0.05, 0.05);
    this.createOscillator('square', 1200, 0.02, 0.01);
  }

  playClick() {
    this.init();
    // Mechanical latch
    this.createOscillator('sawtooth', 150, 0.1, 0.1);
    this.createOscillator('sine', 60, 0.2, 0.2);
  }

  playWarpStart() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    // Rising turbine sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 3);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 1);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 3);
    
    // LFO for fluttering
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 15;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 3);
    lfo.stop(this.ctx.currentTime + 3);
  }

  playSuccess() {
    this.init();
    // Ethereal chime
    [440, 554, 659, 880].forEach((freq, i) => {
        setTimeout(() => this.createOscillator('sine', freq, 1.5, 0.05), i * 50);
    });
  }
  
  async playPCM(base64: string) {
     this.init();
     if (!this.ctx) return;
     
     try {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Simple PCM decode assuming 24kHz mono (standard for Gemini Flash Audio usually)
        // Adjusting sample rate to match Gemini output typically 24000
        const dataInt16 = new Int16Array(bytes.buffer);
        const audioBuffer = this.ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.ctx.destination);
        source.start();
        return source;
     } catch (e) {
         console.error("Failed to play PCM", e);
     }
  }
}

export const soundManager = new AudioEngine();
