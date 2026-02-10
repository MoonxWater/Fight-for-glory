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
  const [filterSport, setFilterSport] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterVenue, setFilterVenue] = useState<string>('');
  const [filterBatch, setFilterBatch] = useState<string>('');

  const filteredMatches = matches.filter(match => {
    const sportMatch = !filterSport || match.sport === filterSport;
    const statusMatch = !filterStatus || match.status === filterStatus;
    const genderMatch = !filterGender || match.gender === filterGender;
    const venueMatch = !filterVenue || match.venue === filterVenue;
    const batchMatch = !filterBatch || match.batch === filterBatch;
    return sportMatch && statusMatch && genderMatch && venueMatch && batchMatch;
  });

  const handleDelete = async (id: string) => {
    const success = await onDelete(id);
    if (success) {
      setDeleteConfirm(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Sport</label>
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">All Sports</option>
              <option value="Cricket">Cricket</option>
              <option value="Football">Football</option>
              <option value="Volleyball">Volleyball</option>
              <option value="Badminton">Badminton</option>
              <option value="Kabaddi">Kabaddi</option>
              <option value="Musical Chair">Musical Chair</option>
              <option value="Kho-Kho">Kho-Kho</option>
              <option value="LUDO">Ludo</option>
              <option value="Chess">Chess</option>
              <option value="Carrom">Carrom</option>
              <option value="Race">Race</option>
              <option value="Skipping">Skipping</option>
              <option value="Tug of War">Tug of War</option>
              <option value="Shot Put">Shot Put</option>
              <option value="Needle & Thread">Needle & Thread</option>
              <option value="Spoon Race">Spoon Race</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="LIVE">Live</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Gender</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">All Genders</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Venue</label>
            <select
              value={filterVenue}
              onChange={(e) => setFilterVenue(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">All Venues</option>
              <option value="Playground-1">Playground-1</option>
              <option value="Playground-2">Playground-2</option>
              <option value="Playground-3">Playground-3</option>
              <option value="Playground-4">Playground-4</option>
              <option value="Seminar-Hall">Seminar-Hall</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Batch</label>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">All Batches</option>
              <option value="22">2022 Batch</option>
              <option value="23">2023 Batch</option>
              <option value="24">2024 Batch</option>
              <option value="25">2025 Batch</option>
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Gender</th>
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
                      {match.gender && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getGenderColor(match.gender)}`}>
                          <i className={`fa-solid ${getGenderIcon(match.gender)} text-[8px]`}></i>
                          {match.gender}
                        </span>
                      )}
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
