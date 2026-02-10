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
  const [isUpdateMode, setIsUpdateMode] = React.useState(false);
  const [updateMessage, setUpdateMessage] = React.useState('');

  // Helper function to get team color based on batch
  const getTeamColor = (team: string, batch?: string) => {
    if (!batch) return 'bg-slate-800 border-white/5';
    
    switch (batch) {
      case '25': return 'bg-black border-black'; // Black for 2025 batch
      case '24': return 'bg-blue-600 border-blue-500'; // Blue for 2024 batch  
      case '23': return 'bg-white border-white'; // White for 2023 batch
      case '22': return 'bg-slate-300 border-slate-200'; // Light gray for 2022 batch
      default: return 'bg-slate-800 border-white/5'; // Default
    }
  };

  // Helper function for dropdown selection
  const showDropdown = (currentValue: string, options: string[], label: string, onUpdateValue: (value: string) => void) => {
    // Create a dropdown element for selection
    const select = document.createElement('select');
    select.style.position = 'fixed';
    select.style.top = '50%';
    select.style.left = '50%';
    select.style.transform = 'translate(-50%, -50%)';
    select.style.zIndex = '9999';
    select.style.padding = '10px';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-rose-500 animate-pulse';
      case 'COMPLETED': return 'text-slate-500';
      default: return 'text-indigo-400';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender?.toLowerCase()) {
      case 'boys': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'girls': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender?.toLowerCase()) {
      case 'boys': return 'fa-mars';
      case 'girls': return 'fa-venus';
      default: return 'fa-users';
    }
  };

  const renderSportDetails = () => {
    if (!match.details) return null;

    const details = match.details;

    switch (match.sport) {
      case 'Cricket':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newOvers = prompt(`Enter overs for ${teamA}:`, details.oversA || 0);
                    if (newOvers !== null && !isNaN(Number(newOvers))) {
                      onUpdate(match.id, { details: { ...match.details, oversA: Number(newOvers) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Overs</span>
                <span className="font-mono text-white">{details.oversA || 0}</span>
              </div>
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newOvers = prompt(`Enter overs for ${teamB}:`, details.oversB || 0);
                    if (newOvers !== null && !isNaN(Number(newOvers))) {
                      onUpdate(match.id, { details: { ...match.details, oversB: Number(newOvers) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Overs</span>
                <span className="font-mono text-white">{details.oversB || 0}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newWickets = prompt(`Enter wickets for ${teamA}:`, details.wicketsA || 0);
                    if (newWickets !== null && !isNaN(Number(newWickets))) {
                      onUpdate(match.id, { details: { ...match.details, wicketsA: Number(newWickets) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Wickets</span>
                <span className="font-mono text-white">{details.wicketsA || 0}</span>
              </div>
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newWickets = prompt(`Enter wickets for ${teamB}:`, details.wicketsB || 0);
                    if (newWickets !== null && !isNaN(Number(newWickets))) {
                      onUpdate(match.id, { details: { ...match.details, wicketsB: Number(newWickets) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Wickets</span>
                <span className="font-mono text-white">{details.wicketsB || 0}</span>
              </div>
            </div>
            {details.currentInnings && (
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const options = ['None', teamA, teamB];
                    showDropdown(
                      details.currentInnings === 'TeamA' ? teamA : details.currentInnings === 'TeamB' ? teamB : details.currentInnings,
                      options,
                      'Current Innings',
                      (newInnings) => {
                        const inningsValue = newInnings === teamA ? 'TeamA' : newInnings === teamB ? 'TeamB' : newInnings;
                        onUpdate(match.id, { details: { ...match.details, currentInnings: inningsValue } });
                      }
                    );
                  }
                }}
                className={`flex justify-between items-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-rose-500/20' : ''}`}
              >
                <span className="font-black uppercase tracking-wider text-rose-400">Current Innings</span>
                <span className="font-mono text-rose-400">
                  {details.currentInnings === 'TeamA' ? teamA : details.currentInnings === 'TeamB' ? teamB : details.currentInnings}
                </span>
              </div>
            )}
          </div>
        );

      case 'Football':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newScoreA = prompt(`Enter half time score for ${teamA}:`, details.halfTimeScoreA || 0);
                    if (newScoreA !== null && !isNaN(Number(newScoreA))) {
                      onUpdate(match.id, { details: { ...match.details, halfTimeScoreA: Number(newScoreA) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Half Time</span>
                <span className="font-mono text-white">{details.halfTimeScoreA || 0}</span>
              </div>
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newScoreB = prompt(`Enter half time score for ${teamB}:`, details.halfTimeScoreB || 0);
                    if (newScoreB !== null && !isNaN(Number(newScoreB))) {
                      onUpdate(match.id, { details: { ...match.details, halfTimeScoreB: Number(newScoreB) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Half Time</span>
                <span className="font-mono text-white">{details.halfTimeScoreB || 0}</span>
              </div>
            </div>
            {details.currentPeriod && (
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const periods = ['1st Half', '2nd Half', 'Extra'];
                    showDropdown(details.currentPeriod, periods, 'Current Period', (newPeriod) => {
                      onUpdate(match.id, { details: { ...match.details, currentPeriod: newPeriod } });
                    });
                  }
                }}
                className={`flex justify-between items-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-rose-500/20' : ''}`}
              >
                <span className="font-black uppercase tracking-wider text-rose-400">Period</span>
                <span className="font-mono text-rose-400">{details.currentPeriod}</span>
              </div>
            )}
          </div>
        );

      case 'Volleyball':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newSetsA = prompt(`Enter sets won for ${teamA}:`, details.setsWonA || 0);
                    if (newSetsA !== null && !isNaN(Number(newSetsA))) {
                      onUpdate(match.id, { details: { ...match.details, setsWonA: Number(newSetsA) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Sets Won</span>
                <span className="font-mono text-white">{details.setsWonA || 0}</span>
              </div>
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newSetsB = prompt(`Enter sets won for ${teamB}:`, details.setsWonB || 0);
                    if (newSetsB !== null && !isNaN(Number(newSetsB))) {
                      onUpdate(match.id, { details: { ...match.details, setsWonB: Number(newSetsB) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Sets Won</span>
                <span className="font-mono text-white">{details.setsWonB || 0}</span>
              </div>
            </div>
            {details.currentSetScoreA !== undefined && details.currentSetScoreB !== undefined && (
              <div className="grid grid-cols-2 gap-2">
                <div 
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newScoreA = prompt(`Enter current set score for ${teamA}:`, details.currentSetScoreA || 0);
                      if (newScoreA !== null && !isNaN(Number(newScoreA))) {
                        onUpdate(match.id, { details: { ...match.details, currentSetScoreA: Number(newScoreA) } });
                      }
                    }
                  }}
                  className={`flex justify-between items-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-rose-500/20' : ''}`}
                >
                  <span className="font-black uppercase tracking-wider text-rose-400">Current Set</span>
                  <span className="font-mono text-rose-400">{details.currentSetScoreA}</span>
                </div>
                <div 
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newScoreB = prompt(`Enter current set score for ${teamB}:`, details.currentSetScoreB || 0);
                      if (newScoreB !== null && !isNaN(Number(newScoreB))) {
                        onUpdate(match.id, { details: { ...match.details, currentSetScoreB: Number(newScoreB) } });
                      }
                    }
                  }}
                  className={`flex justify-between items-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-rose-500/20' : ''}`}
                >
                  <span className="font-black uppercase tracking-wider text-rose-400">Current Set</span>
                  <span className="font-mono text-rose-400">{details.currentSetScoreB}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'Badminton':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newSetsA = prompt(`Enter sets won for ${teamA}:`, details.setsWonA || 0);
                    if (newSetsA !== null && !isNaN(Number(newSetsA))) {
                      onUpdate(match.id, { details: { ...match.details, setsWonA: Number(newSetsA) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Sets Won</span>
                <span className="font-mono text-white">{details.setsWonA || 0}</span>
              </div>
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newSetsB = prompt(`Enter sets won for ${teamB}:`, details.setsWonB || 0);
                    if (newSetsB !== null && !isNaN(Number(newSetsB))) {
                      onUpdate(match.id, { details: { ...match.details, setsWonB: Number(newSetsB) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Sets Won</span>
                <span className="font-mono text-white">{details.setsWonB || 0}</span>
              </div>
            </div>
            {details.currentSetScoreA !== undefined && details.currentSetScoreB !== undefined && (
              <div className="grid grid-cols-2 gap-2">
                <div 
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newScoreA = prompt(`Enter current set score for ${teamA}:`, details.currentSetScoreA || 0);
                      if (newScoreA !== null && !isNaN(Number(newScoreA))) {
                        onUpdate(match.id, { details: { ...match.details, currentSetScoreA: Number(newScoreA) } });
                      }
                    }
                  }}
                  className={`flex justify-between items-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-rose-500/20' : ''}`}
                >
                  <span className="font-black uppercase tracking-wider text-rose-400">Current Set</span>
                  <span className="font-mono text-rose-400">{details.currentSetScoreA}</span>
                </div>
                <div 
                  onClick={() => {
                    if (isUpdateMode && isAdmin) {
                      const newScoreB = prompt(`Enter current set score for ${teamB}:`, details.currentSetScoreB || 0);
                      if (newScoreB !== null && !isNaN(Number(newScoreB))) {
                        onUpdate(match.id, { details: { ...match.details, currentSetScoreB: Number(newScoreB) } });
                      }
                    }
                  }}
                  className={`flex justify-between items-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-rose-500/20' : ''}`}
                >
                  <span className="font-black uppercase tracking-wider text-rose-400">Current Set</span>
                  <span className="font-mono text-rose-400">{details.currentSetScoreB}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'Kabaddi':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newPointsA = prompt(`Enter raid points for ${teamA}:`, details.raidPointsA || 0);
                    if (newPointsA !== null && !isNaN(Number(newPointsA))) {
                      onUpdate(match.id, { details: { ...match.details, raidPointsA: Number(newPointsA) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Raid Points</span>
                <span className="font-mono text-white">{details.raidPointsA || 0}</span>
              </div>
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newPointsB = prompt(`Enter raid points for ${teamB}:`, details.raidPointsB || 0);
                    if (newPointsB !== null && !isNaN(Number(newPointsB))) {
                      onUpdate(match.id, { details: { ...match.details, raidPointsB: Number(newPointsB) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Raid Points</span>
                <span className="font-mono text-white">{details.raidPointsB || 0}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newPointsA = prompt(`Enter tackle points for ${teamA}:`, details.tacklePointsA || 0);
                    if (newPointsA !== null && !isNaN(Number(newPointsA))) {
                      onUpdate(match.id, { details: { ...match.details, tacklePointsA: Number(newPointsA) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Tackle Points</span>
                <span className="font-mono text-white">{details.tacklePointsA || 0}</span>
              </div>
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newPointsB = prompt(`Enter tackle points for ${teamB}:`, details.tacklePointsB || 0);
                    if (newPointsB !== null && !isNaN(Number(newPointsB))) {
                      onUpdate(match.id, { details: { ...match.details, tacklePointsB: Number(newPointsB) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Tackle Points</span>
                <span className="font-mono text-white">{details.tacklePointsB || 0}</span>
              </div>
            </div>
          </div>
        );

      case 'Race':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div 
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  const newDistance = prompt(`Enter distance:`, details.distance || 0);
                  if (newDistance !== null && !isNaN(Number(newDistance))) {
                    onUpdate(match.id, { details: { ...match.details, distance: Number(newDistance) } });
                  }
                }
              }}
              className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
            >
              <span className="font-black uppercase tracking-wider">Distance</span>
              <span className="font-mono text-white">{details.distance || 0}m</span>
            </div>
          </div>
        );

      case 'Musical Chair':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div 
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  const newRounds = prompt(`Enter rounds completed:`, details.roundsCompleted || 0);
                  if (newRounds !== null && !isNaN(Number(newRounds))) {
                    onUpdate(match.id, { details: { ...match.details, roundsCompleted: Number(newRounds) } });
                  }
                }
              }}
              className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
            >
              <span className="font-black uppercase tracking-wider">Rounds</span>
              <span className="font-mono text-white">{details.roundsCompleted || 0}</span>
            </div>
          </div>
        );

      case 'Kho-Kho':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newInningsA = prompt(`Enter innings for ${teamA}:`, details.inningsA || 0);
                    if (newInningsA !== null && !isNaN(Number(newInningsA))) {
                      onUpdate(match.id, { details: { ...match.details, inningsA: Number(newInningsA) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Innings</span>
                <span className="font-mono text-white">{details.inningsA || 0}</span>
              </div>
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newInningsB = prompt(`Enter innings for ${teamB}:`, details.inningsB || 0);
                    if (newInningsB !== null && !isNaN(Number(newInningsB))) {
                      onUpdate(match.id, { details: { ...match.details, inningsB: Number(newInningsB) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Innings</span>
                <span className="font-mono text-white">{details.inningsB || 0}</span>
              </div>
            </div>
          </div>
        );

      case 'LUDO':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newCoinsA = prompt(`Enter coins for ${teamA}:`, details.coinsA || 0);
                    if (newCoinsA !== null && !isNaN(Number(newCoinsA))) {
                      onUpdate(match.id, { details: { ...match.details, coinsA: Number(newCoinsA) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Coins</span>
                <span className="font-mono text-white">{details.coinsA || 0}</span>
              </div>
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newCoinsB = prompt(`Enter coins for ${teamB}:`, details.coinsB || 0);
                    if (newCoinsB !== null && !isNaN(Number(newCoinsB))) {
                      onUpdate(match.id, { details: { ...match.details, coinsB: Number(newCoinsB) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Coins</span>
                <span className="font-mono text-white">{details.coinsB || 0}</span>
              </div>
            </div>
          </div>
        );

      case 'Chess':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div 
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  const newMoves = prompt(`Enter moves played:`, details.movesPlayed || 0);
                  if (newMoves !== null && !isNaN(Number(newMoves))) {
                    onUpdate(match.id, { details: { ...match.details, movesPlayed: Number(newMoves) } });
                  }
                }
              }}
              className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
            >
              <span className="font-black uppercase tracking-wider">Moves</span>
              <span className="font-mono text-white">{details.movesPlayed || 0}</span>
            </div>
          </div>
        );

      case 'Carrom':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newBoardsA = prompt(`Enter boards won for ${teamA}:`, details.boardsWonA || 0);
                    if (newBoardsA !== null && !isNaN(Number(newBoardsA))) {
                      onUpdate(match.id, { details: { ...match.details, boardsWonA: Number(newBoardsA) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Boards Won</span>
                <span className="font-mono text-white">{details.boardsWonA || 0}</span>
              </div>
              <div 
                onClick={() => {
                  if (isUpdateMode && isAdmin) {
                    const newBoardsB = prompt(`Enter boards won for ${teamB}:`, details.boardsWonB || 0);
                    if (newBoardsB !== null && !isNaN(Number(newBoardsB))) {
                      onUpdate(match.id, { details: { ...match.details, boardsWonB: Number(newBoardsB) } });
                    }
                  }
                }}
                className={`flex justify-between items-center p-2 bg-slate-800/50 rounded-lg ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
              >
                <span className="font-black uppercase tracking-wider">Boards Won</span>
                <span className="font-mono text-white">{details.boardsWonB || 0}</span>
              </div>
            </div>
          </div>
        );

      case 'Tug of War':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Rounds Won</span>
              <span className="font-mono text-white">{details.roundsWonA || 0} - {details.roundsWonB || 0}</span>
            </div>
          </div>
        );

      case 'Shot Put':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Distance</span>
              <span className="font-mono text-white">{details.distanceA || 0}m - {details.distanceB || 0}m</span>
            </div>
          </div>
        );

      case 'Needle & Thread':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Status</span>
              <span className={`font-mono ${details.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                {details.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        );

      case 'Spoon Race':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Rounds</span>
              <span className="font-mono text-white">{details.roundsCompleted || 0}</span>
            </div>
          </div>
        );

      default:
        return null;
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
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <i className={`fa-solid ${SPORT_ICONS[match.sport] || 'fa-trophy'}`}></i>
            {match.sport}
          </span>
          {match.venue && (
            <div 
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  const venues = ['Playground-1', 'Playground-2', 'Playground-3', 'Playground-4', 'Seminar-Hall'];
                  showDropdown(match.venue, venues, 'Venue', (newVenue) => {
                    onUpdate(match.id, { venue: newVenue });
                  });
                }
              }}
              className={`flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider ${isUpdateMode && isAdmin ? 'cursor-pointer hover:text-slate-400' : ''}`}
            >
              <i className="fa-solid fa-location-dot"></i>
              {match.venue}
            </div>
          )}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(match.status)}`}>
          {match.status === 'LIVE' && <i className="fa-solid fa-circle text-[6px] mr-1.5 mb-0.5"></i>}
          {match.status}
        </span>
      </div>

      {/* Gender Pill */}
      {match.gender && (
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getGenderColor(match.gender)}`}>
            <i className={`fa-solid ${getGenderIcon(match.gender)} text-[8px]`}></i>
            {match.gender}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex flex-col items-center text-center flex-1">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-3 border border-white/5 relative ${
            getTeamColor(teamA, match.details?.batchA)
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm ${getTeamColor(teamA, match.details?.batchA)} relative`}>
              <div className="w-full h-full rounded-md flex items-center justify-center relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-white rounded-t-md"></div>
              </div>
              {match.status === 'COMPLETED' && match.details?.winner === teamA && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <i className="fa-solid fa-crown text-amber-400 text-lg"></i>
                </div>
              )}
            </div>
          </div>
          <h3 className={`font-oswald text-lg font-bold uppercase tracking-tight line-clamp-1 ${
            match.status === 'COMPLETED' && match.details?.winner === teamA 
              ? 'text-amber-400' 
              : match.status === 'COMPLETED' && match.details?.winner === teamB
              ? 'text-slate-500' 
              : 'text-white'
          }`}>{teamA}</h3>
        </div>

        <div className="flex flex-col items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <div 
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  const newScore = prompt(`Enter new score for ${teamA}:`, match.scoreA);
                  if (newScore !== null && !isNaN(Number(newScore))) {
                    onUpdate(match.id, { scoreA: Number(newScore), status: 'LIVE' });
                  }
                }
              }}
              className={`text-4xl font-black font-oswald tabular-nums glory-gradient ${isUpdateMode && isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              {match.scoreA}
            </div>
            <span className="text-4xl font-black font-oswald tabular-nums text-slate-400">:</span>
            <div 
              onClick={() => {
                if (isUpdateMode && isAdmin) {
                  const newScore = prompt(`Enter new score for ${teamB}:`, match.scoreB);
                  if (newScore !== null && !isNaN(Number(newScore))) {
                    onUpdate(match.id, { scoreB: Number(newScore), status: 'LIVE' });
                  }
                }
              }}
              className={`text-4xl font-black font-oswald tabular-nums glory-gradient ${isUpdateMode && isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              {match.scoreB}
            </div>
          </div>
          <div className="text-[9px] text-slate-600 font-black tracking-widest mt-1 uppercase italic">Arena Score</div>
        </div>

        <div className="flex flex-col items-center text-center flex-1">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-3 border border-white/5 relative ${
            getTeamColor(teamB, match.details?.batchB)
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm ${getTeamColor(teamB, match.details?.batchB)} relative`}>
              <div className="w-full h-full rounded-md flex items-center justify-center relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-white rounded-t-md"></div>
              </div>
              {match.status === 'COMPLETED' && match.details?.winner === teamB && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <i className="fa-solid fa-crown text-amber-400 text-lg"></i>
                </div>
              )}
            </div>
          </div>
          <h3 className={`font-oswald text-lg font-bold uppercase tracking-tight line-clamp-1 ${
            match.status === 'COMPLETED' && match.details?.winner === teamB 
              ? 'text-amber-400' 
              : match.status === 'COMPLETED' && match.details?.winner === teamA
              ? 'text-slate-500' 
              : 'text-white'
          }`}>{teamB}</h3>
        </div>
      </div>

      {/* Sport-Specific Details */}
      {renderSportDetails()}

      {/* Winner Display for Completed Matches */}
      {match.status === 'COMPLETED' && match.details?.winner && (
        <div 
          onClick={() => {
            if (isUpdateMode && isAdmin) {
              showDropdown(match.details.winner, [teamA, teamB], 'Winner', (newWinner) => {
                onUpdate(match.id, { 
                  details: { ...match.details, winner: newWinner }
                });
              });
            }
          }}
          className={`mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/30 text-center ${isUpdateMode && isAdmin ? 'cursor-pointer hover:bg-amber-500/20' : ''}`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <i className="fa-solid fa-trophy text-amber-400 text-lg"></i>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Winner {isUpdateMode && isAdmin && <span className="text-xs ml-2">(Click to change)</span>}
            </span>
          </div>
          <div className="font-oswald text-xl font-bold text-white uppercase tracking-tight">
            {match.details.winner}
          </div>
        </div>
      )}

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
              onClick={() => {
                setIsUpdateMode(!isUpdateMode);
                setUpdateMessage(isUpdateMode ? '' : 'Click on scores or details to update');
                if (isUpdateMode) {
                  setUpdateMessage('');
                }
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all text-white ${
                isUpdateMode 
                  ? 'bg-amber-600 hover:bg-amber-500' 
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isUpdateMode ? 'Switch To Normal Mode' : 'Switch To Update Mode'}
            </button>
          </div>
          
          {isUpdateMode && updateMessage && (
            <div className="w-full p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-center">
              <span className="text-[10px] font-medium text-amber-400">{updateMessage}</span>
            </div>
          )}
          
          {/* Winner Declaration for Live Matches */}
          {match.status === 'LIVE' && (
            <div className="w-full">
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdate(match.id, { 
                        status: 'COMPLETED',
                        details: { ...match.details, winner: e.target.value }
                      });
                    }
                  }}
                  className="flex-1 py-2 px-3 bg-slate-700 border border-slate-600 rounded-xl text-[10px] font-medium text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  defaultValue=""
                >
                  <option value="" disabled>Declare Winner</option>
                  <option value={teamA}>{teamA}</option>
                  <option value={teamB}>{teamB}</option>
                </select>
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              const newStatus = match.status === 'UPCOMING' ? 'LIVE' : match.status === 'LIVE' ? 'COMPLETED' : 'UPCOMING';
              onUpdate(match.id, { status: newStatus });
            }}
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] transition-all text-white"
          >
            Switch State: {match.status}
          </button>
        </div>
      )}
    </div>
  );
};