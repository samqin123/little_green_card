import React, { useState } from 'react';
import { UserCase } from '../types';
import { updateUserCaseNotes, deleteUserCase } from '../services/storageService';
import AnalysisResult from './AnalysisResult';
import { Trash2, ChevronDown, ChevronUp, FileText, Calendar } from 'lucide-react';

interface CaseManagerProps {
  cases: UserCase[];
  onBack: () => void;
  onRefresh: () => void;
}

const CaseManager: React.FC<CaseManagerProps> = ({ cases, onBack, onRefresh }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleNoteChange = (id: string, value: string) => {
    setEditingNotes({ ...editingNotes, [id]: value });
  };

  const saveNote = (id: string) => {
    if (editingNotes[id] !== undefined) {
      updateUserCaseNotes(id, editingNotes[id]);
      onRefresh(); // Refresh parent state
    }
  };

  const handleDelete = (id: string) => {
    if(window.confirm('确定要删除这条病历记录吗？')) {
        deleteUserCase(id);
        onRefresh();
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">我的病历管理</h2>
        <button onClick={onBack} className="text-teal-600 font-medium hover:underline">
          &larr; 返回分析
        </button>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">暂无保存的病历记录。</p>
          <p className="text-sm text-slate-400">请在分析结果页面点击“保存到病历”添加记录。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((record) => (
            <div key={record.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Header / Summary */}
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(record.id)}
              >
                <div className="flex-1 space-y-1">
                   <div className="flex items-center gap-3 mb-1">
                       <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                           {record.cancerType}
                       </span>
                       <div className="flex items-center gap-1 text-xs text-slate-400">
                           <Calendar className="w-3 h-3" />
                           {new Date(record.timestamp).toLocaleDateString()}
                       </div>
                   </div>
                   <h3 className="text-lg font-bold text-slate-800">{record.mutationInput}</h3>
                   <p className="text-sm text-slate-500 truncate max-w-lg">{record.analysis.description}</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                   {expandedId === record.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === record.id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-6">
                  
                  {/* Follow Up Notes Section */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <h4 className="text-sm font-bold text-amber-800 mb-2">随访记录 & 笔记</h4>
                    <textarea
                      className="w-full p-3 text-sm bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
                      rows={3}
                      placeholder="记录治疗反应、副作用或医生建议..."
                      value={editingNotes[record.id] ?? record.notes}
                      onChange={(e) => handleNoteChange(record.id, e.target.value)}
                    />
                    <div className="flex justify-end mt-2 gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                            className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" /> 删除记录
                        </button>
                        <button 
                            onClick={() => saveNote(record.id)}
                            className="px-4 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                        >
                            保存笔记
                        </button>
                    </div>
                  </div>

                  {/* Original Analysis Display */}
                  <div className="opacity-90 scale-95 origin-top">
                     <AnalysisResult data={record.analysis} hideSaveButton={true} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseManager;