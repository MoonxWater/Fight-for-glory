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
  onDelete: (id: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, teamA, teamB, isAdmin, onUpdate, onDelete }) => {
  const [loadingAI, setLoadingAI] = React.useState(false);
  const [isUpdateMode, setIsUpdateMode] = React.useState(false);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'COMPLETED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'UPCOMING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getMatchTypeStyle = (matchType?: string) => {
    switch (matchType?.toLowerCase()) {
      case 'eliminator': return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'quarter final': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      case 'semi final': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'final': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  const showDropdown = (currentValue: string, options: string[], label: string, onUpdateValue: (value: string) => void) => {
    const select = document.createElement('select');
    select.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-slate-900 text-white border border-slate-700 rounded-xl p-4 min-w-[200px] outline-none shadow-2xl transition-all";

    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      select.appendChild(opt);
    });

    select.value = currentValue;

    const overlay = document.createElement('div');
    overlay.className = "fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity";

    const close = () => {
      if (document.body.contains(select)) document.body.removeChild(select);
      if (document.body.contains(overlay)) document.body.removeChild(overlay);
    };

    select.onchange = () => {
      onUpdateValue(select.value);
      close();
    };

    overlay.onclick = close;

    document.body.appendChild(overlay);
    document.body.appendChild(select);
    select.focus();
  };

  const handleDetailUpdate = (field: string, value: any) => {
    if (isUpdateMode && isAdmin) {
      onUpdate(match.id, { details: { ...match.details, [field]: value } });
    }
  };

  const renderSportDetails = () => {
    if (!match.details) return null;
    const details = match.details;

    return (
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(details).map(([key, value]) => {
            if (['batchA', 'batchB', 'matchType', 'winner', 'currentInnings', 'currentPeriod', 'completed'].includes(key)) return null;

            return (
              <div
                key={key}
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newVal = prompt(`Update ${key}:`, String(value));
                    if (newVal !== null) handleDetailUpdate(key, isNaN(Number(newVal)) ? newVal : Number(newVal));
                  }
                }}
                className={`p-3 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col justify-center transition-all ${isUpdateMode && isAdmin ? 'cursor-pointer hover:border-rose-500/30 hover:bg-slate-800' : ''}`}
              >
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-orbitron font-bold text-white uppercase text-xs">
                  {key.toLowerCase().includes('innings') && (String(value).toUpperCase() === 'TEAMA' || String(value).toUpperCase() === 'TEAMB')
                    ? (String(value).toUpperCase() === 'TEAMA' ? teamA : teamB)
                    : String(value)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          {['currentInnings', 'currentPeriod', 'completed'].map(key => {
            const value = (details as any)[key];
            if (value === undefined) return null;

            return (
              <div
                key={key}
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const options = key === 'currentInnings' ? [teamA, teamB] :
                      key === 'currentPeriod' ? ['1st Half', '2nd Half', 'Extra'] :
                        ['True', 'False'];
                    showDropdown(String(value), options, key, (val) => {
                      let finalVal: any = val;
                      if (key === 'currentInnings') finalVal = val === teamA ? 'TeamA' : 'TeamB';
                      if (key === 'completed') finalVal = val === 'True';
                      handleDetailUpdate(key, finalVal);
                    });
                  }
                }}
                className={`flex justify-between items-center p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-rose-500/10 transition-colors' : ''}`}
              >
                <span className="text-[8px] font-black text-rose-500/70 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-orbitron font-bold text-rose-400 uppercase text-xs">
                  {key === 'currentInnings' ?
                    (String(value).toUpperCase() === 'TEAMA' ? teamA :
                      String(value).toUpperCase() === 'TEAMB' ? teamB : String(value)) : String(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="group relative">
      <div className={`glass rounded-[2.5rem] p-6 border border-white/5 transition-all duration-500 hover:border-rose-500/30 flex flex-col h-full ${isUpdateMode ? 'ring-2 ring-amber-500/50 shadow-2xl shadow-amber-900/10 cursor-default' : 'hover:scale-[1.01] hover:shadow-2xl hover:shadow-rose-900/10'}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(match.status)} ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-white/10' : ''}`}
                onClick={() => {
                  if (isAdmin && isUpdateMode) {
                    showDropdown(match.status, ['UPCOMING', 'LIVE', 'COMPLETED'], 'Status', (s) => onUpdate(match.id, { status: s as any }));
                  }
                }}
              >
                {match.status === 'LIVE' && <span className="inline-block w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse mr-1.5"></span>}
                {match.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-800/50 text-slate-400 border border-white/5 flex items-center gap-1.5`}>
                <i className={`fa-solid ${match.gender?.toLowerCase() === 'boys' ? 'fa-mars text-blue-400' : 'fa-venus text-pink-400'} text-[8px]`}></i>
                {match.gender}
              </span>
            </div>
            <div
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  showDropdown(match.venue || '', ['Playground-1', 'Playground-2', 'Playground-3', 'Playground-4', 'Seminar-Hall'], 'Venue', (v) => onUpdate(match.id, { venue: v }));
                }
              }}
              className={`flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1 mt-2 ${isUpdateMode && isAdmin ? 'cursor-pointer hover:text-slate-300' : ''}`}
            >
              <i className="fa-solid fa-location-dot text-rose-500 text-[8px]"></i>
              {match.venue}
            </div>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsUpdateMode(!isUpdateMode)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isUpdateMode ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                >
                  <i className="fa-solid fa-pen-to-square text-xs"></i>
                </button>
                <button
                  onClick={() => onDelete(match.id)}
                  className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-6 my-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between group/team">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-orbitron text-xl font-black uppercase tracking-tighter text-white group-hover/team:glory-gradient transition-colors truncate max-w-[150px]">
                    {teamA}
                  </h3>
                  {match.status === 'COMPLETED' && (
                    String(match.details?.winner).toUpperCase() === 'TEAMA' ||
                    String(match.details?.winner).toUpperCase() === teamA.toUpperCase()
                  ) && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] animate-in fade-in zoom-in duration-500">
                        <i className="fa-solid fa-crown text-amber-400 text-[10px] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"></i>
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.1em]">WINNER</span>
                      </div>
                    )}
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Batch {match.batchA || 'N/A'}
                </span>
              </div>
              <div
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const s = prompt(`Score for ${teamA}:`, String(match.scoreA));
                    if (s !== null && !isNaN(Number(s))) onUpdate(match.id, { scoreA: Number(s) });
                  }
                }}
                className={`font-orbitron text-3xl font-black transition-all ${isUpdateMode && isAdmin ? 'text-rose-500 animate-pulse cursor-pointer' : 'text-white'}`}
              >
                {match.scoreA}
              </div>
            </div>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <div className="flex items-center justify-between group/team">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-orbitron text-xl font-black uppercase tracking-tighter text-white group-hover/team:glory-gradient transition-colors truncate max-w-[150px]">
                    {teamB}
                  </h3>
                  {match.status === 'COMPLETED' && (
                    String(match.details?.winner).toUpperCase() === 'TEAMB' ||
                    String(match.details?.winner).toUpperCase() === teamB.toUpperCase()
                  ) && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] animate-in fade-in zoom-in duration-500">
                        <i className="fa-solid fa-crown text-amber-400 text-[10px] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"></i>
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.1em]">WINNER</span>
                      </div>
                    )}
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Batch {match.batchB || 'N/A'}
                </span>
              </div>
              <div
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const s = prompt(`Score for ${teamB}:`, String(match.scoreB));
                    if (s !== null && !isNaN(Number(s))) onUpdate(match.id, { scoreB: Number(s) });
                  }
                }}
                className={`font-orbitron text-3xl font-black transition-all ${isUpdateMode && isAdmin ? 'text-rose-500 animate-pulse cursor-pointer' : 'text-white'}`}
              >
                {match.scoreB}
              </div>
            </div>
          </div>
        </div>

        {match.details?.matchType && (
          <div className="mt-4">
            <div
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  showDropdown(match.details?.matchType || '', ['Eliminator', 'Quarter Final', 'Semi Final', 'Final'], 'Competition', (t) => handleDetailUpdate('matchType', t));
                }
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${getMatchTypeStyle(match.details.matchType)} ${isUpdateMode && isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              <i className="fa-solid fa-trophy text-[9px]"></i>
              <span className="text-[9px] font-black uppercase tracking-widest">{match.details.matchType}</span>
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-white/5 pt-4">
          <div className="flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-2">
              <i className={`fa-solid ${SPORT_ICONS[match.sport] || 'fa-trophy'} text-rose-500 text-xs`}></i>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{match.sport}</span>
            </div>
            {match.status === 'COMPLETED' && match.details?.winner && isAdmin && isUpdateMode && (
              <div
                onClick={() => {
                  showDropdown(match.details?.winner || '', [teamA, teamB, 'Draw'], 'Winner', (w) => {
                    const val = w === teamA ? 'TeamA' : w === teamB ? 'TeamB' : w;
                    handleDetailUpdate('winner', val);
                  });
                }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-pointer hover:bg-amber-500/30 transition-all text-[9px] font-black uppercase tracking-widest"
              >
                <i className="fa-solid fa-pen-to-square"></i>
                Edit Winner
              </div>
            )}
          </div>

          {renderSportDetails()}
        </div>
      </div>
    </div>
  );
};