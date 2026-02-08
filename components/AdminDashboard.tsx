import React, { useState, useEffect } from 'react';
import { Match, MatchUpdates, SportType } from '../types';
import { api } from '../services/api';
import { MatchForm } from './MatchForm.tsx';
import { MatchList } from './MatchList.tsx';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [boysGames, setBoysGames] = useState<string[]>([]);
  const [girlsGames, setGirlsGames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const sportOptions: string[] = [...boysGames, ...girlsGames];

  // Debug: Log the games being fetched
  console.log('Boys games:', boysGames);
  console.log('Girls games:', girlsGames);
  console.log('Combined sport options:', sportOptions);

  useEffect(() => {
    fetchMatches(); // Initial fetch of all data
    const interval = setInterval(fetchLiveMatches, 5000); // Only poll live matches every 5 seconds
    return () => clearInterval(interval);
  }, [refreshKey]);

  const fetchLiveMatches = async () => {
    try {
      const liveMatches = await api.getLiveMatches();
      // Update only live matches in the existing matches array
      setMatches(prev => {
        const nonLiveMatches = prev.filter(m => m.status !== 'LIVE');
        return [...nonLiveMatches, ...liveMatches];
      });
    } catch (err) {
      console.error("Live matches fetch error:", err);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const [matchesData, boysGamesList, girlsGamesList] = await Promise.all([
        api.getMatches(),
        api.getGamesByGender('boys'),
        api.getGamesByGender('girls')
      ]);
      setMatches(matchesData);
      setBoysGames(boysGamesList);
      setGirlsGames(girlsGamesList);
      setError(null);
    } catch (err) {
      setError('Failed to fetch matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (matchData: Partial<Match>) => {
    try {
      await api.createMatch(matchData);
      setShowCreateForm(false);
      setRefreshKey(prev => prev + 1);
      return true;
    } catch (err) {
      console.error('Error creating match:', err);
      return false;
    }
  };

  const handleUpdateMatch = async (id: string, updates: MatchUpdates) => {
    try {
      await api.updateMatch(id, updates);
      setEditingMatch(null);
      setRefreshKey(prev => prev + 1);
      return true;
    } catch (err) {
      console.error('Error updating match:', err);
      return false;
    }
  };

  const handleDeleteMatch = async (id: string) => {
    try {
      await api.deleteMatch(id);
      setRefreshKey(prev => prev + 1);
      return true;
    } catch (err) {
      console.error('Error deleting match:', err);
      return false;
    }
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setShowCreateForm(false);
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-orange-600 p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-rose-100 text-sm">Manage matches, scores, and tournament data</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="text-3xl font-bold text-white mb-1">{matches.length}</div>
              <div className="text-slate-400 text-sm">Total Matches</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {matches.filter(m => m.status === 'LIVE').length}
              </div>
              <div className="text-slate-400 text-sm">Live Matches</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {matches.filter(m => m.status === 'UPCOMING').length}
              </div>
              <div className="text-slate-400 text-sm">Upcoming</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="text-3xl font-bold text-slate-400 mb-1">
                {matches.filter(m => m.status === 'COMPLETED').length}
              </div>
              <div className="text-slate-400 text-sm">Completed</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              + Create New Match
            </button>
            <button
              onClick={fetchMatches}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Refresh Data
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
          ) : (
            <>
              {/* Create/Edit Form */}
              {(showCreateForm || editingMatch) && (
                <div className="mb-6">
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4">
                      {editingMatch ? 'Edit Match' : 'Create New Match'}
                    </h2>
                    <MatchForm
                      match={editingMatch}
                      sportOptions={sportOptions}
                      onSubmit={editingMatch ?
                        (data) => handleUpdateMatch(editingMatch.id, data) :
                        handleCreateMatch
                      }
                      onCancel={editingMatch ? handleCancelEdit : handleCancelCreate}
                    />
                  </div>
                </div>
              )}

              {/* Matches List */}
              <MatchList
                matches={matches}
                onEdit={handleEditMatch}
                onDelete={handleDeleteMatch}
                sportOptions={sportOptions}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
