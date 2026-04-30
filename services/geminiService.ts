
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
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `TASK: Analyze the best-fit nonprofit deployment story for ${countryName}.
    CONTEXT: This is a donor-facing demo for privacy-preserving federated learning.
    REQUIREMENTS: Focus on health access, human-rights reporting, climate resilience, local trust, and why on-device training matters.
    FORMAT: Strict JSON only.
    TONE: Concrete, optimistic, and accessible to non-technical funders.`,
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
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'IDENTITY: Impact analyst for the Sovereign Map federated learning demo. TASK: Explain privacy-preserving AI in plain language for non-profit funders. THEME: Local data stays local, model updates are verified, and global coordination improves access in health, rights, and climate programs. MANDATE: Prefer practical, human-centered explanations.',
      tools: [{ googleSearch: {} }]
    },
  });

  const response = await chat.sendMessage({ message: query });
  return response.text;
};
