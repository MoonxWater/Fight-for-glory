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
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Overs</span>
              <span className="font-mono text-white">{details.oversA || 0}.{details.oversB || 0} ov</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Wickets</span>
              <span className="font-mono text-white">{details.wicketsA || 0}/{details.wicketsB || 0} wkts</span>
            </div>
            {details.currentInnings && (
              <div className="flex justify-between items-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
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
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Half Time</span>
              <span className="font-mono text-white">{details.halfTimeScoreA || 0} - {details.halfTimeScoreB || 0}</span>
            </div>
            {details.currentPeriod && (
              <div className="flex justify-between items-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <span className="font-black uppercase tracking-wider text-rose-400">Period</span>
                <span className="font-mono text-rose-400">{details.currentPeriod}</span>
              </div>
            )}
          </div>
        );

      case 'Volleyball':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Sets Won</span>
              <span className="font-mono text-white">{details.setsWonA || 0} - {details.setsWonB || 0}</span>
            </div>
            {details.currentSetScoreA !== undefined && details.currentSetScoreB !== undefined && (
              <div className="flex justify-between items-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <span className="font-black uppercase tracking-wider text-rose-400">Current Set</span>
                <span className="font-mono text-rose-400">{details.currentSetScoreA} - {details.currentSetScoreB}</span>
              </div>
            )}
          </div>
        );

      case 'Badminton':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Sets Won</span>
              <span className="font-mono text-white">{details.setsWonA || 0} - {details.setsWonB || 0}</span>
            </div>
            {details.currentSetScoreA !== undefined && details.currentSetScoreB !== undefined && (
              <div className="flex justify-between items-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <span className="font-black uppercase tracking-wider text-rose-400">Current Set</span>
                <span className="font-mono text-rose-400">{details.currentSetScoreA} - {details.currentSetScoreB}</span>
              </div>
            )}
          </div>
        );

      case 'Kabaddi':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Raid Points</span>
              <span className="font-mono text-white">{details.raidPointsA || 0} - {details.raidPointsB || 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Tackle Points</span>
              <span className="font-mono text-white">{details.tacklePointsA || 0} - {details.tacklePointsB || 0}</span>
            </div>
          </div>
        );

      case 'Race':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Distance</span>
              <span className="font-mono text-white">{details.distance || 0}m</span>
            </div>
          </div>
        );

      case 'Musical Chair':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Rounds</span>
              <span className="font-mono text-white">{details.roundsCompleted || 0}</span>
            </div>
          </div>
        );

      case 'Kho-Kho':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Innings</span>
              <span className="font-mono text-white">{details.inningsA || 0} - {details.inningsB || 0}</span>
            </div>
          </div>
        );

      case 'LUDO':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Coins</span>
              <span className="font-mono text-white">{details.coinsA || 0} - {details.coinsB || 0}</span>
            </div>
          </div>
        );

      case 'Chess':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Moves</span>
              <span className="font-mono text-white">{details.movesPlayed || 0}</span>
            </div>
          </div>
        );

      case 'Carrom':
        return (
          <div className="mt-4 space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
              <span className="font-black uppercase tracking-wider">Boards Won</span>
              <span className="font-mono text-white">{details.boardsWonA || 0} - {details.boardsWonB || 0}</span>
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
        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <i className={`fa-solid ${SPORT_ICONS[match.sport] || 'fa-trophy'}`}></i>
          {match.sport}
        </span>
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

      {/* Venue */}
      {match.venue && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            <i className="fa-solid fa-location-dot"></i>
            {match.venue}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex flex-col items-center text-center flex-1">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-3 border border-white/5 relative ${
            match.status === 'COMPLETED' && match.details?.winner === teamA 
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400' 
              : match.status === 'COMPLETED' && match.details?.winner === teamB
              ? 'bg-slate-700 border-slate-600' 
              : 'bg-slate-800 border-white/5'
          }`}>
            {teamA.charAt(0)}
            {match.status === 'COMPLETED' && match.details?.winner === teamA && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <i className="fa-solid fa-crown text-amber-400 text-lg"></i>
              </div>
            )}
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
          <div className="text-4xl font-black font-oswald tabular-nums glory-gradient">
            {match.scoreA} : {match.scoreB}
          </div>
          <div className="text-[9px] text-slate-600 font-black tracking-widest mt-1 uppercase italic">Arena Score</div>
        </div>

        <div className="flex flex-col items-center text-center flex-1">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-3 border border-white/5 relative ${
            match.status === 'COMPLETED' && match.details?.winner === teamB 
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400' 
              : match.status === 'COMPLETED' && match.details?.winner === teamA
              ? 'bg-slate-700 border-slate-600' 
              : 'bg-slate-800 border-white/5'
          }`}>
            {teamB.charAt(0)}
            {match.status === 'COMPLETED' && match.details?.winner === teamB && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <i className="fa-solid fa-crown text-amber-400 text-lg"></i>
              </div>
            )}
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
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/30 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <i className="fa-solid fa-trophy text-amber-400 text-lg"></i>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Winner</span>
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
          <div className="flex w-full gap-2 sm:flex-col sm:gap-2">
            <div className="flex gap-2 flex-1 sm:flex-col">
              <button
                onClick={() => onUpdate(match.id, { scoreA: Math.max(0, match.scoreA - 1), status: 'LIVE' })}
                className="flex-1 sm:w-full py-2 px-2 bg-red-900/50 hover:bg-red-800/50 rounded-xl text-[8px] sm:text-[9px] font-black uppercase transition-colors"
              >
                -1 {teamA}
              </button>
              <button
                onClick={() => onUpdate(match.id, { scoreA: match.scoreA + 1, status: 'LIVE' })}
                className="flex-1 sm:w-full py-2 px-2 bg-green-900/50 hover:bg-green-800/50 rounded-xl text-[8px] sm:text-[9px] font-black uppercase transition-colors"
              >
                +1 {teamA}
              </button>
            </div>
            <div className="flex gap-2 flex-1 sm:flex-col">
              <button
                onClick={() => onUpdate(match.id, { scoreB: Math.max(0, match.scoreB - 1), status: 'LIVE' })}
                className="flex-1 sm:w-full py-2 px-2 bg-red-900/50 hover:bg-red-800/50 rounded-xl text-[8px] sm:text-[9px] font-black uppercase transition-colors"
              >
                -1 {teamB}
              </button>
              <button
                onClick={() => onUpdate(match.id, { scoreB: match.scoreB + 1, status: 'LIVE' })}
                className="flex-1 sm:w-full py-2 px-2 bg-green-900/50 hover:bg-green-800/50 rounded-xl text-[8px] sm:text-[9px] font-black uppercase transition-colors"
              >
                +1 {teamB}
              </button>
            </div>
          </div>
          
          {/* Winner Declaration for Live Matches */}
          {match.status === 'LIVE' && (
            <div className="w-full">
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdate(match.id, { 
                        status: 'COMPLETED',
                        details: { winner: e.target.value }
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