import React from 'react';
import { Match } from '../types';
import { SPORT_ICONS } from '../constants';
import { generateMatchSummary } from '../services/geminiService';

interface MatchCardProps {
  match: Match;
  teamA: string;
  teamB: string;
  isAdmin: boolean;
  onUpdate: (id: string, updates: Partial<Match>) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, teamA, teamB, isAdmin, onUpdate }) => {
  const [loadingAI, setLoadingAI] = React.useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-rose-500 animate-pulse';
      case 'COMPLETED': return 'text-slate-500';
      default: return 'text-indigo-400';
    }
  };


  const handleAISummary = async () => {
    setLoadingAI(true);
    const summary = await generateMatchSummary(match, teamA, teamB);
    onUpdate(match.id, { summary });
    setLoadingAI(false);
  };

  return (
    <div className="glass rounded-[2rem] p-6 transition-all hover:scale-[1.02] duration-300 border border-white/5 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <i className={`fa-solid ${SPORT_ICONS[match.sport] || 'fa-trophy'}`}></i>
          {match.sport}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(match.status)}`}>
          {match.status === 'LIVE' && <i className="fa-solid fa-circle text-[6px] mr-1.5 mb-0.5"></i>}
          {match.status}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex flex-col items-center text-center flex-1">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-xl text-slate-400 mb-3 border border-white/5">
            {teamA.charAt(0)}
          </div>
          <h3 className="font-oswald text-lg font-bold uppercase tracking-tight line-clamp-1 text-white">{teamA}</h3>
        </div>

        <div className="flex flex-col items-center flex-shrink-0">
          <div className="text-4xl font-black font-oswald tabular-nums glory-gradient">
            {match.scoreA} : {match.scoreB}
          </div>
          <div className="text-[9px] text-slate-600 font-black tracking-widest mt-1 uppercase italic">Arena Score</div>
        </div>

        <div className="flex flex-col items-center text-center flex-1">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-xl text-slate-400 mb-3 border border-white/5">
            {teamB.charAt(0)}
          </div>
          <h3 className="font-oswald text-lg font-bold uppercase tracking-tight line-clamp-1 text-white">{teamB}</h3>
        </div>
      </div>

      {match.summary && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-[11px] italic text-slate-300 leading-relaxed text-center">
          <i className="fa-solid fa-bolt text-amber-500 mr-2"></i>
          "{match.summary}"
        </div>
      )}

      {isAdmin && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/5 pt-5">
          <div className="flex w-full gap-2">
            <button
              onClick={() => onUpdate(match.id, { scoreA: match.scoreA + 1, status: 'LIVE' })}
              className="flex-1 py-3 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[9px] font-black uppercase transition-colors"
            >
              +1 {teamA.split(' ')[0]}
            </button>
            <button
              onClick={() => onUpdate(match.id, { scoreB: match.scoreB + 1, status: 'LIVE' })}
              className="flex-1 py-3 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[9px] font-black uppercase transition-colors"
            >
              +1 {teamB.split(' ')[0]}
            </button>
          </div>
          <button
            onClick={() => {
              const newStatus = match.status === 'UPCOMING' ? 'LIVE' : match.status === 'LIVE' ? 'COMPLETED' : 'UPCOMING';
              onUpdate(match.id, { status: newStatus });
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all text-white"
          >
            Switch State: {match.status}
          </button>
          {match.status === 'COMPLETED' && !(match as any).summary && (
            <button
              onClick={handleAISummary}
              disabled={loadingAI}
              className="w-full py-3 glory-bg hover:opacity-90 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 text-white"
            >
              {loadingAI ? 'Dreaming recap...' : 'Generate AI Glory Recap'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};