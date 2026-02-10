import React, { useState, useEffect, useMemo } from 'react';
import { Match, MatchUpdates, ViewState, SportType } from './types';
import { SPORT_ICONS, SPORT_CONFIG, BOYS_SPORTS, GIRLS_SPORTS } from './constants';
import { MatchCard } from './components/MatchCard';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { api, setAdminKey } from './services/api';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Derived types for local UI state
interface TeamStats {
  name: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  sport: string;
}

type Category = 'Boys' | 'Girls';

const App: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [boysGames, setBoysGames] = useState<string[]>([]);
  const [girlsGames, setGirlsGames] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('Final Day of Fight for Glory 2026 at MACET!');
  const [liveStreamUrl, setLiveStreamUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>('LANDING');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSport, setActiveSport] = useState<string | null>(null);

  // Match filtering state
  const [matchFilters, setMatchFilters] = useState({
    sport: '',
    gender: '',
    venue: '',
    batch: ''
  });

  // Filter matches based on selected filters
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // Sport filter
      if (matchFilters.sport && match.sport !== matchFilters.sport) {
        return false;
      }
      
      // Gender filter
      if (matchFilters.gender && match.gender !== matchFilters.gender) {
        return false;
      }
      
      // Venue filter
      if (matchFilters.venue && match.venue !== matchFilters.venue) {
        return false;
      }
      
      // Batch filter (assuming batch is in details or a separate field)
      if (matchFilters.batch) {
        // Check if batch is in details or as a separate field
        const matchBatch = match.details?.batch || match.batch || '';
        if (matchBatch !== matchFilters.batch) {
          return false;
        }
      }
      
      return true;
    });
  }, [matches, matchFilters]);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check for existing admin session on mount
  useEffect(() => {
    const savedAdminKey = localStorage.getItem('adminKey');
    console.log('Found saved admin key:', savedAdminKey);
    if (savedAdminKey && savedAdminKey === import.meta.env.VITE_ADMIN_LOGIN_KEY) {
      setAdminKey(import.meta.env.VITE_ADMIN_API_KEY);
      setIsAdmin(true);
      console.log('Admin session restored with key:', savedAdminKey);
    } else if (savedAdminKey) {
      console.log('Invalid admin key found, clearing...');
      localStorage.removeItem('adminKey');
    }
  }, []);

  const handleLogin = (key: string) => {
    // Validate the admin key before granting access
    if (key === import.meta.env.VITE_ADMIN_LOGIN_KEY) {
      setAdminKey(import.meta.env.VITE_ADMIN_API_KEY);
      localStorage.setItem('adminKey', key); // Save the UI key
      setIsAdmin(true);
      setShowAdminPanel(false);
    } else {
      alert('Invalid admin key! Access denied.');
      // Clear the input and keep panel open for retry
      setShowAdminPanel(true);
    }
  };

  const handleLogout = () => {
    setAdminKey('');
    localStorage.removeItem('adminKey'); // Remove from localStorage
    setIsAdmin(false);
    setShowAdminPanel(false);
  };

  // Fetch games when category changes
  useEffect(() => {
    if (activeCategory) {
      fetchGamesForCategory(activeCategory);
    }
  }, [activeCategory]);

  // Initial data fetch and live match polling
  useEffect(() => {
    fetchData(); // Initial fetch of all data
  }, []); // Only run once on mount

  // Poll for live matches only when on relevant views
  useEffect(() => {
    fetchLiveMatches(); // Initial fetch
    const interval = setInterval(fetchLiveMatches, 5000);
    return () => clearInterval(interval);
  }, [viewState, activeSport]); // Re-start when view or sport changes

  const fetchLiveMatches = async () => {
    // Only poll live matches on views that need real-time updates
    if (!['SPORT_DETAIL', 'LEADERBOARD', 'MATCHES'].includes(viewState)) {
      return;
    }

    try {
      const allMatches = await api.getMatches();
      const liveMatches = allMatches.filter(m => m.status === 'LIVE');
      // Update only live matches in existing matches array
      setMatches(prev => {
        const nonLiveMatches = prev.filter(m => m.status !== 'LIVE');
        return [...nonLiveMatches, ...liveMatches];
      });
    } catch (err) {
      console.error("Live matches fetch error:", err);
    }
  };

  const fetchData = async () => {
    try {
      const [allMatches] = await Promise.all([
        api.getMatches()
      ]);
      setMatches(allMatches);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
      // Set empty matches to allow UI to load
      setMatches([]);
    }
  };

  const fetchGamesForCategory = async (category: Category) => {
    try {
      const gamesList = await api.getGamesByGender(category.toLowerCase() as 'boys' | 'girls');
      if (category === 'Boys') {
        setBoysGames(gamesList);
      } else {
        setGirlsGames(gamesList);
      }
    } catch (err) {
      console.error(`Error fetching ${category} games:`, err);
    }
  };

  // Derive participants (teams) from match history
  const participants = useMemo(() => {
    const stats: Record<string, TeamStats> = {};

    matches.forEach(m => {
      if (!stats[m.teamA]) {
        stats[m.teamA] = { name: m.teamA, matchesPlayed: 0, wins: 0, losses: 0, draws: 0, points: 0, sport: m.sport };
      }
      if (!stats[m.teamB]) {
        stats[m.teamB] = { name: m.teamB, matchesPlayed: 0, wins: 0, losses: 0, draws: 0, points: 0, sport: m.sport };
      }

      if (m.status === 'COMPLETED' || m.status === 'LIVE') {
        stats[m.teamA].matchesPlayed++;
        stats[m.teamB].matchesPlayed++;

        if (m.scoreA > m.scoreB) {
          stats[m.teamA].wins++;
          stats[m.teamB].losses++;
        } else if (m.scoreB > m.scoreA) {
          stats[m.teamB].wins++;
          stats[m.teamA].losses++;
        } else {
          stats[m.teamA].draws++;
          stats[m.teamB].draws++;
        }
        // Note: Points are no longer calculated from matches - trophies remain static
      }
    });

    return Object.values(stats);
  }, [matches]);

  const updateMatch = async (id: string, updates: Partial<Match>) => {
    if (!isAdmin) return;
    try {
      // Optimistic update
      setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      await api.updateMatch(id, updates);
      fetchData(); // Sync exact state
      setError(null);
    } catch (err: any) {
      setError(err.message);
      fetchData(); // Revert
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!isAdmin || !confirm("Are you sure you want to delete this match?")) return;
    try {
      await api.deleteMatch(id);
      fetchData();
      setError(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      // If match not found, refresh data to remove it from UI
      if (err.message.includes('not found')) {
        fetchData();
        setError('Match was not found on server. Refreshing data...');
      } else {
        setError(err.message);
      }
    }
  };

  const scheduleMatch = async () => {
    if (!isAdmin) return;

    // First select sport based on active category
    let selectedSport: string;
    if (activeCategory === 'Boys') {
      const boySports = ['Cricket', 'Football', 'Volleyball', 'Carrom', 'Kabaddi', 'Badminton', 'Chess', 'Race', 'Tug of War', 'Kho-Kho', 'Musical Chair', 'LUDO'];
      const sportOptions = boySports.join(', ');
      selectedSport = prompt(`Enter Sport for Boys (${sportOptions}):`);
    } else if (activeCategory === 'Girls') {
      const girlSports = ['Cricket', 'Football', 'Volleyball', 'Carrom', 'Kabaddi', 'Badminton', 'Chess', 'Race', 'Tug of War', 'Kho-Kho', 'Musical Chair', 'LUDO', 'Needle & Thread', 'Spoon Race', 'Shot Put', 'Skipping'];
      const sportOptions = girlSports.join(', ');
      selectedSport = prompt(`Enter Sport for Girls (${sportOptions}):`);
    } else {
      alert('Please select a category first (Boys or Girls)');
      return;
    }

    if (!selectedSport) return;

    const teamA = prompt("Enter Team A Name:");
    if (!teamA) return;
    const teamB = prompt("Enter Team B Name:");
    if (!teamB) return;
    const venue = prompt("Enter Venue (Required):", "Main Ground");
    if (!venue) return;

    let details: any = {};

    switch (selectedSport) {
      case 'Cricket': {
        const oversA = prompt("Enter Overs for Team A:");
        const oversB = prompt("Enter Overs for Team B:");
        const wicketsA = prompt("Enter Wickets for Team A:");
        const wicketsB = prompt("Enter Wickets for Team B:");
        const currentInnings = prompt("Current Innings (TeamA/TeamB):", "TeamA");
        if (oversA !== null && oversB !== null && wicketsA !== null && wicketsB !== null && currentInnings !== null) {
          details = {
            oversA: parseFloat(oversA),
            wicketsA: parseInt(wicketsA),
            oversB: parseFloat(oversB),
            wicketsB: parseInt(wicketsB),
            currentInnings: currentInnings
          };
        }
        break;
      }
      case 'Football': {
        const halfTimeScoreA = prompt("Enter Half Time Score for Team A:");
        const halfTimeScoreB = prompt("Enter Half Time Score for Team B:");
        const currentPeriod = prompt("Current Period (1st Half/2nd Half/Extra):", "1st Half");
        if (halfTimeScoreA !== null && halfTimeScoreB !== null && currentPeriod !== null) {
          details = {
            halfTimeScoreA: parseInt(halfTimeScoreA),
            halfTimeScoreB: parseInt(halfTimeScoreB),
            currentPeriod: currentPeriod
          };
        }
        break;
      }
      case 'Volleyball': {
        const setsWonA = prompt("Enter Sets Won by Team A:");
        const setsWonB = prompt("Enter Sets Won by Team B:");
        const currentSetScoreA = prompt("Enter Current Set Score for Team A:");
        const currentSetScoreB = prompt("Enter Current Set Score for Team B:");
        if (setsWonA !== null && setsWonB !== null && currentSetScoreA !== null && currentSetScoreB !== null) {
          details = {
            setsWonA: parseInt(setsWonA),
            setsWonB: parseInt(setsWonB),
            currentSetScoreA: parseInt(currentSetScoreA),
            currentSetScoreB: parseInt(currentSetScoreB)
          };
        }
        break;
      }
      case 'Badminton': {
        const setsWonA = prompt("Enter Sets Won by Team A:");
        const setsWonB = prompt("Enter Sets Won by Team B:");
        const currentSetScoreA = prompt("Enter Current Set Score for Team A:");
        const currentSetScoreB = prompt("Enter Current Set Score for Team B:");
        if (setsWonA !== null && setsWonB !== null && currentSetScoreA !== null && currentSetScoreB !== null) {
          details = {
            setsWonA: parseInt(setsWonA),
            setsWonB: parseInt(setsWonB),
            currentSetScoreA: parseInt(currentSetScoreA),
            currentSetScoreB: parseInt(currentSetScoreB)
          };
        }
        break;
      }
      case 'Kabaddi': {
        const raidPointsA = prompt("Enter Raid Points for Team A:");
        const raidPointsB = prompt("Enter Raid Points for Team B:");
        const tacklePointsA = prompt("Enter Tackle Points for Team A:");
        const tacklePointsB = prompt("Enter Tackle Points for Team B:");
        if (raidPointsA !== null && raidPointsB !== null && tacklePointsA !== null && tacklePointsB !== null) {
          details = {
            raidPointsA: parseInt(raidPointsA),
            raidPointsB: parseInt(raidPointsB),
            tacklePointsA: parseInt(tacklePointsA),
            tacklePointsB: parseInt(tacklePointsB)
          };
        }
        break;
      }
      case 'Musical Chair': {
        const roundsCompleted = prompt("Enter Rounds Completed:");
        if (roundsCompleted) {
          details = {
            roundsCompleted: parseInt(roundsCompleted)
          };
        }
        break;
      }
      case 'Kho-Kho': {
        const inningsA = prompt("Enter Innings for Team A:");
        const inningsB = prompt("Enter Innings for Team B:");
        if (inningsA !== null && inningsB !== null) {
          details = {
            inningsA: parseInt(inningsA),
            inningsB: parseInt(inningsB)
          };
        }
        break;
      }
      case 'LUDO': {
        const coinsA = prompt("Enter Coins for Team A:");
        const coinsB = prompt("Enter Coins for Team B:");
        if (coinsA !== null && coinsB !== null) {
          details = {
            coinsA: parseInt(coinsA),
            coinsB: parseInt(coinsB)
          };
        }
        break;
      }
      case 'Chess': {
        const movesPlayed = prompt("Enter Moves Played:");
        if (movesPlayed) {
          details = {
            movesPlayed: parseInt(movesPlayed)
          };
        }
        break;
      }
      case 'Carrom': {
        const boardsWonA = prompt("Enter Boards Won by Team A:");
        const boardsWonB = prompt("Enter Boards Won by Team B:");
        if (boardsWonA !== null && boardsWonB !== null) {
          details = {
            boardsWonA: parseInt(boardsWonA),
            boardsWonB: parseInt(boardsWonB)
          };
        }
        break;
      }
      case 'Race': {
        const distance = prompt("Enter Race Distance (meters):");
        if (distance) {
          details = {
            distance: parseFloat(distance)
          };
        }
        break;
      }
      case 'Skipping': {
        const jumps = prompt("Enter Number of Jumps:");
        if (jumps) {
          details = {
            jumps: parseInt(jumps)
          };
        }
        break;
      }
      case 'Tug of War': {
        const roundsWonA = prompt("Enter Rounds Won by Team A:");
        const roundsWonB = prompt("Enter Rounds Won by Team B:");
        if (roundsWonA !== null && roundsWonB !== null) {
          details = {
            roundsWonA: parseInt(roundsWonA),
            roundsWonB: parseInt(roundsWonB)
          };
        }
        break;
      }
      case 'Shot Put': {
        const distanceA = prompt("Enter Distance for Team A (meters):");
        const distanceB = prompt("Enter Distance for Team B (meters):");
        if (distanceA !== null && distanceB !== null) {
          details = {
            distanceA: parseFloat(distanceA),
            distanceB: parseFloat(distanceB)
          };
        }
        break;
      }
      case 'Needle & Thread': {
        const completed = prompt("Is Needle & Thread completed? (true/false):", "false");
        if (completed) {
          details = {
            completed: completed.toLowerCase() === 'true'
          };
        }
        break;
      }
      case 'Spoon Race': {
        const roundsCompleted = prompt("Enter Rounds Completed:");
        if (roundsCompleted) {
          details = {
            roundsCompleted: parseInt(roundsCompleted)
          };
        }
        break;
      }
      default:
        break;
    }

    try {
      await api.createMatch({
        sport: selectedSport,
        teamA,
        teamB,
        scoreA: 0,
        scoreB: 0,
        status: 'UPCOMING',
        gender: activeCategory?.toLowerCase() || 'boys',
        venue: venue,
        details: details
      });
      await fetchData();
      if (activeCategory) {
        fetchGamesForCategory(activeCategory);
      }
      setError(null);
    } catch (err: any) {
      setError("Scheduling failed: " + err.message);
    }
  };

  const currentMatches = useMemo(() => {
    return matches.filter(m => {
      const matchGender = m.gender?.toLowerCase() || 'boys'; // Default to boys if undefined for now
      const currentCategory = activeCategory?.toLowerCase();
      return m.sport === activeSport && (!currentCategory || matchGender === currentCategory);
    });
  }, [matches, activeSport, activeCategory]);

  const currentParticipants = useMemo(() => {
    const stats: Record<string, TeamStats> = {};

    currentMatches.forEach(m => {
      // Initialize if not exists
      if (!stats[m.teamA]) {
        stats[m.teamA] = { name: m.teamA, matchesPlayed: 0, wins: 0, losses: 0, draws: 0, points: 0, sport: m.sport };
      }
      if (!stats[m.teamB]) {
        stats[m.teamB] = { name: m.teamB, matchesPlayed: 0, wins: 0, losses: 0, draws: 0, points: 0, sport: m.sport };
      }

      // Only count stats for COMPLETED matches (and LIVE if desired, but usually only completed count for points)
      // The previous logic counted LIVE for points too?
      // User's previous logic: if (m.status === 'COMPLETED' || m.status === 'LIVE')
      if (m.status === 'COMPLETED' || m.status === 'LIVE') {
        stats[m.teamA].matchesPlayed++;
        stats[m.teamB].matchesPlayed++;

        if (m.scoreA > m.scoreB) {
          stats[m.teamA].wins++;
          stats[m.teamA].points += 3;
          stats[m.teamB].losses++;
        } else if (m.scoreB > m.scoreA) {
          stats[m.teamB].wins++;
          stats[m.teamB].points += 3;
          stats[m.teamA].losses++;
        } else {
          stats[m.teamA].draws++;
          stats[m.teamB].draws++;
          stats[m.teamA].points += 1;
          stats[m.teamB].points += 1;
        }
      }
    });

    return Object.values(stats);
  }, [currentMatches]);

  // Identify sports that have matches or are in our default list
  const availableSports = useMemo(() => {
    if (!activeCategory) return [];
    const games = activeCategory === 'Boys' ? boysGames : girlsGames;
    console.log(`${activeCategory} games:`, games);
    return games;
  }, [activeCategory, boysGames, girlsGames]);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-orbitron font-bold text-xl uppercase tracking-[0.3em] glory-gradient animate-pulse">Syncing Glory Arena...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="min-h-screen bg-[#020617] text-slate-100 pb-24 font-sans selection:bg-rose-500/30">
        {announcement && (
          <div className="glory-bg py-3 overflow-hidden border-b border-white/10 relative z-50 shadow-xl shadow-rose-900/10">
            <div className="animate-marquee">
              {[1, 2, 3, 4].map(i => (
                <span key={i} className="mx-12 text-[11px] font-black uppercase tracking-[0.4em] text-white flex items-center whitespace-nowrap">
                  <i className="fa-solid fa-bolt-lightning mr-3 text-yellow-300"></i>
                  LIVE UPDATE: {announcement}
                </span>
              ))}
            </div>
          </div>
        )}

        <header className="sticky top-0 z-40 glass border-b border-white/5 shadow-2xl px-6">
          <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
            <div
              className="flex items-center gap-4 cursor-pointer group"
              onClick={() => { setViewState('LANDING'); setActiveCategory(null); setActiveSport(null); }}
            >
              <div className="w-12 h-12 glory-bg rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:rotate-6 group-hover:scale-110">
                <i className="fa-solid fa-trophy text-white text-xl"></i>
              </div>
              <h1 className="font-orbitron text-2xl font-bold tracking-tighter uppercase italic leading-none pr-8">
                FIGHT FOR <span className="glory-gradient">GLORY</span>
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-10">
              {['LANDING', 'LEADERBOARD', 'MATCHES', 'LIVE_STREAM'].map((v) => (
                <button
                  key={v}
                  onClick={() => { setViewState(v as ViewState); setActiveCategory(null); }}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${viewState === v ? 'text-rose-500' : 'text-slate-500 hover:text-white'}`}
                >
                  {v.replace('_', ' ')}
                  {viewState === v && <span className="absolute bottom-0 left-0 w-full h-0.5 glory-bg rounded-full"></span>}
                </button>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl glass border border-white/5 hover:bg-white/10 transition-all"
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-white text-lg transition-transform ${isMobileMenuOpen ? 'rotate-90' : ''}`}></i>
            </button>

            <div className="flex items-center gap-4">
              {isAdmin ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-black uppercase tracking-widest text-rose-500">Official Access</div>
                    <div className="text-[11px] font-bold text-slate-300">Admin</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl border border-white/10 bg-slate-800 flex items-center justify-center">
                    <i className="fa-solid fa-user-shield text-rose-500"></i>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border border-rose-500/20"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAdminPanel(true)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border border-white/5">Admin Portal</button>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm mobile-nav-backdrop"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Navigation Panel */}
            <div className="absolute top-0 right-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl mobile-nav-panel">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h3 className="font-orbitron text-lg font-bold uppercase tracking-tighter">
                    NAVIGATION
                  </h3>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-xl glass border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
                  >
                    <i className="fa-solid fa-times text-white"></i>
                  </button>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex-1 p-6 space-y-2">
                  {['LANDING', 'LEADERBOARD', 'MATCHES', 'LIVE_STREAM'].map((v) => (
                    <button
                      key={v}
                      onClick={() => { 
                        setViewState(v as ViewState); 
                        setActiveCategory(null); 
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-6 py-4 rounded-2xl transition-all relative ${
                        viewState === v 
                          ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase tracking-[0.2em]">
                          {v.replace('_', ' ')}
                        </span>
                        {viewState === v && (
                          <i className="fa-solid fa-chevron-right text-rose-500"></i>
                        )}
                      </div>
                    </button>
                  ))}
                </nav>
                
                {/* Footer */}
                <div className="p-6 border-t border-white/10">
                  <div className="text-center text-[10px] text-slate-600 font-black uppercase tracking-widest">
                    FIGHT FOR GLORY 2026
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          )}
          {viewState === 'LANDING' && (
            <div className="space-y-20 animate-in fade-in zoom-in-95 duration-700">
              <div className="text-center max-w-5xl mx-auto space-y-8">
                <h2 className="text-rose-500 font-orbitron font-bold tracking-[0.4em] uppercase">Maulana Azad College of Engineering and Technology</h2>
                <h2 className="font-orbitron text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase italic tracking-tighter leading-[0.85] pr-4 sm:pr-8 lg:pr-12">
                  FIGHT FOR <br /><span className="glory-gradient inline-block mr-2 sm:mr-4 lg:mr-6">GLORY 2026</span>
                </h2>
                <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                  The premier athletic showcase of MACET. Join us as we crown the champions of 2026 in the ultimate battle for supreme glory.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                  { cat: 'Boys' as Category, img: '/boys_sports_ghibli.png', title: 'BOYS DIVISION' },
                  { cat: 'Girls' as Category, img: '/girls_sports_ghibli.png', title: 'GIRLS DIVISION' }
                ].map(x => (
                  <div
                    key={x.cat}
                    onClick={() => { setActiveCategory(x.cat); setViewState('CATEGORY'); }}
                    className="group relative h-[40rem] rounded-[4rem] overflow-hidden cursor-pointer transition-all hover:scale-[1.01] shadow-2xl ring-1 ring-white/10"
                  >
                    <img src={x.img} className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-105 group-hover:grayscale-0" alt={x.cat} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
                    <div className="absolute bottom-16 left-16">
                      <h3 className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase italic text-white tracking-tighter pr-4 sm:pr-8 lg:pr-12">{x.title}</h3>
                      <p className="text-rose-500 font-black uppercase text-xs tracking-[0.4em] mt-3">{x.cat} • Enter the Arena</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewState === 'CATEGORY' && activeCategory && (
            <div className="space-y-12 animate-in slide-in-from-bottom-10">
              <div className="flex items-center justify-between">
                <button onClick={() => { setViewState('LANDING'); setActiveCategory(null); }} className="flex items-center gap-4 text-slate-400 hover:text-white transition-all group px-5 py-3 bg-white/5 rounded-2xl border border-white/5">
                  <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                  <span className="text-[11px] font-black uppercase tracking-widest">Return Home</span>
                </button>
                <h2 className="font-orbitron text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter pr-4 sm:pr-8 lg:pr-12">
                  {activeCategory}' <span className="text-rose-500">SPORTS</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                {availableSports.map((sport) => (
                  <div
                    key={sport}
                    onClick={() => { setActiveSport(sport); setViewState('SPORT_DETAIL'); }}
                    className="glass p-6 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[3rem] cursor-pointer hover:bg-white/10 transition-all group border border-white/5 hover:border-rose-500/50 shadow-2xl"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 group-hover:glory-bg transition-all shadow-xl group-hover:scale-110">
                      <i className={`fa-solid ${SPORT_ICONS[sport as SportType] || 'fa-medal'} text-2xl sm:text-3xl lg:text-4xl text-slate-500 group-hover:text-white`}></i>
                    </div>
                    <h3 className="font-oswald text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black uppercase tracking-tight mb-2 text-white leading-tight">{sport}</h3>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest">{SPORT_CONFIG[sport as SportType]?.type || 'SOLO'} FORMAT</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewState === 'SPORT_DETAIL' && activeSport && (
            <div className="space-y-12 animate-in slide-in-from-bottom-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="space-y-6">
                  <button onClick={() => setViewState('CATEGORY')} className="flex items-center gap-4 text-slate-400 hover:text-white transition-all group">
                    <i className="fa-solid fa-chevron-left transition-transform group-hover:-translate-x-1"></i>
                    <span className="text-[11px] font-black uppercase tracking-widest">All Disciplines</span>
                  </button>
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 glory-bg rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                      <i className={`fa-solid ${SPORT_ICONS[activeSport as SportType] || 'fa-medal'} text-3xl sm:text-4xl md:text-5xl text-white`}></i>
                    </div>
                    <div>
                      <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none pr-4 sm:pr-8 lg:pr-12">{activeSport}</h2>
                      <p className="text-rose-500 text-sm font-bold uppercase tracking-widest mt-2">{activeCategory} Division • MACET</p>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={scheduleMatch}
                      className="px-8 py-5 bg-rose-600 hover:bg-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all hover:-translate-y-1"
                    >
                      Schedule Match
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h4 className="font-oswald text-2xl font-bold uppercase flex items-center gap-3 tracking-widest text-rose-500">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                  Match Schedule
                </h4>
                {currentMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {currentMatches.map(m => (
                      <div key={m.id} className="relative group">
                        <MatchCard
                          match={m}
                          teamA={m.teamA}
                          teamB={m.teamB}
                          isAdmin={isAdmin}
                          onUpdate={updateMatch}
                        />
                        {isAdmin && (
                          <button onClick={() => handleDeleteMatch(m.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors p-2 glass rounded-full shadow-lg opacity-0 group-hover:opacity-100">
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <div className="py-40 text-center glass rounded-[3.5rem] border-2 border-dashed border-slate-800 uppercase text-[10px] font-black text-slate-700 tracking-widest">No matches scheduled</div>}
              </div>
            </div>
          )}

          {viewState === 'LIVE_STREAM' && (
            <div className="max-w-6xl mx-auto space-y-12 animate-in zoom-in-95">
              <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase italic tracking-tighter text-center pr-4 sm:pr-8 lg:pr-12">GLORY <span className="glory-gradient">STREAM</span></h2>
              <div className="relative pt-[56.25%] rounded-[4rem] overflow-hidden shadow-[0_0_120px_rgba(225,29,72,0.2)] ring-1 ring-white/10">
                <iframe className="absolute top-0 left-0 w-full h-full" src={liveStreamUrl} frameBorder="0" allowFullScreen title="Live Stream"></iframe>
              </div>
            </div>
          )}

          {viewState === 'MATCHES' && (
            <div className="space-y-12 animate-in fade-in">
              <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase italic tracking-tighter text-center pr-4 sm:pr-8 lg:pr-12">BATTLE <span className="glory-gradient">ARENA</span></h2>

              {/* Filter Controls */}
              <div className="mb-8">
                <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Filter Matches</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Sport Filter */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Sport</label>
                      <select
                        value={matchFilters.sport}
                        onChange={(e) => setMatchFilters(prev => ({ ...prev, sport: e.target.value }))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">All Sports</option>
                        <option value="Cricket">Cricket</option>
                        <option value="Football">Football</option>
                        <option value="Volleyball">Volleyball</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Kabaddi">Kabaddi</option>
                        <option value="Musical Chair">Musical Chair</option>
                        <option value="Kho-Kho">Kho-Kho</option>
                        <option value="LUDO">LUDO</option>
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

                    {/* Gender Filter */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Gender</label>
                      <select
                        value={matchFilters.gender}
                        onChange={(e) => setMatchFilters(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">All Genders</option>
                        <option value="Boys">Boys</option>
                        <option value="Girls">Girls</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>

                    {/* Venue Filter */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Venue</label>
                      <select
                        value={matchFilters.venue}
                        onChange={(e) => setMatchFilters(prev => ({ ...prev, venue: e.target.value }))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">All Venues</option>
                        <option value="Playground-1">Playground-1</option>
                        <option value="Playground-2">Playground-2</option>
                        <option value="Playground-3">Playground-3</option>
                        <option value="Playground-4">Playground-4</option>
                        <option value="Seminar-Hall">Seminar-Hall</option>
                      </select>
                    </div>

                    {/* Batch Filter */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Batch</label>
                      <select
                        value={matchFilters.batch}
                        onChange={(e) => setMatchFilters(prev => ({ ...prev, batch: e.target.value }))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">All Batches</option>
                        <option value="A">Batch A</option>
                        <option value="B">Batch B</option>
                        <option value="C">Batch C</option>
                        <option value="D">Batch D</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setMatchFilters({ sport: '', gender: '', venue: '', batch: '' })}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-xs font-medium uppercase tracking-wider text-white transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Matches */}
              <div className="space-y-6">
                <h3 className="font-oswald text-3xl font-bold uppercase flex items-center gap-3 tracking-widest text-rose-500">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                  Live Battles
                </h3>
                {filteredMatches.filter(m => m.status === 'LIVE').length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMatches.filter(m => m.status === 'LIVE').map(m => (
                      <div key={m.id} className="relative group">
                        <MatchCard
                          match={m}
                          teamA={m.teamA}
                          teamB={m.teamB}
                          isAdmin={isAdmin}
                          onUpdate={updateMatch}
                        />
                        {isAdmin && (
                          <button onClick={() => handleDeleteMatch(m.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors p-2 glass rounded-full shadow-lg opacity-0 group-hover:opacity-100">
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center glass rounded-[3rem] border-2 border-dashed border-slate-800 uppercase text-[10px] font-black text-slate-700 tracking-widest">
                    No Live Matches Currently
                  </div>
                )}
              </div>

              {/* Upcoming Matches */}
              <div className="space-y-6">
                <h3 className="font-oswald text-3xl font-bold uppercase flex items-center gap-3 tracking-widest text-indigo-400">
                  <i className="fa-solid fa-clock"></i>
                  Upcoming Battles
                </h3>
                {filteredMatches.filter(m => m.status === 'UPCOMING').length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMatches.filter(m => m.status === 'UPCOMING').map(m => (
                      <div key={m.id} className="relative group">
                        <MatchCard
                          match={m}
                          teamA={m.teamA}
                          teamB={m.teamB}
                          isAdmin={isAdmin}
                          onUpdate={updateMatch}
                        />
                        {isAdmin && (
                          <button onClick={() => handleDeleteMatch(m.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors p-2 glass rounded-full shadow-lg opacity-0 group-hover:opacity-100">
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center glass rounded-[3rem] border-2 border-dashed border-slate-800 uppercase text-[10px] font-black text-slate-700 tracking-widest">
                    No Upcoming Matches Scheduled
                  </div>
                )}
              </div>

              {/* Completed Matches */}
              <div className="space-y-6">
                <h3 className="font-oswald text-3xl font-bold uppercase flex items-center gap-3 tracking-widest text-slate-500">
                  <i className="fa-solid fa-trophy"></i>
                  Completed Battles
                </h3>
                {filteredMatches.filter(m => m.status === 'COMPLETED').length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMatches.filter(m => m.status === 'COMPLETED').map(m => (
                      <div key={m.id} className="relative group">
                        <MatchCard
                          match={m}
                          teamA={m.teamA}
                          teamB={m.teamB}
                          isAdmin={isAdmin}
                          onUpdate={updateMatch}
                        />
                        {isAdmin && (
                          <button onClick={() => handleDeleteMatch(m.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors p-2 glass rounded-full shadow-lg opacity-0 group-hover:opacity-100">
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center glass rounded-[3rem] border-2 border-dashed border-slate-800 uppercase text-[10px] font-black text-slate-700 tracking-widest">
                    No Completed Matches Yet
                  </div>
                )}
              </div>
            </div>
          )}

          {viewState === 'LEADERBOARD' && (
            <div className="space-y-12 animate-in fade-in">
              <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase italic tracking-tighter text-center pr-4 sm:pr-8 lg:pr-12">SUPREME <span className="glory-gradient">RANKINGS</span></h2>
              
              {/* Under Construction Notice */}
              <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <i className="fa-solid fa-hammer text-amber-400 text-2xl animate-pulse"></i>
                  <h3 className="font-oswald text-xl font-bold uppercase tracking-wider text-amber-400">Under Construction</h3>
                </div>
                <p className="text-amber-200 text-sm font-medium">Leaderboard is currently disabled. Rankings will be available soon.</p>
              </div>
              
              {/* <div className="glass rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl opacity-50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900/50">
                      <tr className="border-b border-white/5">
                        <th className="p-6 sm:p-10 text-[10px] sm:text-[11px] font-black uppercase text-slate-500 tracking-widest">Rank</th>
                        <th className="p-6 sm:p-10 text-[10px] sm:text-[11px] font-black uppercase text-slate-500 tracking-widest">Contender</th>
                        <th className="p-6 sm:p-10 text-center text-[10px] sm:text-[11px] font-black uppercase text-slate-500 tracking-widest">Trophies</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {participants.sort((a, b) => b.wins - a.wins).map((p, i) => (
                        <tr key={`${p.sport}-${p.name}`} className="hover:bg-white/5 transition-colors group">
                          <td className="p-6 sm:p-10 font-black text-slate-700 text-xl sm:text-2xl">#{i + 1}</td>
                          <td className="p-6 sm:p-10">
                            <div className="font-black text-slate-100 text-xl sm:text-2xl font-oswald uppercase tracking-tight">{p.name}</div>
                          </td>
                          <td className="p-6 sm:p-10 text-center font-oswald text-4xl sm:text-6xl font-black text-rose-500 group-hover:scale-110 transition-transform">{p.wins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div> */}
            </div>
          )}
        </main>

        <AdminPanel
          isAdmin={isAdmin || showAdminPanel}
          isLoggedIn={isAdmin}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onToggle={() => setShowAdminPanel(!showAdminPanel)}
          announcement={announcement}
          onUpdateAnnouncement={(val) => setAnnouncement(val)}
        />
      </div>
      <Footer
        onViewChange={(view) => {
          setViewState(view as ViewState);
          setActiveCategory(null);
          setActiveSport(null);
        }}
        onCategoryChange={(category) => {
          setActiveCategory(category as Category);
          setViewState('CATEGORY');
        }}
      />
      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default App;
