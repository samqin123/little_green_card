import React, { useState, useEffect } from 'react';
import { Settings2, Cpu, Key, ExternalLink, X, Globe } from 'lucide-react';
import { AIModelConfig } from '../types';

interface ModelSettingsProps {
  selectedModel: string;
  onSelectModel: (id: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  baseUrl: string;
  onBaseUrlChange: (url: string) => void;
}

const AVAILABLE_MODELS: AIModelConfig[] = [
  { 
    id: 'gemini-3-pro-preview', 
    name: 'Gemini 3.0 Pro', 
    provider: 'Google', 
    contextWindow: '2M',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey'
  },
  { 
    id: 'gemini-2.5-flash', 
    name: 'Gemini 2.5 Flash', 
    provider: 'Google', 
    contextWindow: '1M',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey'
  },
  { 
    id: 'moonshot-v1-8k', 
    name: 'Kimi (Moonshot)', 
    provider: 'Moonshot AI', 
    contextWindow: '8k',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    apiKeyUrl: 'https://platform.moonshot.cn/console/api-keys'
  },
  { 
    id: 'glm-4', 
    name: 'GLM-4', 
    provider: 'Zhipu AI', 
    contextWindow: '128k',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKeyUrl: 'https://open.bigmodel.cn/usercenter/apikeys'
  },
  { 
    id: 'deepseek-chat', 
    name: 'DeepSeek V3', 
    provider: 'DeepSeek', 
    contextWindow: '64k',
    defaultBaseUrl: 'https://api.deepseek.com',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys'
  },
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    provider: 'OpenAI', 
    contextWindow: '128k',
    defaultBaseUrl: 'https://api.openai.com/v1',
    apiKeyUrl: 'https://platform.openai.com/api-keys'
  },
];

const ModelSettings: React.FC<ModelSettingsProps> = ({ 
  selectedModel, 
  onSelectModel, 
  apiKey, 
  onApiKeyChange,
  baseUrl,
  onBaseUrlChange
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const currentModelConfig = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  // When model selection changes, load the saved key/url for that specific provider if available
  const handleModelChange = (newModelId: string) => {
    const config = AVAILABLE_MODELS.find(m => m.id === newModelId);
    if (!config) return;

    onSelectModel(newModelId);
    
    // Load saved config for this provider from localStorage to repopulate parent state
    const storageKey = `gt_config_${config.provider}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
        const { key, url } = JSON.parse(savedData);
        onApiKeyChange(key || '');
        onBaseUrlChange(url || config.defaultBaseUrl || '');
    } else {
        onApiKeyChange('');
        onBaseUrlChange(config.defaultBaseUrl || '');
    }
  };

  // Save config to local storage whenever inputs change
  useEffect(() => {
      if (currentModelConfig) {
          const storageKey = `gt_config_${currentModelConfig.provider}`;
          localStorage.setItem(storageKey, JSON.stringify({
              key: apiKey,
              url: baseUrl
          }));
      }
  }, [apiKey, baseUrl, currentModelConfig]);

  return (
    <div className="mb-0">
        {/* Toolbar */}
        <div className="flex items-center justify-end gap-3">
           <div className="flex items-center gap-2 bg-emerald-50/50 border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm">
                <Settings2 className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-medium text-emerald-800">模型:</label>
                <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-emerald-700 outline-none cursor-pointer max-w-[120px] sm:max-w-none"
                >
                {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.name}
                    </option>
                ))}
                </select>
            </div>
            
            <button 
                onClick={() => setIsConfigOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${apiKey ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
            >
                <Key className="w-3 h-3" />
                <span className="text-xs font-bold hidden sm:inline">{apiKey ? '已配置' : '未配置 Key'}</span>
            </button>
        </div>

        {/* Settings Modal */}
        {isConfigOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-emerald-100">
                    <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-emerald-50/30">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-emerald-600" />
                            模型配置 ({currentModelConfig.provider})
                        </h3>
                        <button onClick={() => setIsConfigOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Model Info */}
                         <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                            <Cpu className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-emerald-800 mb-1">
                                    当前选择: {currentModelConfig.name}
                                </h4>
                                <p className="text-[10px] text-emerald-600 leading-relaxed">
                                    {currentModelConfig.provider === 'Google' 
                                        ? '官方 Gemini 接口，多模态能力最强。' 
                                        : '兼容 OpenAI 格式接口。请确保 BaseURL 正确。'}
                                </p>
                            </div>
                        </div>

                        {/* API Key Section */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-baseline">
                                <label className="block text-sm font-bold text-slate-700">
                                    API Key <span className="text-red-500">*</span>
                                </label>
                                <a 
                                    href={currentModelConfig.apiKeyUrl}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold hover:underline bg-indigo-50 px-2 py-1 rounded-md"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    申请 {currentModelConfig.provider} Key
                                </a>
                            </div>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    value={apiKey}
                                    onChange={(e) => onApiKeyChange(e.target.value)}
                                    placeholder={`sk-... (${currentModelConfig.provider} Key)`}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono text-slate-800 transition-all"
                                />
                                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            </div>
                        </div>

                        {/* Base URL Section */}
                        <div className="space-y-3">
                             <div className="flex justify-between items-baseline">
                                <label className="block text-sm font-bold text-slate-700">
                                    Base URL (API 地址)
                                </label>
                                <button 
                                    onClick={() => onBaseUrlChange(currentModelConfig.defaultBaseUrl || '')}
                                    className="text-[10px] text-slate-500 hover:text-emerald-600 hover:underline"
                                >
                                    恢复默认
                                </button>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={baseUrl}
                                    onChange={(e) => onBaseUrlChange(e.target.value)}
                                    placeholder="https://api.example.com/v1"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono text-slate-800 transition-all"
                                />
                                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            </div>
                             <p className="text-[10px] text-slate-400">
                                默认地址: {currentModelConfig.defaultBaseUrl}
                            </p>
                        </div>

                        <button 
                            onClick={() => setIsConfigOpen(false)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200"
                        >
                            保存配置
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ModelSettings;