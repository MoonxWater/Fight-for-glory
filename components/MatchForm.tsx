import React, { useState } from 'react';
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'scoreA' || name === 'scoreB' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.sport || !formData.teamA || !formData.teamB) {
      setError('All fields are required');
      return;
    }

    if (formData.teamA === formData.teamB) {
      setError('Teams must be different');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onSubmit(formData);
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
          >
            <option value="">Select Sport</option>
            {sportOptions.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>

        {/* Status */}
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
            placeholder="e.g., CSE, ECE, MECH"
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
            placeholder="e.g., CSE, ECE, MECH"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>

        {/* Score A */}
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

        {/* Score B */}
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
      </div>

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
