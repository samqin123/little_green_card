
import { ChatSession, ChatMessage, UserCase, MutationAnalysis } from "../types";
import { supabase } from "./supabase";

const STORAGE_KEY = 'gene_target_chat_history_v2';
const CASES_STORAGE_KEY = 'gene_target_cases';

// --- Local Storage Fallbacks (for guest mode or cache) ---
export const getLocalSessions = (): ChatSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalSession = (session: ChatSession): void => {
  const sessions = getLocalSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  if (index >= 0) sessions[index] = session;
  else sessions.unshift(session);
  sessions.sort((a, b) => b.lastUpdated - a.lastUpdated);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

// --- UserCase Management (Local Storage) ---

/**
 * Get all saved user cases from local storage
 */
const getUserCases = (): UserCase[] => {
  try {
    const data = localStorage.getItem(CASES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Update notes for a specific user case record
 */
export const updateUserCaseNotes = (id: string, notes: string): void => {
  try {
    const cases = getUserCases();
    const index = cases.findIndex(c => c.id === id);
    if (index >= 0) {
      cases[index].notes = notes;
      localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
    }
  } catch (e) {
    console.error("Failed to update case notes", e);
  }
};

/**
 * Delete a specific user case record
 */
export const deleteUserCase = (id: string): void => {
  try {
    const cases = getUserCases();
    const filtered = cases.filter(c => c.id !== id);
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete user case", e);
  }
};

// --- Supabase Cloud Sync ---

export const fetchSessionsFromCloud = async (userId: string): Promise<ChatSession[]> => {
  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select(`
      *,
      messages (*)
    `)
    .eq('user_id', userId)
    .order('last_updated', { ascending: false });

  if (error) throw error;

  return (sessions || []).map(s => ({
    id: s.id,
    title: s.title,
    cancerType: s.cancer_type,
    lastUpdated: new Date(s.last_updated).getTime(),
    messages: (s.messages || []).sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ).map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      images: m.images,
      timestamp: new Date(m.created_at).getTime(),
      // Reconstruct Analysis Result if it exists
      analysisResult: m.mutation_name ? {
        mutationName: m.mutation_name,
        description: m.description,
        clinicalSignificance: m.clinical_significance,
        analogy: m.analogy,
        guidelineMatches: m.guideline_matches,
        knowledge: m.knowledge,
        testingReminders: m.testing_reminders,
        cancerType: s.cancer_type,
        disclaimer: "云端存储记录"
      } as MutationAnalysis : undefined,
      clinicalTrials: m.clinical_trials
    }))
  }));
};

export const createCloudSession = async (userId: string, title: string, cancerType: string) => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ user_id: userId, title, cancer_type: cancerType }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCloudSessionTitle = async (sessionId: string, title: string) => {
  await supabase
    .from('chat_sessions')
    .update({ title, last_updated: new Date().toISOString() })
    .eq('id', sessionId);
};

export const saveCloudMessage = async (sessionId: string, message: ChatMessage) => {
  const payload: any = {
    session_id: sessionId,
    role: message.role,
    content: message.content || "",
    images: message.images || [],
    clinical_trials: message.clinicalTrials || []
  };

  // If it's an assistant message with analysis, flatten it into columns
  if (message.analysisResult) {
    payload.mutation_name = message.analysisResult.mutationName;
    payload.description = message.analysisResult.description;
    payload.clinical_significance = message.analysisResult.clinicalSignificance;
    payload.analogy = message.analysisResult.analogy;
    payload.guideline_matches = message.analysisResult.guidelineMatches;
    payload.knowledge = message.analysisResult.knowledge;
    payload.testing_reminders = message.analysisResult.testingReminders;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCloudSession = async (sessionId: string) => {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);
  if (error) throw error;
};

export const createNewSession = (initialCancerType: string = '胰腺癌'): ChatSession => {
  return {
    id: 'temp-' + Date.now(),
    title: '新对话',
    cancerType: initialCancerType,
    messages: [],
    lastUpdated: Date.now()
  };
};

// --- Legacy local methods for App compat ---
export const getSessions = getLocalSessions;
export const saveSession = saveLocalSession;
export const deleteSession = (id: string) => {
  const sessions = getLocalSessions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};
