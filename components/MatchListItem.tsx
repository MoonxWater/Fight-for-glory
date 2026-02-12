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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-rose-500';
      case 'COMPLETED': return 'text-green-500';
      case 'UPCOMING': return 'text-blue-500';
      default: return 'text-slate-400';
    }
  };

  const getMatchTypeColor = (matchType?: string) => {
    switch (matchType?.toLowerCase()) {
      case 'eliminator': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      case 'quarter final': return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'semi final': return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
      case 'final': return 'bg-rose-500/20 border-rose-500/30 text-rose-400';
      default: return 'bg-slate-500/20 border-slate-500/30 text-slate-400';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'boys': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'girls': return 'bg-pink-500/20 border-pink-500/30 text-pink-400';
      default: return 'bg-slate-500/20 border-slate-500/30 text-slate-400';
    }
  };

  const getTeamColor = (team: string, isWinner: boolean) => {
    if (isWinner) return 'text-green-400 font-bold';
    return 'text-white';
  };

  const renderSportDetails = () => {
    const details = match.details || {};
    
    switch (match.sport) {
      case 'Cricket':
        return (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamA}</div>
              <div className="space-y-1">
                <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newOvers = prompt(`Enter overs for ${teamA}:`, details.oversA || 0);
                      if (newOvers !== null && !isNaN(Number(newOvers))) {
                        handleDetailUpdate('oversA', Number(newOvers));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Overs</span>
                  <span className="font-mono text-white">{details.oversA || 0}</span>
                </div>
                <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newWickets = prompt(`Enter wickets for ${teamA}:`, details.wicketsA || 0);
                      if (newWickets !== null && !isNaN(Number(newWickets))) {
                        handleDetailUpdate('wicketsA', Number(newWickets));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Wickets</span>
                  <span className="font-mono text-white">{details.wicketsA || 0}</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamB}</div>
              <div className="space-y-1">
                <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newOvers = prompt(`Enter overs for ${teamB}:`, details.oversB || 0);
                      if (newOvers !== null && !isNaN(Number(newOvers))) {
                        handleDetailUpdate('oversB', Number(newOvers));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Overs</span>
                  <span className="font-mono text-white">{details.oversB || 0}</span>
                </div>
                <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newWickets = prompt(`Enter wickets for ${teamB}:`, details.wicketsB || 0);
                      if (newWickets !== null && !isNaN(Number(newWickets))) {
                        handleDetailUpdate('wicketsB', Number(newWickets));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Wickets</span>
                  <span className="font-mono text-white">{details.wicketsB || 0}</span>
                </div>
              </div>
            </div>
            {details.currentInnings && (
              <div className={`col-span-2 text-center mt-2 ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50 p-2 rounded' : ''}`}
                onClick={(e) => {
                  if (isUpdateMode && isAdmin) {
                    const options = ['None', teamA, teamB];
                    const currentValue = details.currentInnings === 'TeamA' ? teamA : details.currentInnings === 'TeamB' ? teamB : details.currentInnings;
                    showDropdown(
                      currentValue,
                      options,
                      'Current Innings',
                      (selection) => {
                        const newInnings = selection === teamA ? 'TeamA' : selection === teamB ? 'TeamB' : selection;
                        handleDetailUpdate('currentInnings', newInnings);
                      }
                    );
                  }
                }}
              >
                <span className="text-rose-400">Current: {details.currentInnings === 'TeamA' ? teamA : details.currentInnings === 'TeamB' ? teamB : details.currentInnings}</span>
              </div>
            )}
          </div>
        );
      case 'Football':
        return (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamA}</div>
              <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newScore = prompt(`Enter half time score for ${teamA}:`, details.halfTimeScoreA || 0);
                      if (newScore !== null && !isNaN(Number(newScore))) {
                        handleDetailUpdate('halfTimeScoreA', Number(newScore));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Half Time</span>
                  <span className="font-mono text-white">{details.halfTimeScoreA || 0}</span>
                </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamB}</div>
              <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newScore = prompt(`Enter half time score for ${teamB}:`, details.halfTimeScoreB || 0);
                      if (newScore !== null && !isNaN(Number(newScore))) {
                        handleDetailUpdate('halfTimeScoreB', Number(newScore));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Half Time</span>
                  <span className="font-mono text-white">{details.halfTimeScoreB || 0}</span>
                </div>
            </div>
            {details.currentPeriod && (
              <div className={`col-span-2 text-center mt-2 ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50 p-2 rounded' : ''}`}
                onClick={(e) => {
                  if (isUpdateMode && isAdmin) {
                    const periods = ['1st', '2nd', 'Extra'];
                    showDropdown(
                      details.currentPeriod,
                      periods,
                      'Current Period',
                      (selection) => {
                        handleDetailUpdate('currentPeriod', selection);
                      }
                    );
                  }
                }}
              >
                <span className="text-slate-400">Period: {details.currentPeriod}</span>
              </div>
            )}
          </div>
        );
      case 'Volleyball':
      case 'Badminton':
        return (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamA}</div>
              <div className="space-y-1">
                <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newSets = prompt(`Enter sets won for ${teamA}:`, details.setsWonA || 0);
                      if (newSets !== null && !isNaN(Number(newSets))) {
                        handleDetailUpdate('setsWonA', Number(newSets));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Sets Won</span>
                  <span className="font-mono text-white">{details.setsWonA || 0}</span>
                </div>
                {details.currentSetScoreA !== undefined && (
                  <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                    onClick={() => {
                      if (isUpdateMode && isAdmin) {
                        const newCurrent = prompt(`Enter current set score for ${teamA}:`, details.currentSetScoreA || 0);
                        if (newCurrent !== null && !isNaN(Number(newCurrent))) {
                          handleDetailUpdate('currentSetScoreA', Number(newCurrent));
                        }
                      }
                    }}
                  >
                    <span className="font-black uppercase tracking-wider">Current Set</span>
                    <span className="font-mono text-white">{details.currentSetScoreA}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamB}</div>
              <div className="space-y-1">
                <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newSets = prompt(`Enter sets won for ${teamB}:`, details.setsWonB || 0);
                      if (newSets !== null && !isNaN(Number(newSets))) {
                        handleDetailUpdate('setsWonB', Number(newSets));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Sets Won</span>
                  <span className="font-mono text-white">{details.setsWonB || 0}</span>
                </div>
                {details.currentSetScoreB !== undefined && (
                  <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                    onClick={() => {
                      if (isUpdateMode && isAdmin) {
                        const newCurrent = prompt(`Enter current set score for ${teamB}:`, details.currentSetScoreB || 0);
                        if (newCurrent !== null && !isNaN(Number(newCurrent))) {
                          handleDetailUpdate('currentSetScoreB', Number(newCurrent));
                        }
                      }
                    }}
                  >
                    <span className="font-black uppercase tracking-wider">Current Set</span>
                    <span className="font-mono text-white">{details.currentSetScoreB}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'Kabaddi':
        return (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamA}</div>
              <div className="space-y-1">
                <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newRaid = prompt(`Enter raid points for ${teamA}:`, details.raidPointsA || 0);
                      if (newRaid !== null && !isNaN(Number(newRaid))) {
                        handleDetailUpdate('raidPointsA', Number(newRaid));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Raid Points</span>
                  <span className="font-mono text-white">{details.raidPointsA || 0}</span>
                </div>
                <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newTackle = prompt(`Enter tackle points for ${teamA}:`, details.tacklePointsA || 0);
                      if (newTackle !== null && !isNaN(Number(newTackle))) {
                        handleDetailUpdate('tacklePointsA', Number(newTackle));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Tackle Points</span>
                  <span className="font-mono text-white">{details.tacklePointsA || 0}</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamB}</div>
              <div className="space-y-1">
                <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newRaid = prompt(`Enter raid points for ${teamB}:`, details.raidPointsB || 0);
                      if (newRaid !== null && !isNaN(Number(newRaid))) {
                        handleDetailUpdate('raidPointsB', Number(newRaid));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Raid Points</span>
                  <span className="font-mono text-white">{details.raidPointsB || 0}</span>
                </div>
                <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newTackle = prompt(`Enter tackle points for ${teamB}:`, details.tacklePointsB || 0);
                      if (newTackle !== null && !isNaN(Number(newTackle))) {
                        handleDetailUpdate('tacklePointsB', Number(newTackle));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Tackle Points</span>
                  <span className="font-mono text-white">{details.tacklePointsB || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Kho-Kho':
        return (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamA}</div>
              <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newInnings = prompt(`Enter innings for ${teamA}:`, details.inningsA || 0);
                      if (newInnings !== null && !isNaN(Number(newInnings))) {
                        handleDetailUpdate('inningsA', Number(newInnings));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Innings</span>
                  <span className="font-mono text-white">{details.inningsA || 0}</span>
                </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamB}</div>
              <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newInnings = prompt(`Enter innings for ${teamB}:`, details.inningsB || 0);
                      if (newInnings !== null && !isNaN(Number(newInnings))) {
                        handleDetailUpdate('inningsB', Number(newInnings));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Innings</span>
                  <span className="font-mono text-white">{details.inningsB || 0}</span>
                </div>
            </div>
          </div>
        );
      case 'LUDO':
        return (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamA}</div>
              <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newCoins = prompt(`Enter coins for ${teamA}:`, details.coinsA || 0);
                      if (newCoins !== null && !isNaN(Number(newCoins))) {
                        handleDetailUpdate('coinsA', Number(newCoins));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Coins</span>
                  <span className="font-mono text-white">{details.coinsA || 0}</span>
                </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamB}</div>
              <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newCoins = prompt(`Enter coins for ${teamB}:`, details.coinsB || 0);
                      if (newCoins !== null && !isNaN(Number(newCoins))) {
                        handleDetailUpdate('coinsB', Number(newCoins));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Coins</span>
                  <span className="font-mono text-white">{details.coinsB || 0}</span>
                </div>
            </div>
          </div>
        );
      case 'Carrom':
        return (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamA}</div>
              <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newBoards = prompt(`Enter boards won for ${teamA}:`, details.boardsA || 0);
                      if (newBoards !== null && !isNaN(Number(newBoards))) {
                        handleDetailUpdate('boardsA', Number(newBoards));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Boards Won</span>
                  <span className="font-mono text-white">{details.boardsA || 0}</span>
                </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamB}</div>
              <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newBoards = prompt(`Enter boards won for ${teamB}:`, details.boardsB || 0);
                      if (newBoards !== null && !isNaN(Number(newBoards))) {
                        handleDetailUpdate('boardsB', Number(newBoards));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Boards Won</span>
                  <span className="font-mono text-white">{details.boardsB || 0}</span>
                </div>
            </div>
          </div>
        );
      case 'Chess':
        return (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamA}</div>
              <div className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newMoves = prompt(`Enter moves played:`, details.movesPlayed || 0);
                      if (newMoves !== null && !isNaN(Number(newMoves))) {
                        handleDetailUpdate('movesPlayed', Number(newMoves));
                      }
                    }
                  }}
                >
                  <span className="font-black uppercase tracking-wider">Moves</span>
                  <span className="font-mono text-white">{details.movesPlayed || 0}</span>
                </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white mb-1">{teamB}</div>
              <div className="text-slate-400">Opponent</div>
            </div>
          </div>
        );
      default:
        return <div className="text-xs text-slate-400">Standard match format</div>;
    }
  };

  const handleStatusClick = () => {
    if (isUpdateMode && isAdmin) {
      const newStatus = match.status === 'UPCOMING' ? 'LIVE' : match.status === 'LIVE' ? 'COMPLETED' : 'UPCOMING';
      onUpdate(match.id, { status: newStatus });
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDetailUpdate = (field: string, value: any) => {
    if (isUpdateMode && isAdmin) {
      onUpdate(match.id, { details: { ...match.details, [field]: value } });
    }
  };

  const showDropdown = (currentValue: string, options: string[], label: string, onUpdateValue: (value: string) => void) => {
    const select = document.createElement('select');
    select.style.position = 'fixed';
    select.style.top = '50%';
    select.style.left = '50%';
    select.style.transform = 'translate(-50%, -50%)';
    select.style.zIndex = '9999';
    select.style.fontSize = '16px';
    select.style.backgroundColor = '#1e293b';
    select.style.color = 'white';
    select.style.border = '1px solid #475569';
    select.style.borderRadius = '8px';
    select.style.minWidth = '200px';
    
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      select.appendChild(optionElement);
    });
    
    select.value = currentValue;
    
    const handleChange = () => {
      if (select.value && select.value !== currentValue) {
        onUpdateValue(select.value);
      }
      document.body.removeChild(select);
      document.body.removeChild(overlay);
    };
    
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '9998';
    overlay.onclick = () => {
      document.body.removeChild(select);
      document.body.removeChild(overlay);
    };
    
    select.onchange = handleChange;
    select.onblur = handleChange;
    
    document.body.appendChild(overlay);
    document.body.appendChild(select);
    select.focus();
  };

  return (
    <div className="glass rounded-lg border border-white/10 p-4 hover:border-white/20 transition-all duration-300">
      {/* Basic Info - Always Visible */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleExpanded}
            className="p-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs font-medium transition-all duration-200"
          >
            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} transition-transform duration-200`}></i>
          </button>

          <h3 className="font-oswald text-lg font-bold uppercase text-white">
            {teamA} vs {teamB}
          </h3>
          <span 
            className={`text-sm font-bold uppercase tracking-wider ${getStatusColor(match.status)} ${isUpdateMode && isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={handleStatusClick}
          >
            {match.status}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getGenderColor(match.gender)}`}>
            {match.gender}
          </span>
          {match.details?.matchType && match.details.matchType !== 'normal' && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getMatchTypeColor(match.details.matchType)}`}>
              <i className="fa-solid fa-trophy text-[8px]"></i>
              {match.details.matchType}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {isAdmin && (
              <button
                onClick={() => {
                  setIsUpdateMode(!isUpdateMode);
                  setUpdateMessage(isUpdateMode ? '' : 'Click on details to update');
                  if (!isUpdateMode) {
                    setIsExpanded(true); // Auto-expand when entering update mode
                  }
                }}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  isUpdateMode 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isUpdateMode ? 'Normal' : 'Update'}
              </button>
            )}
          </div>
          <button
            onClick={() => onDelete(match.id)}
            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
      
      {/* Basic Match Info */}
      <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
        <span className="font-medium">{match.sport}</span>
        <span>•</span>
        <span className={`font-medium ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50 p-2 rounded' : ''}`}
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  const venues = ['Playground-1', 'Playground-2', 'Playground-3', 'Playground-4', 'Seminar-Hall'];
                  showDropdown(
                    match.venue || 'Playground-1',
                    venues,
                    'Venue',
                    (selection) => {
                      onUpdate(match.id, { venue: selection });
                    }
                  );
                }
              }}
        >
          {match.venue}
        </span>
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-center gap-8 py-3 bg-slate-800/50 rounded-lg mb-3">
        <div className={`text-center ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50 p-2 rounded' : ''}`}
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  const newScore = prompt(`Enter score for ${teamA}:`, match.scoreA);
                  if (newScore !== null && !isNaN(Number(newScore))) {
                    onUpdate(match.id, { scoreA: Number(newScore) });
                  }
                }
              }}
        >
          <div className={`text-2xl font-bold ${getTeamColor(teamA, match.status === 'COMPLETED' && match.details?.winner === teamA)}`}>
            {match.scoreA}
          </div>
        </div>
        <div className="text-xl text-slate-500 font-bold">VS</div>
        <div className={`text-center ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50 p-2 rounded' : ''}`}
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  const newScore = prompt(`Enter score for ${teamB}:`, match.scoreB);
                  if (newScore !== null && !isNaN(Number(newScore))) {
                    onUpdate(match.id, { scoreB: Number(newScore) });
                  }
                }
              }}
        >
          <div className={`text-2xl font-bold ${getTeamColor(teamB, match.status === 'COMPLETED' && match.details?.winner === teamB)}`}>
            {match.scoreB}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Update Message */}
          {isUpdateMode && updateMessage && (
            <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-center">
              <span className="text-xs font-medium text-amber-400">{updateMessage}</span>
            </div>
          )}

          {/* Sport Details */}
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <h4 className="text-sm font-bold text-white mb-2">Match Details</h4>
            {renderSportDetails()}
          </div>

          {/* Batch Info */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex gap-4">
              <span className={`${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50 p-2 rounded' : ''}`}
                onClick={(e) => {
                  if (isUpdateMode && isAdmin) {
                    const batches = ['22', '23', '24', '25'];
                    showDropdown(
                      match.details?.batchA || '25',
                      batches,
                      'Batch A',
                      (selection) => {
                        onUpdate(match.id, { details: { ...match.details, batchA: selection } });
                      }
                    );
                  }
                }}
              >
                {teamA}: {match.details?.batchA || 'N/A'} Batch
              </span>
              <span className={`${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50 p-2 rounded' : ''}`}
                onClick={(e) => {
                  if (isUpdateMode && isAdmin) {
                    const batches = ['22', '23', '24', '25'];
                    showDropdown(
                      match.details?.batchB || '25',
                      batches,
                      'Batch B',
                      (selection) => {
                        onUpdate(match.id, { details: { ...match.details, batchB: selection } });
                      }
                    );
                  }
                }}
              >
                {teamB}: {match.details?.batchB || 'N/A'} Batch
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
