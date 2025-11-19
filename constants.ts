
// Models
export const TEXT_MODEL = 'gemini-2.5-flash';
export const IMAGE_MODEL = 'imagen-4.0-generate-001';
export const CHAT_MODEL = 'gemini-3-pro-preview';
export const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// Animations
export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 }
};

export const SLIDE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 }
};
