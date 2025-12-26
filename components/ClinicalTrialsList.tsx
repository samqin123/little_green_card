import React from 'react';
import { ClinicalTrial } from '../types';
import { ExternalLink, Beaker, MapPin, Calendar, ArrowRight, Activity, Pill, Flag, Microscope } from 'lucide-react';

interface ClinicalTrialsListProps {
  trials: ClinicalTrial[];
  cancerType: string;
}

const ClinicalTrialsList: React.FC<ClinicalTrialsListProps> = ({ trials, cancerType }) => {
  if (trials.length === 0) return null;

  const getMoreLink = () => {
    const term = cancerType.includes('胰腺') ? 'Pancreatic Cancer' : 'Lung Cancer';
    return `https://clinicaltrials.gov/search?cond=${encodeURIComponent(term)}&aggFilters=status:rec`;
  };

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 p-1.5 rounded-lg">
            <Microscope className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            最新临床试验 (Recruiting)
          </h3>
        </div>
        <a 
            href={getMoreLink()}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
        >
            全部结果 <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      
      <div className="space-y-4">
        {trials.map((trial) => (
          <div key={trial.nctId} className="bg-white rounded-xl p-5 shadow-sm border border-emerald-50 hover:shadow-md hover:border-emerald-200 transition-all group relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
            
            {/* Header: Status & Phases */}
            <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                    {trial.status.replace(/_/g, ' ')}
                </span>
                {trial.phases && trial.phases.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {trial.phases.join(', ')}
                    </span>
                )}
                <span className="text-[10px] text-slate-400 ml-auto font-mono">{trial.nctId}</span>
            </div>
            
            {/* Title */}
            <a 
              href={`https://clinicaltrials.gov/study/${trial.nctId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-base font-bold text-emerald-800 group-hover:text-emerald-600 group-hover:underline mb-3 leading-snug"
            >
              {trial.briefTitle}
            </a>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs mb-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                {/* Conditions */}
                {trial.conditions && trial.conditions.length > 0 && (
                    <div className="col-span-1">
                        <span className="font-bold text-slate-500 flex items-center gap-1.5 mb-1">
                            <Activity className="w-3 h-3 text-emerald-400" /> Conditions
                        </span>
                        <p className="text-slate-700 line-clamp-1">{trial.conditions.join(', ')}</p>
                    </div>
                )}

                {/* Interventions */}
                {trial.interventions && trial.interventions.length > 0 && (
                    <div className="col-span-1">
                        <span className="font-bold text-slate-500 flex items-center gap-1.5 mb-1">
                            <Pill className="w-3 h-3 text-emerald-400" /> Interventions
                        </span>
                        <p className="text-slate-700 line-clamp-1">{trial.interventions.join(', ')}</p>
                    </div>
                )}

                {/* Locations */}
                {trial.locations && trial.locations.length > 0 && (
                    <div className="col-span-1 md:col-span-2">
                        <span className="font-bold text-slate-500 flex items-center gap-1.5 mb-1">
                            <MapPin className="w-3 h-3 text-emerald-400" /> Locations
                        </span>
                        <p className="text-slate-600">{trial.locations.slice(0, 3).join(' | ')} {trial.locations.length > 3 && `+${trial.locations.length - 3} more`}</p>
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between text-[10px] text-slate-400">
               <div className="flex items-center gap-4">
                   <span className="flex items-center gap-1">
                        <Flag className="w-3 h-3" /> {trial.organization}
                   </span>
               </div>
               <div className="flex items-center gap-1">
                   <Calendar className="w-3 h-3" />
                   Updated: {trial.lastUpdateSubmitDate || 'Recent'}
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <a 
            href={getMoreLink()}
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-6 py-2.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-full shadow-sm hover:shadow-md text-sm font-bold transition-all"
        >
            查看更多 {cancerType} 临床试验
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default ClinicalTrialsList;