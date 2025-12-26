import React from 'react';
import { MutationAnalysis, GuidelineEntry } from '../types';
import { Pill, Activity, BookOpen, AlertCircle, CheckCircle2, Save, Zap, ShieldCheck, Lightbulb, Car, HeartPulse } from 'lucide-react';

interface AnalysisResultProps {
  data: MutationAnalysis;
  onSave?: () => void;
  hideSaveButton?: boolean;
}

const InfoCard: React.FC<{ title: string; items: GuidelineEntry[]; icon: React.ReactNode; colorClass: string; badge: string }> = ({ title, items, icon, colorClass, badge }) => (
  <div className="flex-1 min-w-[280px] bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
    <div className={`px-4 py-3 border-b border-slate-50 flex items-center justify-between ${colorClass}`}>
      <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wide opacity-60 bg-white/50 px-2 py-0.5 rounded-full">{badge}</span>
    </div>
    <div className="p-4 space-y-3 flex-1">
      {items.length === 0 ? (
         <div className="h-full flex flex-col items-center justify-center text-slate-400 py-4">
             <span className="text-xs italic">暂无相关信息</span>
         </div>
      ) : (
        items.map((t, i) => (
          <div key={i} className="bg-slate-50/80 rounded-lg p-3 border border-slate-100 hover:border-emerald-200 transition-colors">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {t.drugs.map((d, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-bold text-emerald-700 shadow-sm">
                  {d}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">{t.description}</p>
            <div className="flex justify-end">
              <span className="px-2 py-0.5 bg-slate-200/50 text-slate-500 text-[10px] rounded font-medium">
                {t.evidenceLevel}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onSave, hideSaveButton = false }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Main Green Card Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-1 shadow-lg shadow-emerald-100">
          <div className="bg-white rounded-xl p-6 relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-start">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wider uppercase border border-emerald-200">
                        {data.cancerType}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <HeartPulse className="w-3 h-3" /> 基因科普分析
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{data.mutationName}</h2>
                    <p className="text-base text-slate-600 leading-relaxed border-l-4 border-emerald-500 pl-4 bg-emerald-50/30 py-2 rounded-r-lg">
                        {data.description}
                    </p>
                </div>

                <div className="md:w-1/3 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                    <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-2 text-sm">
                        <Activity className="w-4 h-4 text-amber-500" />
                        生物学意义
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{data.clinicalSignificance}</p>
                </div>
            </div>

            {!hideSaveButton && onSave && (
                <button 
                    onClick={onSave}
                    className="absolute top-4 right-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-2 rounded-lg transition-all"
                >
                    <Save className="w-4 h-4" />
                </button>
            )}
          </div>
      </div>

      {/* Life Analogy Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-indigo-100/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="absolute -right-6 -top-6 opacity-10 transform rotate-12 transition-transform group-hover:scale-110 duration-700">
            <Car className="w-48 h-48 text-indigo-600" />
        </div>
        <div className="relative z-10">
          <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-900 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            原理科普 (Life Analogy)
          </h3>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
             <div className="text-5xl filter drop-shadow-sm bg-white w-20 h-20 flex items-center justify-center rounded-full shadow-inner">
                 {data.analogy.visualEmoji}
             </div>
             <div className="flex-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-indigo-100 shadow-sm">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">场景设定</span>
                        <p className="text-indigo-900 text-sm font-medium">{data.analogy.scenario}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-indigo-100 shadow-sm">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">角色/故障</span>
                        <p className="text-indigo-900 text-sm font-medium">{data.analogy.role}: {data.analogy.problem}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-indigo-100 shadow-sm">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">干预原理</span>
                        <p className="text-indigo-900 text-sm font-medium">{data.analogy.solution}</p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Categorized Matches */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="bg-emerald-100 p-1.5 rounded-lg">
             <Pill className="w-4 h-4 text-emerald-700" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">基于指南与共识的科普信息</h3>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <InfoCard 
            title="指南共识" 
            badge="Guidelines"
            items={data.guidelineMatches.guideline} 
            icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
            colorClass="bg-emerald-50/50"
          />
          <InfoCard 
            title="临床研究数据" 
            badge="Clinical Data"
            items={data.guidelineMatches.latestClinical} 
            icon={<Zap className="w-4 h-4 text-blue-600" />}
            colorClass="bg-blue-50/50"
          />
          <InfoCard 
            title="前沿科学探索" 
            badge="Frontier"
            items={data.guidelineMatches.frontier} 
            icon={<BookOpen className="w-4 h-4 text-amber-600" />}
            colorClass="bg-amber-50/50"
          />
        </div>
      </div>

      {/* Knowledge & Reminders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scientific Knowledge */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-bold text-slate-800">突变百科</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                 <div className="w-16 shrink-0 text-xs font-bold text-slate-400 text-right">机制</div>
                 <p className="text-sm text-slate-700">{data.knowledge.mechanism}</p>
              </div>
              <div className="flex gap-3">
                 <div className="w-16 shrink-0 text-xs font-bold text-slate-400 text-right">预后</div>
                 <p className="text-sm text-slate-700">{data.knowledge.prognosis}</p>
              </div>
              <div className="flex gap-3">
                 <div className="w-16 shrink-0 text-xs font-bold text-slate-400 text-right">频率</div>
                 <p className="text-sm text-slate-700">{data.knowledge.frequency}</p>
              </div>
            </div>
          </div>

          {/* Testing Reminders */}
          <div className="bg-emerald-50/40 rounded-2xl p-6 shadow-sm border border-emerald-100/50">
            <div className="flex items-center gap-2 mb-4 border-b border-emerald-100 pb-2">
              <AlertCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-emerald-900">检测相关提醒</h3>
            </div>
            <ul className="space-y-3">
              {data.testingReminders.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-emerald-50 shadow-sm">
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    item.importance === 'High' ? 'text-rose-500' : 'text-emerald-500'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-500">{item.category}</span>
                        {item.importance === 'High' && <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 rounded font-bold">重要</span>}
                    </div>
                    <p className="text-sm text-slate-800 font-medium">{item.advice}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 max-w-3xl mx-auto leading-normal">
          <strong>免责声明:</strong> {data.disclaimer} 本应用仅提供科学普及与信息检索，结果基于公开指南与研究数据，**不构成任何医疗建议**。请务必咨询专业医生制定治疗方案。
        </p>
      </div>
    </div>
  );
};

export default AnalysisResult;