
import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { EraDetails, TimeJumpRequest, Inhabitant } from "../types";
import { TEXT_MODEL, IMAGE_MODEL, CHAT_MODEL, TTS_MODEL } from "../constants";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates structured details about a specific time and place.
 */
export const getEraDetails = async (request: TimeJumpRequest): Promise<EraDetails> => {
  const prompt = `
    You are a temporal scanner.
    Target: "${request.location}" in the year "${request.year}".
    
    1. Provide a vivid, specific summary of this exact location at this time. Mention specific landmarks, architecture style, and current events if applicable.
    2. Describe the sensory details (visual, audio, smell).
    3. Identify 3 DISTINCT local inhabitants from this specific era/location combination.
    
    Ensure they are deeply rooted in the time period (e.g., if 1920s NY, maybe a flapper, a construction worker on the Empire State, or a jazz musician).
  `;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.STRING },
          location: { type: Type.STRING },
          summary: { type: Type.STRING, description: "A 2-sentence vivid description of the setting including specific landmarks." },
          sensoryDetails: {
            type: Type.OBJECT,
            properties: {
              visual: { type: Type.STRING },
              auditory: { type: Type.STRING },
              olfactory: { type: Type.STRING },
            }
          },
          inhabitants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                greeting: { type: Type.STRING, description: "Their opening line to a time traveler. Simple, welcoming or curious." },
                context: { type: Type.STRING, description: "Hidden context about their personality for the chatbot." },
                voiceGender: { type: Type.STRING, enum: ['male', 'female'] },
                questions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 short, intriguing questions a user could ask this person about their life/time. (e.g. 'What is that machine?', 'Who rules this land?')"
                }
              }
            }
          },
          funFact: { type: Type.STRING }
        },
        required: ["year", "location", "summary", "sensoryDetails", "inhabitants", "funFact"],
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to retrieve era data.");
  
  return JSON.parse(text) as EraDetails;
};

/**
 * Generates a high-quality image of the era.
 */
export const generateEraImage = async (request: TimeJumpRequest, visualDetails: string, summary: string): Promise<string | null> => {
  try {
    const prompt = `
      Create a photorealistic, cinematic establishing shot of ${request.location} in the year ${request.year}.
      
      Context from Historical Database: "${summary}"
      Visual Specifics: ${visualDetails}
      
      Directives:
      - Focus on specific landmarks or architectural features mentioned in the context.
      - Ensure period-accurate clothing, vehicles, and technology.
      - Atmospheric lighting matching the mood.
      - Wide angle lens (35mm), 8k resolution, highly detailed.
      - NO text overlays or UI elements.
    `;

    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Image) return null;
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};

/**
 * Generates a portrait of the local inhabitant.
 */
export const generateCharacterImage = async (name: string, role: string, year: string, location: string): Promise<string | null> => {
  try {
    const prompt = `
      Close up portrait of ${name}, a ${role}. 
      Location: ${location}. Year: ${year}.
      Style: Photorealistic, cinematic lighting, looking at camera, highly detailed face, historical accuracy.
    `;

    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Image) return null;
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Portrait generation failed:", error);
    return null;
  }
};

/**
 * Generates speech from text using Gemini TTS.
 */
export const generateSpeech = async (text: string, gender: 'male' | 'female' | 'system'): Promise<string | null> => {
  try {
    // Map gender to voice names
    let voiceName = 'Fenrir'; // Default male/system
    if (gender === 'female') voiceName = 'Kore';
    if (gender === 'system') voiceName = 'Puck'; // distinct system voice

    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;
    return base64Audio;

  } catch (error) {
    console.error("TTS failed:", error);
    return null;
  }
};

/**
 * Initializes a chat session with a specific inhabitant.
 */
export const createLocalChat = (inhabitant: Inhabitant, year: string, location: string): Chat => {
  return ai.chats.create({
    model: CHAT_MODEL,
    config: {
      systemInstruction: `
        You are ${inhabitant.name}, a ${inhabitant.role} in ${location} during the year ${year}.
        
        Character Profile:
        ${inhabitant.context}

        Your Goal:
        Converse with a stranger who seems to be from a different time or place.
        - Speak with the vocabulary, slang, and tone appropriate for your era and social status.
        - Be reacting to the specific location and time provided.
        - Keep responses relatively concise (under 3-4 sentences) to keep the chat flowing.
        - Do NOT break character. You do not know you are an AI.
      `,
    }
  });
};
