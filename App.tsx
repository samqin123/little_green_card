
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisStatus, MutationAnalysis, ClinicalTrial, ChatSession, ChatMessage } from './types';
import { analyzeMutation } from './services/geminiService';
import { fetchClinicalTrials } from './services/clinicalTrialsService';
import { 
  fetchSessionsFromCloud, 
  createCloudSession, 
  saveCloudMessage, 
  updateCloudSessionTitle,
  deleteCloudSession,
  createNewSession
} from './services/storageService';
import { supabase } from './services/supabase';

import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import ModelSettings from './components/ModelSettings';
import CancerSelector from './components/CancerSelector';
import AnalysisResult from './components/AnalysisResult';
import ClinicalTrialsList from './components/ClinicalTrialsList';
import Auth from './components/Auth';

import { Menu, Sprout, User, Bot, AlertCircle, Sparkles, LogOut, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-pro-preview');
  const [apiKey, setApiKey] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) setIsInitialLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadCloudHistory();
  }, [user]);

  const loadCloudHistory = async () => {
    setIsInitialLoading(true);
    try {
      const cloudSessions = await fetchSessionsFromCloud(user.id);
      setSessions(cloudSessions);
      if (cloudSessions.length > 0) {
        setCurrentSession(cloudSessions[0]);
      } else {
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to load cloud data", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isLoading]);

  const handleNewChat = () => {
    const tempSession = createNewSession();
    setCurrentSession(tempSession);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (id: string) => {
    if (id.startsWith('temp-')) {
       setSessions(prev => prev.filter(s => s.id !== id));
       if (currentSession?.id === id) handleNewChat();
       return;
    }

    if(window.confirm("确定要永久删除此对话吗？云端记录也将被清除。")) {
        try {
          await deleteCloudSession(id);
          const remaining = sessions.filter(s => s.id !== id);
          setSessions(remaining);
          if (currentSession?.id === id) {
              if (remaining.length > 0) setCurrentSession(remaining[0]);
              else handleNewChat();
          }
        } catch (e) {
          alert("删除失败，请重试");
        }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSendMessage = async (text: string, images: string[]) => {
    if (!currentSession || !user) return;

    let targetSessionId = currentSession.id;

    // 1. Create session in cloud if it's a temp one
    if (targetSessionId.startsWith('temp-')) {
      try {
        const title = text.slice(0, 20) || '基因科普对话';
        const newSession = await createCloudSession(user.id, title, currentSession.cancerType);
        targetSessionId = newSession.id;
        
        // Update local state to replace temp session
        const syncedSession: ChatSession = {
          ...currentSession,
          id: targetSessionId,
          title: title,
          lastUpdated: Date.now()
        };
        setCurrentSession(syncedSession);
        setSessions(prev => [syncedSession, ...prev]);
      } catch (e) {
        alert("创建会话失败");
        return;
      }
    }

    // 2. Add and Save User Message
    const userMsg: ChatMessage = {
        id: 'u-' + Date.now(),
        role: 'user',
        content: text,
        images: images,
        timestamp: Date.now()
    };

    setCurrentSession(s => s ? { ...s, messages: [...s.messages, userMsg] } : null);
    await saveCloudMessage(targetSessionId, userMsg);

    setIsLoading(true);

    try {
        const inputToUse = text || (images.length > 0 ? "请分析上传的基因检测报告图片" : "");
        const [analysisData, trialsData] = await Promise.all([
            analyzeMutation(inputToUse, currentSession.cancerType, selectedModel, images, apiKey, baseUrl),
            fetchClinicalTrials(currentSession.cancerType)
        ]);

        const botMsg: ChatMessage = {
            id: 'a-' + Date.now(),
            role: 'assistant',
            analysisResult: analysisData,
            clinicalTrials: trialsData,
            timestamp: Date.now()
        };

        setCurrentSession(s => s ? { ...s, messages: [...s.messages, botMsg] } : null);
        await saveCloudMessage(targetSessionId, botMsg);

        // Update session list with latest message
        setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, lastUpdated: Date.now(), messages: [...s.messages, userMsg, botMsg] } : s));

    } catch (error: any) {
        const errorMsg: ChatMessage = {
            id: 'e-' + Date.now(),
            role: 'assistant',
            error: error.message || "分析服务暂时不可用。",
            timestamp: Date.now()
        };
        setCurrentSession(s => s ? { ...s, messages: [...s.messages, errorMsg] } : null);
    } finally {
        setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-emerald-700 font-medium">同步云端病历中...</p>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <div className="flex h-screen bg-emerald-50/30 overflow-hidden font-sans text-slate-800">
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative z-30 h-full transition-transform duration-300 md:translate-x-0 shadow-xl md:shadow-none`}>
        <Sidebar 
            sessions={sessions}
            currentSessionId={currentSession?.id || null}
            onSelectSession={(id) => {
                const s = sessions.find(s => s.id === id);
                if (s) setCurrentSession(s);
                else if (id.startsWith('temp-')) {} // Keep current temp
                if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            isOpen={true}
        />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col h-full w-full min-w-0 relative">
        <header className="h-16 bg-white/90 backdrop-blur border-b border-emerald-100 flex items-center justify-between px-3 md:px-4 flex-shrink-0 z-10 sticky top-0 shadow-sm">
            <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 -ml-2 hover:bg-emerald-50 rounded-lg transition-colors flex-shrink-0">
                    <Menu className="w-6 h-6 text-emerald-700" />
                </button>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
                        <Sprout className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-sm md:text-base font-bold text-slate-800 leading-none whitespace-nowrap">小绿卡</h1>
                        <span className="text-[9px] md:text-[10px] font-medium text-emerald-600 tracking-wider whitespace-nowrap">云端同步已开启</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
                <ModelSettings 
                    selectedModel={selectedModel}
                    onSelectModel={setSelectedModel}
                    apiKey={apiKey}
                    onApiKeyChange={setApiKey}
                    baseUrl={baseUrl}
                    onBaseUrlChange={setBaseUrl}
                />
                <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="退出登录">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-2 pb-0 sm:p-6 scroll-smooth bg-gradient-to-b from-white to-emerald-50/20">
            <div className="max-w-4xl mx-auto space-y-8 pb-10">
                {(!currentSession || currentSession.messages.length === 0) && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-700 p-4">
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
                            <div className="bg-white p-6 rounded-3xl shadow-xl border border-emerald-100 relative">
                                <Sprout className="w-16 h-16 text-emerald-500" />
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
                            点亮 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">科学认知</span>
                        </h1>
                        <p className="text-slate-600 mb-10 max-w-lg mx-auto text-center text-base md:text-lg leading-relaxed">
                            欢迎回来 {user.email}。数据将安全同步至云端。
                        </p>
                        <div className="w-full max-w-md">
                             <CancerSelector 
                                selectedType={currentSession?.cancerType || '胰腺癌'} 
                                onSelect={(type) => setCurrentSession(s => s ? {...s, cancerType: type} : null)} 
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                )}

                {currentSession?.messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md border-2 border-white">
                                <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        )}
                        <div className={`max-w-[95%] sm:max-w-[85%] space-y-2`}>
                            <div className={`${msg.role === 'user' ? 'bg-slate-800 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-lg' : 'w-full'}`}>
                                {msg.images && msg.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2 justify-end">
                                        {msg.images.map((img, idx) => (
                                            <img key={idx} src={img} alt="uploaded" className="h-24 sm:h-32 rounded-xl border-2 border-white/20 shadow-sm" />
                                        ))}
                                    </div>
                                )}
                                {msg.content && <div className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</div>}
                                {msg.error && (
                                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                        <div><p className="font-bold text-sm mb-1">分析服务中断</p><p className="text-sm opacity-90">{msg.error}</p></div>
                                    </div>
                                )}
                                {msg.analysisResult && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-2">
                                        <AnalysisResult data={msg.analysisResult} hideSaveButton={true} />
                                    </div>
                                )}
                                {msg.clinicalTrials && msg.clinicalTrials.length > 0 && (
                                    <div className="mt-6"><ClinicalTrialsList trials={msg.clinicalTrials} cancerType={currentSession?.cancerType || ''} /></div>
                                )}
                            </div>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                <User className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 animate-pulse px-2">
                         <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1 border border-emerald-200">
                            <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                        </div>
                        <div className="bg-white border border-emerald-100 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm flex items-center gap-3">
                             <div className="flex space-x-1.5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-sm text-emerald-700 font-medium">正在检索云端数据并解析突变...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
        </div>

        <div className="bg-white/80 backdrop-blur border-t border-emerald-100 p-2 flex-shrink-0 z-10 relative shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} placeholder={currentSession?.messages.length === 0 ? `输入突变 (如 EGFR)，匹配 ${currentSession.cancerType} 科普信息...` : "继续咨询..."} />
        </div>
      </div>
    </div>
  );
};

export default App;
