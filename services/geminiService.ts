
import { GoogleGenAI, Type } from "@google/genai";
import { SovereignInsight } from "../types";

// Production Gemini Client initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface EnhancedSovereignInsight extends SovereignInsight {
  sources?: GroundingSource[];
}

export const getSovereignInsight = async (countryName: string): Promise<EnhancedSovereignInsight> => {
  // Use Gemini 3 Flash for rapid production-level intelligence
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `PROD_TASK: Analyze sovereign risk for ${countryName}. 
    CONTEXT: Today is 2025. This data is for the Sovereign Map Mainnet Dashboard.
    REQUIREMENTS: Focus on real-time political stability, recent economic shifts, and spatial-sovereignty risks.
    FORMAT: Strict JSON only.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          politicalStatus: { type: Type.STRING },
          economicOutlook: { type: Type.STRING },
          recentEvents: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }
          },
          keyRisks: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                severity: { type: Type.INTEGER }
              },
              required: ["name", "severity"]
            }
          }
        },
        required: ["summary", "politicalStatus", "economicOutlook", "recentEvents", "keyRisks"]
      }
    }
  });

  const textOutput = response.text || '{}';
  const insight = JSON.parse(textOutput);
  
  // High-fidelity grounding extraction
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const sources: GroundingSource[] = [];
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Verified Intel Source',
          uri: chunk.web.uri
        });
      }
    });
  }

  return { ...insight, sources: sources.slice(0, 5) };
};

export const chatWithAnalyst = async (history: { role: string, content: string }[], query: string) => {
  // Production Chat for the Global Spatial DAO Analyst
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'IDENTITY: Lead Analyst for the Sovereign Map Global Spatial DAO. TASK: Provide technical, objective geopolitical analysis. THEME: Decentralization, spatial sovereignty, and cryptographically verifiable world data. MANDATE: Always use Google Search for up-to-date events.',
      tools: [{ googleSearch: {} }]
    },
  });

  const response = await chat.sendMessage({ message: query });
  return response.text;
};
