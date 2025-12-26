import React from 'react';
import { ChatSession } from '../types';
import { MessageSquarePlus, Trash2, History, ShieldCheck, Sprout } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-[280px] bg-slate-900 h-full flex flex-col text-slate-300 border-r border-slate-800 flex-shrink-0 font-sans">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          <MessageSquarePlus className="w-5 h-5" />
          开启新对话
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
        <div className="px-3 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2 mb-2">
            <History className="w-3 h-3" />
            历史记录
        </div>
        
        {sessions.length === 0 && (
            <div className="text-center py-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center opacity-50">
                    <Sprout className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-slate-600 text-sm">暂无历史记录</span>
            </div>
        )}

        {sessions.map(session => (
          <div
            key={session.id}
            className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent ${
              currentSessionId === session.id
                ? 'bg-slate-800 text-white border-slate-700 shadow-sm'
                : 'hover:bg-slate-800/50 hover:text-slate-200 hover:border-slate-800'
            }`}
            onClick={() => onSelectSession(session.id)}
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate text-slate-200">{session.title || '新对话'}</h4>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                 <span className={`px-1.5 py-0.5 rounded-[4px] bg-opacity-20 ${session.cancerType.includes('胰腺') ? 'bg-amber-500 text-amber-300' : 'bg-blue-500 text-blue-300'}`}>
                     {session.cancerType}
                 </span>
                 <span>{new Date(session.lastUpdated).toLocaleDateString()}</span>
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer / Privacy */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 px-2 bg-slate-900/50 py-2 rounded-lg border border-slate-800/50">
            <ShieldCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />
            <span>数据仅存储在本地浏览器，隐私安全。</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;