import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MutationAnalysis } from "../types";

// Define Schemas (Shared)
const guidelineEntrySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    drugs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of drug names mentioned in guidelines/studies" },
    description: { type: Type.STRING, description: "Scientific explanation of why this is relevant" },
    evidenceLevel: { type: Type.STRING, description: "Source of information (e.g., NCCN Guidelines, Clinical Trial Data)" }
  },
  required: ["drugs", "description", "evidenceLevel"]
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mutationName: { type: Type.STRING, description: "Standardized name (e.g., EGFR L858R)." },
    cancerType: { type: Type.STRING },
    description: { type: Type.STRING, description: "Patient-friendly scientific explanation." },
    clinicalSignificance: { type: Type.STRING },
    analogy: {
      type: Type.OBJECT,
      properties: {
        scenario: { type: Type.STRING, description: "A simple life scenario, preferably a Car." },
        role: { type: Type.STRING, description: "Identify if this gene is the Brake (Tumor Suppressor) or Gas Pedal (Oncogene)." },
        problem: { type: Type.STRING, description: "What happened? e.g., Brake failed or Gas stuck." },
        solution: { type: Type.STRING, description: "Scientific principle of how interventions target this." },
        visualEmoji: { type: Type.STRING, description: "A single emoji representing the situation (e.g., 🚗, 🛑, 🔥)." }
      },
      required: ["scenario", "role", "problem", "solution", "visualEmoji"]
    },
    guidelineMatches: {
      type: Type.OBJECT,
      properties: {
        guideline: { 
          type: Type.ARRAY, 
          items: guidelineEntrySchema,
          description: "Information strictly matching Standard Guidelines (e.g. NCCN/CSCO)." 
        },
        latestClinical: { 
          type: Type.ARRAY, 
          items: guidelineEntrySchema,
          description: "Information from recent clinical research data." 
        },
        frontier: { 
          type: Type.ARRAY, 
          items: guidelineEntrySchema,
          description: "Scientific frontier exploration and theoretical directions." 
        }
      },
      required: ["guideline", "latestClinical", "frontier"]
    },
    knowledge: {
      type: Type.OBJECT,
      properties: {
        mechanism: { type: Type.STRING },
        prognosis: { type: Type.STRING },
        frequency: { type: Type.STRING }
      },
      required: ["mechanism", "prognosis", "frequency"]
    },
    testingReminders: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          advice: { type: Type.STRING },
          importance: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        },
        required: ["category", "advice", "importance"]
      }
    },
    disclaimer: { type: Type.STRING }
  },
  required: ["mutationName", "cancerType", "description", "clinicalSignificance", "analogy", "guidelineMatches", "knowledge", "testingReminders", "disclaimer"]
};

const getEnvApiKey = (): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {}
  return undefined;
};

// --- Prompt Generation Helper ---
const generatePromptText = (input: string, cancerType: string) => `
      Analyze the following input: "${input}".
      The user context/cancer type is: "${cancerType}".
      
      ACT AS A GENOMIC SCIENCE POPULARIZATION ASSISTANT (基因科普助手).
      
      YOUR GOAL: To explain the science behind the mutation and objectively list what current medical guidelines and research say.
      
      CRITICAL DOMAIN RESTRICTION (IMPORTANT):
      1. **SCOPE CHECK**: You are strictly limited to Medical, Biological, Genetic, Pathology, and Oncology topics.
      2. **REFUSAL**: If the user input is NOT related to the above (e.g., "how to cook", "write a poem", "general chat", "weather"), you MUST REFUSE to analyze.
         - In case of irrelevant input, return a JSON with:
           - mutationName: "非相关提问"
           - description: "抱歉，小绿卡专注于肿瘤基因与病理科普。请提供基因突变名称、病理报告或相关医学问题，我将为您提供专业的指南匹配与科普解读。"
           - Fill other text fields with "不适用" (N/A) and arrays with empty [].
           - visualEmoji: "🚫"

      CRITICAL RULES:
      1. **DO NOT PRESCRIBE**. Do not say "I recommend X drug". Instead, say "Guidelines suggest X" or "Studies show effectiveness of Y".
      2. **USE "MATCHING" LANGUAGE**: Instead of "Treatment Options", refer to them as "Guideline Matches" or "Research Data".
      
      CONTENT REQUIREMENTS (If input is valid):
      1. **ANALOGY**: Provide a "Life Analogy" comparing the cell to a Car.
         - Explain the biological mechanism simply (Gas Pedal vs Brake).
         - Explain the *principle* of intervention (e.g., "blocking the fuel line") rather than "prescribing a drug".

      2. **GUIDELINE & RESEARCH MATCHING** (Categorize strictly):
         - **Guideline Consensus**: Strictly NCCN or CSCO Guidelines (Standard of Care).
         - **Clinical Research**: Recent positive data from trials (Phase III/II).
         - **Scientific Frontier**: Early phase mechanisms, novel targets.

      3. **OUTPUT LANGUAGE**: Simplified Chinese (zh-CN).
      4. **FORMAT**: Return purely JSON that matches this structure:
      
      ${JSON.stringify(analysisSchema, null, 2)}
`;

// --- Generic OpenAI-Compatible Handler ---
const callOpenAICompatible = async (
  modelId: string,
  apiKey: string,
  baseUrl: string,
  prompt: string
): Promise<MutationAnalysis> => {
  // Clean base url
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  // Most OpenAI compatible APIs use /chat/completions
  const url = `${cleanBaseUrl}/chat/completions`;

  const payload = {
    model: modelId,
    messages: [
      { role: "system", content: "You are a helpful science education AI assistant. Output valid JSON only." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" } 
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Provider Error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) throw new Error("Empty response from provider");
  
  // Clean markdown json blocks if present
  const jsonStr = content.replace(/```json\n?|\n?```/g, '');
  return JSON.parse(jsonStr);
};

// --- Main Analysis Function ---
export const analyzeMutation = async (
  input: string, 
  cancerType: string, 
  modelId: string = 'gemini-3-pro-preview',
  images: string[] = [],
  userApiKey?: string,
  userBaseUrl?: string
): Promise<MutationAnalysis> => {
  
  const apiKey = userApiKey || getEnvApiKey();
  if (!apiKey) {
    throw new Error("未配置 API Key。请点击右上角设置按钮，填写 API Key。");
  }

  const promptText = generatePromptText(input, cancerType);

  // 1. Handle Gemini Models (Native SDK)
  if (modelId.startsWith('gemini')) {
      const ai = new GoogleGenAI({ apiKey });
      
      const contentParts: any[] = [{ text: promptText }];
      images.forEach(base64Str => {
        const match = base64Str.match(/^data:(.+);base64,(.+)$/);
        if (match) {
            contentParts.push({
                inlineData: { mimeType: match[1], data: match[2] }
            });
        }
      });

      const response = await ai.models.generateContent({
        model: modelId,
        contents: { role: 'user', parts: contentParts },
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          temperature: 0.3,
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from Gemini");
      return JSON.parse(text) as MutationAnalysis;
  } 
  
  // 2. Handle OpenAI Compatible Models (Fetch)
  else {
      // Default Base URL logic if not provided
      let targetBaseUrl = userBaseUrl;
      if(!targetBaseUrl) {
         if (modelId.includes('moonshot')) targetBaseUrl = 'https://api.moonshot.cn/v1';
         else if (modelId.includes('glm')) targetBaseUrl = 'https://open.bigmodel.cn/api/paas/v4';
         else if (modelId.includes('deepseek')) targetBaseUrl = 'https://api.deepseek.com';
         else targetBaseUrl = 'https://api.openai.com/v1';
      }
      
      // Note: Image support for 3rd party requires complex payload construction (Vision API)
      // For now, we append image warning if images exist but using simple text API
      let finalPrompt = promptText;
      if (images.length > 0) {
          finalPrompt += "\n\n[Note: User uploaded images, but this model provider's text-only mode is active. Please analyze based on text input only.]";
      }

      return callOpenAICompatible(modelId, apiKey, targetBaseUrl!, finalPrompt);
  }
};