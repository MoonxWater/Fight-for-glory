import React, { useState } from 'react';
import { Match, SportType } from '../types';

interface MatchListProps {
  matches: Match[];
  onEdit: (match: Match) => void;
  onDelete: (id: string) => Promise<boolean>;
  sportOptions: SportType[];
}

export const MatchList: React.FC<MatchListProps> = ({ matches, onEdit, onDelete, sportOptions }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredMatches = matches.filter(match => {
    const sportMatch = filterSport === 'all' || match.sport === filterSport;
    const statusMatch = filterStatus === 'all' || match.status === filterStatus;
    return sportMatch && statusMatch;
  });

  const handleDelete = async (id: string) => {
    const success = await onDelete(id);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'UPCOMING': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'COMPLETED': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Sport</label>
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="all">All Sports</option>
              {sportOptions.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="LIVE">Live</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matches Table */}
      {filteredMatches.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
          <div className="text-slate-400 text-lg">No matches found</div>
          <div className="text-slate-500 text-sm mt-2">
            {matches.length === 0 ? 'Create your first match to get started' : 'Try adjusting the filters'}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Sport</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Teams</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{match.sport}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        <div className="font-medium">{match.teamA}</div>
                        <div className="text-slate-400">vs</div>
                        <div className="font-medium">{match.teamB}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-white">
                        {match.scoreA} - {match.scoreB}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(match.status)}`}>
                        {match.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {formatDate(match.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(match)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        {deleteConfirm === match.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(match.id)}
                              className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(match.id)}
                            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
