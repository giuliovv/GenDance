
import { GoogleGenAI, Type } from "@google/genai";
import { AudioAnalysis, ChoreographyStep } from "../types";
import { POSE_LIBRARY } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChoreography = async (analysis: AudioAnalysis): Promise<ChoreographyStep[]> => {
  const poseNames = Object.keys(POSE_LIBRARY);
  
  const prompt = `
    You are a professional dance choreographer.
    I have a song with the following characteristics:
    - Name: ${analysis.name}
    - BPM: ${analysis.bpm}
    - Duration: ${analysis.duration} seconds
    - Energy Level: ${analysis.energy.reduce((a, b) => a + b, 0) / analysis.energy.length} (out of 255)

    Create a full choreography sequence using only the following allowed poses:
    ${poseNames.join(', ')}

    Rules:
    1. Steps must be synchronized with the BPM. 
    2. Provide at least one pose every 2-4 beats.
    3. The sequence should flow naturally (e.g., don't jump from SQUAT to ARMS_UP instantly).
    4. Start with IDLE.
    5. The timestamps should be in seconds.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timestamp: { type: Type.NUMBER, description: "Time in seconds for this move" },
            poseName: { type: Type.STRING, description: "The name of the pose to assume" }
          },
          required: ["timestamp", "poseName"]
        }
      }
    }
  });

  try {
    const choreography = JSON.parse(response.text);
    // Ensure IDLE at start if not present
    if (choreography.length === 0 || choreography[0].timestamp > 0) {
      choreography.unshift({ timestamp: 0, poseName: 'IDLE' });
    }
    return choreography;
  } catch (e) {
    console.error("Failed to parse choreography:", e);
    return [{ timestamp: 0, poseName: 'IDLE' }];
  }
};
