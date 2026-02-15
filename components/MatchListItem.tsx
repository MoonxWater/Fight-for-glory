import React, { useState } from 'react';
import { Match } from '../types';

interface MatchListItemProps {
  match: Match;
  teamA: string;
  teamB: string;
  isAdmin: boolean;
  onUpdate: (matchId: string, updates: Partial<Match>) => void;
  onDelete?: (matchId: string) => void;
}

export const MatchListItem: React.FC<MatchListItemProps> = ({
  match,
  teamA,
  teamB,
  isAdmin,
  onUpdate,
  onDelete
}) => {
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getGenderStyle = (gender: string) => {
    switch (gender) {
      case 'boys': return 'text-blue-400';
      case 'girls': return 'text-pink-400';
      default: return 'text-slate-400';
    }
  };

  const handleStatusClick = () => {
    if (isUpdateMode && isAdmin) {
      const statuses: ('UPCOMING' | 'LIVE' | 'COMPLETED')[] = ['UPCOMING', 'LIVE', 'COMPLETED'];
      const currentIndex = statuses.indexOf(match.status as any);
      const nextStatus = statuses[(currentIndex + 1) % statuses.length];
      onUpdate(match.id, { status: nextStatus });
    }
  };

  const handleDetailUpdate = (field: string, value: any) => {
    if (isUpdateMode && isAdmin) {
      onUpdate(match.id, { details: { ...match.details, [field]: value } });
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
      document.body.removeChild(select);
      document.body.removeChild(overlay);
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

  return (
    <div className="group relative">
      <div className={`glass rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-rose-500/30 ${isExpanded ? 'shadow-2xl shadow-rose-900/10 scale-[1.01]' : 'hover:scale-[1.005]'}`}>
        {/* Main Content Area */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Status & Category Side */}
          <div className="flex flex-row md:flex-col items-center justify-center gap-4 min-w-[100px]">
            <div
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  showDropdown(match.status, ['UPCOMING', 'LIVE', 'COMPLETED'], 'Status', (s) => onUpdate(match.id, { status: s as any }));
                }
              }}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(match.status)} ${isUpdateMode && isAdmin ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
            >
              {match.status === 'LIVE' && <span className="inline-block w-2 h-2 bg-rose-500 rounded-full animate-pulse mr-2"></span>}
              {match.status}
            </div>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${getGenderStyle(match.gender)}`}>
              <i className={`fa-solid ${match.gender === 'boys' ? 'fa-mars' : 'fa-venus'}`}></i>
              {match.gender}
            </div>
          </div>

          {/* Teams & Score Center */}
          <div className="flex-1 w-full grid grid-cols-[1fr,auto,1fr] items-center gap-4 md:gap-8">
            {/* Team A */}
            <div className="text-right space-y-2">
              <div className="flex items-center justify-end gap-2">
                {match.status === 'COMPLETED' && (
                  String(match.details?.winner).toUpperCase() === 'TEAMA' ||
                  String(match.details?.winner).toUpperCase() === teamA.toUpperCase()
                ) && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 animate-in fade-in slide-in-from-right duration-500">
                      <i className="fa-solid fa-crown text-amber-400 text-[12px] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"></i>
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.1em]">WINNER</span>
                    </div>
                  )}
                <h3 className="font-orbitron text-xl md:text-2xl font-black uppercase tracking-tighter text-white group-hover:glory-gradient transition-colors truncate">
                  {teamA}
                </h3>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                BATCH {match.batchA || 'N/A'}
              </p>
            </div>

            {/* Score */}
            <div className="flex items-center gap-4 md:gap-6 px-6 md:px-10 py-3 bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner">
              <div
                className={`text-3xl md:text-4xl font-black font-orbitron tabular-nums transition-all ${isUpdateMode && isAdmin ? 'cursor-pointer hover:text-rose-500 hover:scale-110' : 'text-white'}`}
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newScore = prompt(`Update Score for ${teamA}:`, String(match.scoreA));
                    if (newScore !== null && !isNaN(Number(newScore))) onUpdate(match.id, { scoreA: Number(newScore) });
                  }
                }}
              >
                {match.scoreA}
              </div>
              <div className="h-8 md:h-12 w-[1px] bg-white/10"></div>
              <div
                className={`text-3xl md:text-4xl font-black font-orbitron tabular-nums transition-all ${isUpdateMode && isAdmin ? 'cursor-pointer hover:text-rose-500 hover:scale-110' : 'text-white'}`}
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newScore = prompt(`Update Score for ${teamB}:`, String(match.scoreB));
                    if (newScore !== null && !isNaN(Number(newScore))) onUpdate(match.id, { scoreB: Number(newScore) });
                  }
                }}
              >
                {match.scoreB}
              </div>
            </div>

            {/* Team B */}
            <div className="text-left space-y-2">
              <div className="flex items-center justify-start gap-2">
                <h3 className="font-orbitron text-xl md:text-2xl font-black uppercase tracking-tighter text-white group-hover:glory-gradient transition-colors truncate">
                  {teamB}
                </h3>
                {match.status === 'COMPLETED' && (
                  String(match.details?.winner).toUpperCase() === 'TEAMB' ||
                  String(match.details?.winner).toUpperCase() === teamB.toUpperCase()
                ) && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 animate-in fade-in slide-in-from-left duration-500">
                      <i className="fa-solid fa-crown text-amber-400 text-[12px] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"></i>
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.1em]">WINNER</span>
                    </div>
                  )}
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                BATCH {match.batchB || 'N/A'}
              </p>
            </div>
          </div>

          {/* Venue & Action Side */}
          <div className="flex md:flex-col items-center justify-center gap-6 md:gap-4 min-w-[120px]">
            <div className="text-right md:text-center">
              <div
                className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-slate-200 transition-colors ${isUpdateMode && isAdmin ? 'cursor-pointer p-1 rounded hover:bg-white/5' : ''}`}
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    showDropdown(match.venue || '', ['Playground-1', 'Playground-2', 'Playground-3', 'Playground-4', 'Seminar-Hall'], 'Venue', (v) => onUpdate(match.id, { venue: v }));
                  }
                }}
              >
                <i className="fa-solid fa-location-dot text-rose-500"></i>
                {match.venue}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'glory-bg text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
              >
                <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs`}></i>
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setIsUpdateMode(!isUpdateMode);
                      if (!isUpdateMode) setIsExpanded(true);
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isUpdateMode ? 'bg-amber-500 text-white shadow-lg' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}
                  >
                    <i className="fa-solid fa-pen-to-square text-xs"></i>
                  </button>
                  <button
                    onClick={() => onDelete?.(match.id)}
                    className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Info */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out border-t border-white/5 bg-slate-900/20 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="px-4 py-2 bg-slate-800 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none block mb-1">Discipline</span>
                  <span className="text-sm font-bold text-white uppercase tracking-tighter orbitron">{match.sport}</span>
                </div>
                {match.details?.matchType && (
                  <div
                    onClick={() => {
                      if (isUpdateMode && isAdmin) {
                        showDropdown(match.details?.matchType || '', ['Eliminator', 'Quarter Final', 'Semi Final', 'Final'], 'Match Type', (t) => handleDetailUpdate('matchType', t));
                      }
                    }}
                    className={`px-4 py-2 rounded-xl border ${getMatchTypeStyle(match.details.matchType)} ${isUpdateMode && isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none block mb-1 opacity-60">Competition</span>
                    <span className="text-sm font-bold uppercase tracking-tighter orbitron">{match.details.matchType}</span>
                  </div>
                )}
              </div>

              {isUpdateMode && (
                <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <i className="fa-solid fa-circle-info text-amber-500 animate-pulse"></i>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Update Mode Active: Click fields to edit</span>
                </div>
              )}
            </div>

            {/* Sport Specific Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(match.details || {}).map(([key, value]) => {
                if (['batchA', 'batchB', 'matchType', 'winner'].includes(key)) return null;
                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (isUpdateMode && isAdmin) {
                        if (key === 'currentInnings' || key === 'currentPeriod' || key === 'completed') {
                          const options = key === 'currentInnings' ? [teamA, teamB] :
                            key === 'currentPeriod' ? ['1st Half', '2nd Half', 'Extra'] :
                              ['True', 'False'];
                          showDropdown(String(value), options, key, (val) => {
                            let finalVal: any = val;
                            if (key === 'currentInnings') finalVal = val === teamA ? 'TeamA' : 'TeamB';
                            if (key === 'completed') finalVal = val === 'True';
                            handleDetailUpdate(key, finalVal);
                          });
                        } else {
                          const newVal = prompt(`Update ${key}:`, String(value));
                          if (newVal !== null) handleDetailUpdate(key, isNaN(Number(newVal)) ? newVal : Number(newVal));
                        }
                      }
                    }}
                    className={`p-5 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-between group/field transition-all ${isUpdateMode && isAdmin ? 'cursor-pointer hover:border-amber-500/30 hover:bg-slate-800' : ''}`}
                  >
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-orbitron font-bold text-white uppercase text-sm">
                      {key === 'currentInnings' ?
                        (String(value).toUpperCase() === 'TEAMA' ? teamA :
                          String(value).toUpperCase() === 'TEAMB' ? teamB : String(value)) : String(value)}
                    </span>
                  </div>
                );
              })}
            </div>

            {match.status === 'COMPLETED' && match.details?.winner && isAdmin && isUpdateMode && (
              <div className="flex justify-center pt-6">
                <div
                  onClick={() => {
                    showDropdown(match.details?.winner || '', [teamA, teamB, 'Draw'], 'Winner', (w) => {
                      const winnerVal = (w === teamA || w.toUpperCase() === 'TEAMA') ? 'TeamA' :
                        (w === teamB || w.toUpperCase() === 'TEAMB') ? 'TeamB' : w;
                      handleDetailUpdate('winner', winnerVal);
                    });
                  }}
                  className="px-6 py-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  Change Winner
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
