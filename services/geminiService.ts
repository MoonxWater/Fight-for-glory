import { GoogleGenAI } from "@google/genai";
import { Match, Participant } from "../types";

export const generateMatchSummary = async (match: Match, teamA: Participant, teamB: Participant): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Write a short, exciting sports recap (max 15 words) for a ${match.sport} match in the "Fight for Glory" fest at Maulana Azad College. 
    Score: ${teamA.name} ${match.scoreA} vs ${teamB.name} ${match.scoreB}. Use a punchy tone.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    return response.text || "A legendary battle concluded in the arena!";
  } catch (error) {
    console.error("Gemini recap failed:", error);
    return "Great sportsmanship shown by both sides!";
  }
};