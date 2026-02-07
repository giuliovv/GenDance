
import { GoogleGenAI, Type } from "@google/genai";
import { AudioAnalysis, ChoreographyStep } from "../types";
import { POSE_LIBRARY } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChoreography = async (analysis: AudioAnalysis): Promise<ChoreographyStep[]> => {
  const poseNames = Object.keys(POSE_LIBRARY);

  const prompt = `
    You are a professional dance choreographer creating a Just Dance style routine.
    I have a song with the following characteristics:
    - Name: ${analysis.name}
    - BPM: ${analysis.bpm}
    - Duration: ${analysis.duration} seconds
    - Energy Level: ${analysis.energy.reduce((a, b) => a + b, 0) / analysis.energy.length} (out of 255)

    Create an energetic, varied choreography sequence using these poses:
    ${poseNames.join(', ')}

    Rules:
    1. Provide a pose change every 1-2 beats for high energy, dynamic dancing.
    2. USE PATTERNS - create rhythmic sequences by repeating moves (e.g., LUNGE_LEFT -> LUNGE_RIGHT -> LUNGE_LEFT -> LUNGE_RIGHT).
    3. Match energy: use dramatic poses (DAB, KICK_LEFT, KICK_RIGHT, DISCO_POINT, PUMP_IT) during high-energy moments.
    4. Group similar moves: do 2-4 reps of a move type (e.g. 2 side steps, 4 arm pumps) before switching to a new idea.
    5. Don't be afraid to hold a pose for 2-4 beats for emphasis.
    6. Include signature moves like DAB, VOGUE, THRILLER, RUNNING_MAN for variety.
    7. Timestamps must be in seconds. At ${analysis.bpm} BPM, one beat = ${(60 / analysis.bpm).toFixed(3)} seconds.
    8. Generate poses for the FULL duration of the song (${analysis.duration} seconds).
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
