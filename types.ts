
export interface GuidelineEntry {
  drugs: string[];
  description: string;
  evidenceLevel: string; // e.g., "NCCN Cat 1", "Phase III", "Pre-clinical"
}

export interface GuidelineMatches {
  guideline: GuidelineEntry[];    // 指南推荐
  latestClinical: GuidelineEntry[]; // 临床最新
  frontier: GuidelineEntry[];     // 前沿探索
}

export interface Analogy {
  scenario: string; // e.g., "Driving a car on a highway"
  role: string;     // e.g., "The Gas Pedal (Oncogene)" vs "The Brake (Tumor Suppressor)"
  problem: string;  // e.g., "The gas pedal is stuck down"
  solution: string; // e.g., "Cutting the fuel line"
  visualEmoji: string; 
}

export interface TestingReminder {
  category: string;
  advice: string;
  importance: 'High' | 'Medium' | 'Low';
}

export interface MutationAnalysis {
  mutationName: string;
  cancerType: string;
  description: string;
  clinicalSignificance: string;
  analogy: Analogy; // New Analogy Section
  guidelineMatches: GuidelineMatches; // Renamed from treatments
  knowledge: {
    mechanism: string;
    prognosis: string;
    frequency: string;
  };
  testingReminders: TestingReminder[];
  disclaimer: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ClinicalTrial {
  nctId: string;
  briefTitle: string;
  organization: string;
  status: string;
  summary: string;
  locations?: string[];
  lastUpdateSubmitDate?: string;
  conditions?: string[];
  interventions?: string[];
  phases?: string[];
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  contextWindow: string;
  defaultBaseUrl?: string;
  apiKeyUrl?: string;
}

// --- New Chat Architecture ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  images?: string[];
  analysisResult?: MutationAnalysis; // If role is assistant
  clinicalTrials?: ClinicalTrial[];  // If role is assistant
  timestamp: number;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  cancerType: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

export interface UserCase {
  id: string;
  timestamp: number;
  cancerType: string;
  mutationInput: string;
  analysis: MutationAnalysis;
  notes?: string;
}