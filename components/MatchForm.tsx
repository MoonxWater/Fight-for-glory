import React, { useState, useEffect } from 'react';
import { Match, MatchUpdates, SportType } from '../types';

interface MatchFormProps {
  match?: Match | null;
  sportOptions: SportType[];
  onSubmit: (data: Partial<Match> | MatchUpdates) => Promise<boolean>;
  onCancel: () => void;
}

export const MatchForm: React.FC<MatchFormProps> = ({ match, sportOptions, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    sport: match?.sport || '',
    teamA: match?.teamA || '',
    teamB: match?.teamB || '',
    scoreA: match?.scoreA || 0,
    scoreB: match?.scoreB || 0,
    status: match?.status || 'UPCOMING' as const,
    gender: match?.gender || 'boys',
    venue: match?.venue || 'Playground-1',
    details: (() => {
      const d = match?.details || {} as any;
      // If we have a formatted wickets string, parse it for the UI
      // For now, we rely on wicketsA and wicketsB being present in details
      return d;
    })()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update details calculation logic when sport changes
  useEffect(() => {
    if (!match && formData.sport) {
      // Reset details for new matches when sport changes
      const defaultDetails: any = {};
      switch (formData.sport) {
        case 'Cricket':
          defaultDetails.overs = 10;
          defaultDetails.scoreA = 0;
          defaultDetails.scoreB = 0;
          defaultDetails.wicketsA = 0;
          defaultDetails.wicketsB = 0;
          break;
        case 'Football': defaultDetails.halfTimeScoreA = 0; defaultDetails.halfTimeScoreB = 0; break;
        case 'Volleyball': defaultDetails.setsWonA = 0; defaultDetails.setsWonB = 0; break;
        case 'Kabaddi': defaultDetails.pointsA = 0; defaultDetails.pointsB = 0; break;
        case 'Race': defaultDetails.distance = 100; break;
        case 'Musical Chair': defaultDetails.roundsCompleted = 0; break;
        case 'Needle & Thread': defaultDetails.completed = false; break;
        default: break;
      }
      setFormData(prev => ({ ...prev, details: defaultDetails }));
    }
  }, [formData.sport]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'scoreA' || name === 'scoreB' ? parseInt(value) || 0 : value
    }));
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.sport || !formData.teamA || !formData.teamB || !formData.venue) {
      setError('All required fields must be filled');
      return;
    }

    if (formData.teamA === formData.teamB) {
      setError('Teams must be different');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Construct strict details payload based on sport
      const finalData = { ...formData };
      const d = finalData.details;

      if (finalData.sport === 'Cricket') {
        finalData.details = {
          oversA: Number(d.oversA) || 0,
          wicketsA: Number(d.wicketsA) || 0,
          oversB: Number(d.oversB) || 0,
          wicketsB: Number(d.wicketsB) || 0,
          currentInnings: d.currentInnings || 'None'
        };
      } else if (finalData.sport === 'Football') {
        finalData.details = {
          halfTimeScoreA: Math.floor(Number(d.halfTimeScoreA) || 0),
          halfTimeScoreB: Math.floor(Number(d.halfTimeScoreB) || 0),
          currentPeriod: d.currentPeriod || '1st Half'
        };
      } else if (finalData.sport === 'Volleyball') {
        finalData.details = {
          setsWonA: Math.floor(Number(d.setsWonA) || 0),
          setsWonB: Math.floor(Number(d.setsWonB) || 0),
          currentSetScoreA: Math.floor(Number(d.currentSetScoreA) || 0),
          currentSetScoreB: Math.floor(Number(d.currentSetScoreB) || 0)
        };
      } else if (finalData.sport === 'Badminton') {
        finalData.details = {
          setsWonA: Math.floor(Number(d.setsWonA) || 0),
          setsWonB: Math.floor(Number(d.setsWonB) || 0),
          currentSetScoreA: Math.floor(Number(d.currentSetScoreA) || 0),
          currentSetScoreB: Math.floor(Number(d.currentSetScoreB) || 0)
        };
      } else if (finalData.sport === 'Kabaddi') {
        finalData.details = {
          raidPointsA: Math.floor(Number(d.raidPointsA) || 0),
          raidPointsB: Math.floor(Number(d.raidPointsB) || 0),
          tacklePointsA: Math.floor(Number(d.tacklePointsA) || 0),
          tacklePointsB: Math.floor(Number(d.tacklePointsB) || 0)
        };
      } else if (finalData.sport === 'Musical Chair') {
        finalData.details = {
          roundsCompleted: Math.floor(Number(d.roundsCompleted) || 0),
        };
      } else if (finalData.sport === 'Kho-Kho') {
        finalData.details = {
          inningsA: Math.floor(Number(d.inningsA) || 0),
          inningsB: Math.floor(Number(d.inningsB) || 0)
        };
      } else if (finalData.sport === 'LUDO') {
        finalData.details = {
          coinsA: Math.floor(Number(d.coinsA) || 0),
          coinsB: Math.floor(Number(d.coinsB) || 0)
        };
      } else if (finalData.sport === 'Chess') {
        finalData.details = {
          movesPlayed: Math.floor(Number(d.movesPlayed) || 0)
        };
      } else if (finalData.sport === 'Carrom') {
        finalData.details = {
          boardsWonA: Math.floor(Number(d.boardsWonA) || 0),
          boardsWonB: Math.floor(Number(d.boardsWonB) || 0)
        };
      } else if (finalData.sport === 'Race') {
        finalData.details = {
          distance: Number(d.distance) || 100,
        };
      } else if (finalData.sport === 'Skipping') {
        finalData.details = {
          jumps: Math.floor(Number(d.jumps) || 0)
        };
      } else if (finalData.sport === 'Tug of War') {
        finalData.details = {
          roundsWonA: Math.floor(Number(d.roundsWonA) || 0),
          roundsWonB: Math.floor(Number(d.roundsWonB) || 0)
        };
      } else if (finalData.sport === 'Shot Put') {
        finalData.details = {
          distanceA: Number(d.distanceA) || 0,
          distanceB: Number(d.distanceB) || 0
        };
      } else if (finalData.sport === 'Needle & Thread') {
        finalData.details = {
          completed: Boolean(d.completed),
        };
      } else if (finalData.sport === 'Spoon Race') {
        finalData.details = {
          roundsCompleted: Math.floor(Number(d.roundsCompleted) || 0),
        };
      }

      const success = await onSubmit(finalData);
      if (!success) {
        setError('Operation failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sport Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Sport *
          </label>
          <select
            name="sport"
            value={formData.sport}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
            disabled={!!match} // Disable sport change on edit to simplify logic
          >
            <option value="">Select Sport</option>
            {sportOptions.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Gender Category *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          >
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
          </select>
        </div>

        {/* Status - Only show when editing */
          match && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Match Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          )}

        {/* Venue */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Venue *
          </label>
          <select
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          >
            <option value="">Select Venue</option>
            <option value="Playground-1">Playground-1</option>
            <option value="Playground-2">Playground-2</option>
            <option value="Playground-3">Playground-3</option>
            <option value="Playground-4">Playground-4</option>
            <option value="Seminar-Hall">Seminar-Hall</option>
          </select>
        </div>

        {/* Team A */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Team A *
          </label>
          <input
            type="text"
            name="teamA"
            value={formData.teamA}
            onChange={handleInputChange}
            placeholder="e.g., CSE"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>

        {/* Team B */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Team B *
          </label>
          <input
            type="text"
            name="teamB"
            value={formData.teamB}
            onChange={handleInputChange}
            placeholder="e.g., ECE"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>

        {/* Scores - Only show when editing */}
        {match && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Team A Score
              </label>
              <input
                type="number"
                name="scoreA"
                value={formData.scoreA}
                onChange={handleInputChange}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Team B Score
              </label>
              <input
                type="number"
                name="scoreB"
                value={formData.scoreB}
                onChange={handleInputChange}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </>
        )}
      </div>

      {/* Dynamic Details Section Based on Sport Schema */}
      {formData.sport && (
        <div className="pt-4 border-t border-slate-700">
          <h4 className="text-white font-medium mb-3">{formData.sport} Details</h4>

          {/* Cricket Fields */}
          {formData.sport === 'Cricket' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Team A Overs *
                </label>
                <input
                  type="number"
                  name="oversA"
                  value={formData.details.oversA || 0}
                  onChange={handleDetailsChange}
                  step="0.1"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Team A Wickets
                </label>
                <input
                  type="number"
                  name="wicketsA"
                  value={formData.details.wicketsA || 0}
                  onChange={handleDetailsChange}
                                    max="10"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Team B Overs *
                </label>
                <input
                  type="number"
                  name="oversB"
                  value={formData.details.oversB || 0}
                  onChange={handleDetailsChange}
                  step="0.1"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Team B Wickets 
                </label>
                <input
                  type="number"
                  name="wicketsB"
                  value={formData.details.wicketsB || 0}
                  onChange={handleDetailsChange}
                                    max="10"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Innings *
                </label>
                <select
                  name="currentInnings"
                  value={formData.details.currentInnings || 'None'}
                  onChange={handleDetailsChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select Innings</option>
                  <option value="None">None</option>
                  <option value="TeamA">Team A</option>
                  <option value="TeamB">Team B</option>
                </select>
              </div>
            </div>
          )}

          {/* Football Fields */}
          {formData.sport === 'Football' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Half Time Score A *
                </label>
                <input
                  type="number"
                  name="halfTimeScoreA"
                  value={formData.details.halfTimeScoreA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Half Time Score B *
                </label>
                <input
                  type="number"
                  name="halfTimeScoreB"
                  value={formData.details.halfTimeScoreB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Period *
                </label>
                <select
                  name="currentPeriod"
                  value={formData.details.currentPeriod || '1st Half'}
                  onChange={handleDetailsChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Period</option>
                  <option value="1st Half">1st Half</option>
                  <option value="2nd Half">2nd Half</option>
                  <option value="Extra">Extra</option>
                </select>
              </div>
            </div>
          )}

          {/* Volleyball Fields */}
          {formData.sport === 'Volleyball' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sets Won A *
                </label>
                <input
                  type="number"
                  name="setsWonA"
                  value={formData.details.setsWonA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sets Won B *
                </label>
                <input
                  type="number"
                  name="setsWonB"
                  value={formData.details.setsWonB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Set Score A *
                </label>
                <input
                  type="number"
                  name="currentSetScoreA"
                  value={formData.details.currentSetScoreA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Set Score B *
                </label>
                <input
                  type="number"
                  name="currentSetScoreB"
                  value={formData.details.currentSetScoreB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* Badminton Fields */}
          {formData.sport === 'Badminton' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sets Won A *
                </label>
                <input
                  type="number"
                  name="setsWonA"
                  value={formData.details.setsWonA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sets Won B *
                </label>
                <input
                  type="number"
                  name="setsWonB"
                  value={formData.details.setsWonB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Set Score A *
                </label>
                <input
                  type="number"
                  name="currentSetScoreA"
                  value={formData.details.currentSetScoreA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Set Score B *
                </label>
                <input
                  type="number"
                  name="currentSetScoreB"
                  value={formData.details.currentSetScoreB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* Kabaddi Fields */}
          {formData.sport === 'Kabaddi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Raid Points A *
                </label>
                <input
                  type="number"
                  name="raidPointsA"
                  value={formData.details.raidPointsA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Raid Points B *
                </label>
                <input
                  type="number"
                  name="raidPointsB"
                  value={formData.details.raidPointsB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tackle Points A *
                </label>
                <input
                  type="number"
                  name="tacklePointsA"
                  value={formData.details.tacklePointsA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tackle Points B *
                </label>
                <input
                  type="number"
                  name="tacklePointsB"
                  value={formData.details.tacklePointsB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* Musical Chair Fields */}
          {formData.sport === 'Musical Chair' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rounds Completed *
              </label>
              <input
                type="number"
                name="roundsCompleted"
                value={formData.details.roundsCompleted || 0}
                onChange={handleDetailsChange}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Kho-Kho Fields */}
          {formData.sport === 'Kho-Kho' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Innings A *
                </label>
                <input
                  type="number"
                  name="inningsA"
                  value={formData.details.inningsA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Innings B *
                </label>
                <input
                  type="number"
                  name="inningsB"
                  value={formData.details.inningsB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* LUDO Fields */}
          {formData.sport === 'LUDO' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Coins A *
                </label>
                <input
                  type="number"
                  name="coinsA"
                  value={formData.details.coinsA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Coins B *
                </label>
                <input
                  type="number"
                  name="coinsB"
                  value={formData.details.coinsB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* Chess Fields */}
          {formData.sport === 'Chess' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Moves Played *
              </label>
              <input
                type="number"
                name="movesPlayed"
                value={formData.details.movesPlayed || 0}
                onChange={handleDetailsChange}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Carrom Fields */}
          {formData.sport === 'Carrom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Boards Won A *
                </label>
                <input
                  type="number"
                  name="boardsWonA"
                  value={formData.details.boardsWonA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Boards Won B *
                </label>
                <input
                  type="number"
                  name="boardsWonB"
                  value={formData.details.boardsWonB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* Race Fields */}
          {formData.sport === 'Race' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Distance (meters) *
              </label>
              <input
                type="number"
                name="distance"
                value={formData.details.distance || 100}
                onChange={handleDetailsChange}
                step="0.1"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Skipping Fields */}
          {formData.sport === 'Skipping' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Jumps *
              </label>
              <input
                type="number"
                name="jumps"
                value={formData.details.jumps || 0}
                onChange={handleDetailsChange}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Tug of War Fields */}
          {formData.sport === 'Tug of War' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rounds Won A *
                </label>
                <input
                  type="number"
                  name="roundsWonA"
                  value={formData.details.roundsWonA || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rounds Won B *
                </label>
                <input
                  type="number"
                  name="roundsWonB"
                  value={formData.details.roundsWonB || 0}
                  onChange={handleDetailsChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* Shot Put Fields */}
          {formData.sport === 'Shot Put' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Distance A (meters) *
                </label>
                <input
                  type="number"
                  name="distanceA"
                  value={formData.details.distanceA || 0}
                  onChange={handleDetailsChange}
                  step="0.1"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Distance B (meters) *
                </label>
                <input
                  type="number"
                  name="distanceB"
                  value={formData.details.distanceB || 0}
                  onChange={handleDetailsChange}
                  step="0.1"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {/* Needle & Thread Fields */}
          {formData.sport === 'Needle & Thread' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="completed"
                checked={!!formData.details.completed}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  details: { ...prev.details, completed: e.target.checked }
                }))}
                className="h-4 w-4 bg-slate-700 border-slate-600 rounded focus:ring-rose-500"
              />
              <label className="ml-2 block text-sm font-medium text-slate-300">
                Completed
              </label>
            </div>
          )}

          {/* Spoon Race Fields */}
          {formData.sport === 'Spoon Race' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rounds Completed *
              </label>
              <input
                type="number"
                name="roundsCompleted"
                value={formData.details.roundsCompleted || 0}
                onChange={handleDetailsChange}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
          )}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-all"
        >
          {loading ? 'Saving...' : (match ? 'Update Match' : 'Create Match')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
