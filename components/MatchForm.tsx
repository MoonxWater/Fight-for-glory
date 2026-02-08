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
    venue: match?.venue || 'Main Ground',
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
          overs: Number(d.overs) || 10,
          wickets: 0, // Explicitly required as int
          // We also keep these for UI state if needed by frontend, 
          // but the backend strict validation requires 'overs' and 'wickets'.
          scoreA: Number(d.scoreA) || 0,
          scoreB: Number(d.scoreB) || 0,
          wicketsA: Number(d.wicketsA) || 0,
          wicketsB: Number(d.wicketsB) || 0,
        };
      } else if (finalData.sport === 'Football') {
        finalData.details = {
          halfTimeScoreA: Math.floor(Number(d.halfTimeScoreA) || 0),
          halfTimeScoreB: Math.floor(Number(d.halfTimeScoreB) || 0),
        };
      } else if (finalData.sport === 'Volleyball') {
        finalData.details = {
          setsWonA: Math.floor(Number(d.setsWonA) || 0),
          setsWonB: Math.floor(Number(d.setsWonB) || 0),
        };
      } else if (finalData.sport === 'Kabaddi') {
        finalData.details = {
          pointsA: Math.floor(Number(d.pointsA) || 0),
          pointsB: Math.floor(Number(d.pointsB) || 0),
        };
      } else if (finalData.sport === 'Musical Chair') {
        finalData.details = {
          roundsCompleted: Math.floor(Number(d.roundsCompleted) || 0),
        };
      } else if (finalData.sport === 'Race') {
        finalData.details = {
          distance: Number(d.distance) || 100,
        };
      } else if (finalData.sport === 'Needle & Thread') {
        finalData.details = {
          completed: Boolean(d.completed),
        };
      }

      const success = await onSubmit(finalData);
      if (!success) {
        setError('Operation failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
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
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
            placeholder="e.g., Main Ground"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
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
                min="0"
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
                min="0"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </>
        )}
      </div>

      {/* Dynamic Details Section */}
      {formData.sport === 'Cricket' && (
        <div className="pt-4 border-t border-slate-700">
          <h4 className="text-white font-medium mb-3">Cricket Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Total Overs *
              </label>
              <input
                type="number"
                name="overs"
                value={formData.details.overs || ''}
                onChange={handleDetailsChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>

            {/* Cricket Scores & Wickets - Required in details for creation */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Team A Runs</label>
              <input
                type="number"
                name="scoreA"
                value={formData.details.scoreA || 0}
                onChange={handleDetailsChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Team A Wickets</label>
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Team B Runs</label>
              <input
                type="number"
                name="scoreB"
                value={formData.details.scoreB || 0}
                onChange={handleDetailsChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Team B Wickets</label>
              <input
                type="number"
                name="wicketsB"
                value={formData.details.wicketsB || 0}
                onChange={handleDetailsChange}
                max="10"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {(formData.sport === 'Football' || formData.sport === 'Volleyball' || formData.sport === 'Kabaddi') && (
        <div className="pt-4 border-t border-slate-700">
          <h4 className="text-white font-medium mb-3">{formData.sport} Details</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* We can add specific fields here if needed, but for now just basic initialization is handled in useEffect. 
                 If we want to allow editing "Half Time Score" or "Sets Won", we add inputs here. 
                 Let's add them for completeness as they are in the schema. */}

            {formData.sport === 'Football' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Half Time Score A</label>
                  <input type="number" name="halfTimeScoreA" value={formData.details.halfTimeScoreA || 0} onChange={handleDetailsChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Half Time Score B</label>
                  <input type="number" name="halfTimeScoreB" value={formData.details.halfTimeScoreB || 0} onChange={handleDetailsChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                </div>
              </>
            )}

            {formData.sport === 'Volleyball' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sets Won A</label>
                  <input type="number" name="setsWonA" value={formData.details.setsWonA || 0} onChange={handleDetailsChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sets Won B</label>
                  <input type="number" name="setsWonB" value={formData.details.setsWonB || 0} onChange={handleDetailsChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                </div>
              </>
            )}

            {formData.sport === 'Kabaddi' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Points A</label>
                  <input type="number" name="pointsA" value={formData.details.pointsA || 0} onChange={handleDetailsChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Points B</label>
                  <input type="number" name="pointsB" value={formData.details.pointsB || 0} onChange={handleDetailsChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {formData.sport === 'Race' && (
        <div className="pt-4 border-t border-slate-700">
          <h4 className="text-white font-medium mb-3">Race Details</h4>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Distance (meters) *
            </label>
            <input
              type="number"
              name="distance"
              value={formData.details.distance || ''}
              onChange={handleDetailsChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      )}

      {formData.sport === 'Musical Chair' && (
        <div className="pt-4 border-t border-slate-700">
          <h4 className="text-white font-medium mb-3">Musical Chair Details</h4>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rounds Completed
            </label>
            <input
              type="number"
              name="roundsCompleted"
              value={formData.details.roundsCompleted || 0}
              onChange={handleDetailsChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {formData.sport === 'Needle & Thread' && (
        <div className="pt-4 border-t border-slate-700">
          <h4 className="text-white font-medium mb-3">Needle & Thread Details</h4>
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
