import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface EnhancedSovereignInsight {
  summary: string;
  riskScore: number;
  threats: string[];
  recommendations: string[];
  politicalStatus?: string;
  economicOutlook?: string;
  recentEvents?: string[];
  keyRisks?: { name: string; severity: number }[];
  sources?: GroundingSource[];
}

const getFallbackInsight = (countryName: string): EnhancedSovereignInsight => ({
  summary: `Strategic analysis for ${countryName}: Localized federated learning deployment focusing on edge privacy and community-led data governance.`,
  riskScore: 42,
  threats: ["Data Silos", "Fragmented Connectivity", "Legacy Infrastructure"],
  recommendations: ["Deploy hardware enclaves", "Implement ZK-rollups for audit logs"],
  politicalStatus: `Strong alignment with local community governance protocols and municipal offices in ${countryName}.`,
  economicOutlook: "Optimized for minimal cloud infrastructure costs by utilizing on-device processing and peer-to-peer data relay.",
  keyRisks: [
    { name: "Connectivity Latency", severity: 25 },
    { name: "Hardware Availability", severity: 35 },
    { name: "Regulatory Compliance", severity: 20 },
    { name: "Local Adoption", severity: 15 }
  ],
  sources: [
    { title: "Federated Learning in Edge Networks", uri: "https://arxiv.org/abs/1908.07873" },
    { title: "Sovereign Data Governance Protocols", uri: "https://www.w3.org/TR/hcls-dataset/" }
  ]
});

export const getSovereignInsights = async (countryName: string): Promise<EnhancedSovereignInsight> => {
  if (!genAI) {
    return getFallbackInsight(countryName);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze the best-fit nonprofit deployment story for ${countryName}. Focus on health access, human-rights, and climate resilience. Format: Strict JSON with summary, riskScore (0-100), threats (array), and recommendations (array).`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text.replace(/\`\`\`json|\`\`\`/g, ''));

    // Fill in missing properties required by CountryPanel visualization to prevent crashes
    return {
      ...getFallbackInsight(countryName),
      ...parsed
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return getFallbackInsight(countryName);
  }
};

export const chatWithAnalyst = async (history: any[], query: string) => {
  if (!genAI) {
    return "This is a demonstration response. In a production environment with a valid API key, I would provide real-time strategic analysis based on your queries about federated learning and global impact.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      })),
    });

    const result = await chat.sendMessage(query);
    return result.response.text();
  } catch (error) {
    console.error("Chat Error:", error);
    return "Analysis engine offline. Please check your connection or API configuration.";
  }
};
