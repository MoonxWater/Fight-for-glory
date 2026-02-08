import React, { useState, useEffect, useMemo } from 'react';
import { Match, MatchUpdates, ViewState, SportType } from './types';
import { SPORT_ICONS, SPORT_CONFIG, BOYS_SPORTS, GIRLS_SPORTS } from './constants';
import { MatchCard } from './components/MatchCard';
import { AdminPanel } from './components/AdminPanel';
import { api, setAdminKey } from './services/api';

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
  const [announcement, setAnnouncement] = useState('Welcome to Fight for Glory 2026 at MACET!');
  const [liveStreamUrl, setLiveStreamUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<ViewState>('LANDING');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSport, setActiveSport] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Poll for data
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const allMatches = await api.getMatches();
      setMatches(allMatches);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  const handleLogin = (key: string) => {
    setAdminKey(key);
    // Optimistically assume success, or we could add a verify endpoint
    setIsAdmin(true);
    setShowAdminPanel(false);
  };

  const handleLogout = () => {
    setAdminKey('');
    setIsAdmin(false);
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
  }, [matches]);

  const updateMatch = async (id: string, updates: Partial<Match>) => {
    if (!isAdmin) return;
    try {
      // Optimistic update
      setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      await api.updateMatch(id, updates);
      fetchData(); // Sync exact state
    } catch (err: any) {
      alert("Update failed: " + err.message);
      fetchData(); // Revert
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!isAdmin || !confirm("Are you sure you want to delete this match?")) return;
    try {
      await api.deleteMatch(id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const scheduleMatch = async () => {
    if (!isAdmin || !activeSport) return;
    const teamA = prompt("Enter Team A Name:");
    if (!teamA) return;
    const teamB = prompt("Enter Team B Name:");
    if (!teamB) return;

    try {
      await api.createMatch({
        sport: activeSport,
        teamA,
        teamB,
        scoreA: 0,
        scoreB: 0,
        status: 'UPCOMING'
      });
      fetchData();
    } catch (err: any) {
      alert("Scheduling failed: " + err.message);
    }
  };

  const currentMatches = useMemo(() =>
    matches.filter(m => m.sport === activeSport),
    [matches, activeSport]
  );

  const currentParticipants = useMemo(() =>
    participants.filter(p => p.sport === activeSport),
    [participants, activeSport]
  );

  // Identify sports that have matches or are in our default list
  const availableSports = useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory === 'Boys' ? BOYS_SPORTS : GIRLS_SPORTS;
  }, [activeCategory]);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-orbitron font-bold text-xl uppercase tracking-[0.3em] glory-gradient animate-pulse">Syncing Glory Arena...</p>
      </div>
    </div>
  );

  return (
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
            {['LANDING', 'LEADERBOARD', 'LIVE_STREAM'].map((v) => (
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
              </div>
            ) : (
              <button onClick={() => setShowAdminPanel(true)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border border-white/5">Admin Portal</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {viewState === 'LANDING' && (
          <div className="space-y-20 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center max-w-5xl mx-auto space-y-8">
              <h2 className="text-rose-500 font-orbitron font-bold tracking-[0.4em] uppercase">Maulana Azad College of Engineering and Technology</h2>
              <h2 className="font-orbitron text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.85] pr-12">
                FIGHT FOR <br /><span className="glory-gradient inline-block mr-6">GLORY 2026</span>
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
                    <h3 className="font-orbitron text-6xl font-black uppercase italic text-white tracking-tighter pr-12">{x.title}</h3>
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
              <h2 className="font-orbitron text-4xl font-black uppercase italic tracking-tighter pr-12">
                {activeCategory}'S <span className="text-rose-500">SPORTS</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              {availableSports.map((sport) => (
                <div
                  key={sport}
                  onClick={() => { setActiveSport(sport); setViewState('SPORT_DETAIL'); }}
                  className="glass p-10 rounded-[3rem] cursor-pointer hover:bg-white/10 transition-all group border border-white/5 hover:border-rose-500/50 shadow-2xl"
                >
                  <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-8 group-hover:glory-bg transition-all shadow-xl group-hover:scale-110">
                    <i className={`fa-solid ${SPORT_ICONS[sport as SportType] || 'fa-medal'} text-4xl text-slate-500 group-hover:text-white`}></i>
                  </div>
                  <h3 className="font-oswald text-3xl font-black uppercase tracking-tight mb-2 text-white">{sport}</h3>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{SPORT_CONFIG[sport as SportType]?.type || 'SOLO'} FORMAT</p>
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
                  <div className="w-24 h-24 glory-bg rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                    <i className={`fa-solid ${SPORT_ICONS[activeSport as SportType] || 'fa-medal'} text-5xl text-white`}></i>
                  </div>
                  <div>
                    <h2 className="font-orbitron text-6xl font-black uppercase italic tracking-tighter leading-none pr-12">{activeSport}</h2>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 space-y-6">
                <h4 className="font-oswald text-2xl font-bold uppercase tracking-widest text-slate-500">Standings</h4>
                <div className="glass rounded-[3rem] p-8 space-y-5 max-h-[600px] overflow-y-auto border border-white/5">
                  {currentParticipants.length > 0 ? [...currentParticipants].sort((a, b) => b.points - a.points).map((p, i) => (
                    <div key={p.name} className="group flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="font-black text-rose-500 text-xl font-oswald">#{i + 1}</span>
                        <div>
                          <div className="font-black text-slate-100 text-lg uppercase font-oswald">{p.name}</div>
                          <div className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Score: {p.points} Pts</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[9px] text-slate-700 font-black uppercase">W/L</div>
                          <div className="font-oswald font-black text-rose-500 text-2xl">{p.wins}/{p.losses}</div>
                        </div>
                      </div>
                    </div>
                  )) : <div className="text-center py-20 opacity-20 uppercase text-[10px] font-black tracking-widest">No matches played yet</div>}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
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
          </div>
        )}

        {viewState === 'LIVE_STREAM' && (
          <div className="max-w-6xl mx-auto space-y-12 animate-in zoom-in-95">
            <h2 className="font-orbitron text-7xl font-black uppercase italic tracking-tighter text-center pr-12">GLORY <span className="glory-gradient">STREAM</span></h2>
            <div className="relative pt-[56.25%] rounded-[4rem] overflow-hidden shadow-[0_0_120px_rgba(225,29,72,0.2)] ring-1 ring-white/10">
              <iframe className="absolute top-0 left-0 w-full h-full" src={liveStreamUrl} frameBorder="0" allowFullScreen title="Live Stream"></iframe>
            </div>
          </div>
        )}

        {viewState === 'LEADERBOARD' && (
          <div className="space-y-12 animate-in fade-in">
            <h2 className="font-orbitron text-7xl font-black uppercase italic tracking-tighter text-center pr-12">SUPREME <span className="glory-gradient">RANKINGS</span></h2>
            <div className="glass rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50">
                    <tr className="border-b border-white/5">
                      <th className="p-10 text-[11px] font-black uppercase text-slate-500 tracking-widest">Rank</th>
                      <th className="p-10 text-[11px] font-black uppercase text-slate-500 tracking-widest">Contender</th>
                      <th className="p-10 text-[11px] font-black uppercase text-slate-500 tracking-widest">Sport</th>
                      <th className="p-10 text-center text-[11px] font-black uppercase text-slate-500 tracking-widest">Total Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {participants.sort((a, b) => b.points - a.points).map((p, i) => (
                      <tr key={`${p.sport}-${p.name}`} className="hover:bg-white/5 transition-colors group">
                        <td className="p-10 font-black text-slate-700 text-2xl">#{i + 1}</td>
                        <td className="p-10">
                          <div className="font-black text-slate-100 text-2xl font-oswald uppercase tracking-tight">{p.name}</div>
                        </td>
                        <td className="p-10 text-slate-500 uppercase text-[11px] font-black">{p.sport}</td>
                        <td className="p-10 text-center font-oswald text-6xl font-black text-rose-500 group-hover:scale-110 transition-transform">{p.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

      <footer className="mt-24 border-t border-white/5 py-16 opacity-30 text-center uppercase text-[10px] font-black tracking-[0.5em]">
        Maulana Azad College of Engineering and Technology • Fight for Glory 2026 • Powered by Webpotli
      </footer>
    </div>
  );
};

export default App;