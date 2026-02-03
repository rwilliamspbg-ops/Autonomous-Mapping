
export interface CountryData {
  id: string;
  name: string;
  capital: string;
  population: number;
  gdp: string;
  region: string;
  subregion: string;
  flag: string;
}

export interface RiskFactor {
  name: string;
  severity: number;
}

export interface SovereignInsight {
  summary: string;
  politicalStatus: string;
  economicOutlook: string;
  recentEvents: string[];
  keyRisks: RiskFactor[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export enum TrackingState {
  SYSTEM_NOT_READY = -1,
  NO_IMAGES_YET = 0,
  NOT_INITIALIZED = 1,
  OK = 2,
  RECENTLY_LOST = 3,
  LOST = 4
}
