import { GoogleGenAI, Type } from "@google/genai";
import { LevelConfig, GameNode } from "../types";
import { COLORS } from "../constants";

export const generateLevel = async (): Promise<LevelConfig | null> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found for Gemini");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Randomize difficulty internally for variety
  const difficulties = ['easy', 'medium', 'hard', 'medium', 'hard']; // weighted towards interesting
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

  const prompt = `
    Create a level for a rhythm puzzle game called "Pulse & Path".
    The game board is a 0-100 coordinate system (x, y).
    
    Target Difficulty: ${difficulty}.
    
    Constraints:
    - Easy: 3-5 nodes, simple synced intervals (e.g., 2000ms, 4000ms).
    - Medium: 5-8 nodes, offset intervals.
    - Hard: 8-12 nodes, complex polyrhythms (prime number intervals like 2300ms).
    
    Nodes must have:
    - id: string
    - x: number (10-90)
    - y: number (10-90)
    - interval: number (1500-5000)
    - offset: number (0-2000)
    - type: 'start' (exactly one), 'end' (exactly one), or 'basic' (rest).
    
    Return ONLY JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  interval: { type: Type.NUMBER },
                  offset: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ['start', 'end', 'basic'] },
                },
                required: ['id', 'x', 'y', 'interval', 'offset', 'type']
              }
            }
          },
          required: ['name', 'description', 'nodes']
        }
      }
    });

    if (!response.text) {
        throw new Error("No response text received");
    }

    const data = JSON.parse(response.text);
    
    // Map basic color logic
    const nodes = data.nodes.map((n: any) => ({
      ...n,
      color: n.type === 'start' ? COLORS.cyan : n.type === 'end' ? COLORS.amber : COLORS.purple
    })) as GameNode[];

    return {
      id: `gen-${Date.now()}`,
      name: data.name,
      description: data.description,
      nodes: nodes
    };

  } catch (error) {
    console.error("Gemini Level Generation Failed:", error);
    return null;
  }
};