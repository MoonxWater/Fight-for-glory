import React, { useState, useEffect, useMemo } from 'react';
import { Match, Participant, Category, ViewState, SportType } from './types';
import { BOYS_SPORTS, GIRLS_SPORTS, SPORT_ICONS, SPORT_CONFIG } from './constants';
import { MatchCard } from './components/MatchCard';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './supabaseClient';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [announcement, setAnnouncement] = useState('Welcome to Fight for Glory 2025 at MACET!');
  const [liveStreamUrl, setLiveStreamUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<ViewState>('LANDING');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSport, setActiveSport] = useState<SportType | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const fetchData = async () => {
    try {
      const [pts, mts, sets] = await Promise.all([
        dbService.getParticipants(),
        dbService.getMatches(),
        dbService.getSettings()
      ]);
      
      setParticipants(pts);
      setMatches(mts);
      if (sets) {
        setAnnouncement(sets.announcement || 'Welcome to MACET Fight for Glory 2025!');
        setLiveStreamUrl(sets.liveStreamUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ');
      }
    } catch (err) {
      console.error("Critical Data Fetch Error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        await fetchData();
      } finally {
        setTimeout(() => setLoading(false), 1200);
      }
    };
    init();

    const unsub = dbService.subscribeToChanges(() => {
      fetchData();
    });

    return unsub;
  }, []);

  const isAdmin = useMemo(() => !!user, [user]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateMatch = async (id: string, updates: Partial<Match>) => {
    if (!isAdmin) return;
    try {
      await dbService.updateMatch(id, updates);
      
      if (updates.status === 'FINISHED') {
        const match = matches.find(m => m.id === id);
        if (match) {
          const finalScoreA = updates.scoreA ?? match.scoreA;
          const finalScoreB = updates.scoreB ?? match.scoreB;
          const winnerId = finalScoreA > finalScoreB ? match.teamAId : (finalScoreB > finalScoreA ? match.teamBId : null);
          const loserId = finalScoreA > finalScoreB ? match.teamBId : (finalScoreB > finalScoreA ? match.teamAId : null);
          
          if (winnerId) {
            const winner = participants.find(p => p.id === winnerId);
            if (winner) await dbService.updateParticipantPoints(winnerId, (winner.points || 0) + 3, (winner.wins || 0) + 1, (winner.losses || 0));
          }
          if (loserId) {
            const loser = participants.find(p => p.id === loserId);
            if (loser) await dbService.updateParticipantPoints(loserId, (loser.points || 0), (loser.wins || 0), (loser.losses || 0) + 1);
          }
        }
      }
      await fetchData(); 
    } catch (err: any) {
      alert("Operation failed: " + err.message);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!isAdmin || !confirm("Are you sure you want to delete this match?")) return;
    try {
      await dbService.deleteMatch(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    if (!isAdmin || !confirm("Are you sure you want to delete this participant?")) return;
    try {
      await dbService.deleteParticipant(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addParticipant = async (name: string) => {
    if (!isAdmin || !activeCategory || !activeSport) return;
    try {
      const newParticipant: Participant = {
        id: crypto.randomUUID(),
        name: name.trim(),
        type: SPORT_CONFIG[activeSport]?.type || 'SOLO',
        wins: 0, losses: 0, points: 0,
        category: activeCategory,
        sport: activeSport
      };
      await dbService.addParticipant(newParticipant);
      await fetchData();
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    }
  };

  const addMatch = async (pAId: string, pBId: string) => {
    if (!isAdmin || !activeCategory || !activeSport) return;
    try {
      const newMatch: Match = {
        id: crypto.randomUUID(),
        sport: activeSport,
        category: activeCategory,
        teamAId: pAId,
        teamBId: pBId,
        scoreA: 0, scoreB: 0,
        startTime: new Date().toISOString(),
        status: 'UPCOMING'
      };
      await dbService.addMatch(newMatch);
      await fetchData();
    } catch (err: any) {
      alert("Match scheduling failed: " + err.message);
    }
  };

  const currentParticipants = useMemo(() => 
    participants.filter(p => p.category === activeCategory && p.sport === activeSport),
    [participants, activeCategory, activeSport]
  );

  const currentMatches = useMemo(() => 
    matches.filter(m => m.category === activeCategory && m.sport === activeSport),
    [matches, activeCategory, activeSport]
  );

  const getParticipant = (id: string) => participants.find(p => p.id === id) || { name: '...', id: '0' } as Participant;

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
            {/* Added pr-8 to avoid italic clipping */}
            <h1 className="font-orbitron text-2xl font-bold tracking-tighter uppercase italic leading-none pr-8">
              FIGHT FOR <span className="glory-gradient">GLORY</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-10">
            {['LANDING', 'LEADERBOARD', 'LIVE_STREAM'].map((v) => (
              <button 
                key={v}
                onClick={() => setViewState(v as ViewState)}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${viewState === v ? 'text-rose-500' : 'text-slate-500 hover:text-white'}`}
              >
                {v.replace('_', ' ')}
                {viewState === v && <span className="absolute bottom-0 left-0 w-full h-0.5 glory-bg rounded-full"></span>}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-black uppercase tracking-widest text-rose-500">Official Access</div>
                  <div className="text-[11px] font-bold text-slate-300">{user.user_metadata?.full_name || 'Admin'}</div>
                </div>
                <img src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=Admin'} className="w-10 h-10 rounded-xl border border-white/10" alt="Profile" />
              </div>
            ) : (
              <button onClick={handleLogin} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border border-white/5">Admin Portal</button>
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
                FIGHT FOR <br /><span className="glory-gradient inline-block mr-6">GLORY 2025</span>
              </h2>
              <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                The premier athletic showcase of MACET. Join us as we crown the champions of 2025 in the ultimate battle for supreme glory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { cat: 'Boys' as Category, img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200', title: 'BOYS DIVISION' },
                { cat: 'Girls' as Category, img: 'https://images.unsplash.com/photo-1551952237-954a0e68786c?auto=format&fit=crop&q=80&w=1200', title: 'GIRLS DIVISION' }
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
                    <p className="text-rose-500 font-black uppercase text-xs tracking-[0.4em] mt-3">Enter the Arena</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewState === 'CATEGORY' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between">
              <button onClick={() => setViewState('LANDING')} className="flex items-center gap-4 text-slate-400 hover:text-white transition-all group px-5 py-3 bg-white/5 rounded-2xl border border-white/5">
                <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                <span className="text-[11px] font-black uppercase tracking-widest">Return Home</span>
              </button>
              <h2 className="font-orbitron text-4xl font-black uppercase italic tracking-tighter pr-12">
                {activeCategory}'S <span className="text-rose-500">SPORTS</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              {(activeCategory === 'Boys' ? BOYS_SPORTS : GIRLS_SPORTS).map((sport) => (
                <div 
                  key={sport}
                  onClick={() => { setActiveSport(sport); setViewState('SPORT_DETAIL'); }}
                  className="glass p-10 rounded-[3rem] cursor-pointer hover:bg-white/10 transition-all group border border-white/5 hover:border-rose-500/50 shadow-2xl"
                >
                  <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-8 group-hover:glory-bg transition-all shadow-xl group-hover:scale-110">
                    <i className={`fa-solid ${SPORT_ICONS[sport] || 'fa-medal'} text-4xl text-slate-500 group-hover:text-white`}></i>
                  </div>
                  <h3 className="font-oswald text-3xl font-black uppercase tracking-tight mb-2 text-white">{sport}</h3>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{SPORT_CONFIG[sport]?.type} FORMAT</p>
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
                    <i className={`fa-solid ${SPORT_ICONS[activeSport] || 'fa-medal'} text-5xl text-white`}></i>
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
                    onClick={() => { const n = prompt(`Contender/Team Name:`); if (n) addParticipant(n); }}
                    className="px-8 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all hover:-translate-y-1"
                  >
                    Register Entry
                  </button>
                  {currentParticipants.length >= 2 && (
                    <button 
                      onClick={() => {
                        const list = currentParticipants.map((p, i) => `[${i}] ${p.name}`).join('\n');
                        const aIdx = prompt(`Select P1/Team 1 (Index):\n${list}`);
                        const bIdx = prompt(`Select P2/Team 2 (Index):\n${list}`);
                        if (aIdx !== null && bIdx !== null) addMatch(currentParticipants[parseInt(aIdx)].id, currentParticipants[parseInt(bIdx)].id);
                      }}
                      className="px-8 py-5 bg-rose-600 hover:bg-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all hover:-translate-y-1"
                    >
                      Schedule Clash
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 space-y-6">
                <h4 className="font-oswald text-2xl font-bold uppercase tracking-widest text-slate-500">Roster</h4>
                <div className="glass rounded-[3rem] p-8 space-y-5 max-h-[600px] overflow-y-auto border border-white/5">
                  {currentParticipants.length > 0 ? [...currentParticipants].sort((a,b)=>b.points-a.points).map(p => (
                    <div key={p.id} className="group flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                      <div>
                        <div className="font-black text-slate-100 text-lg uppercase font-oswald">{p.name}</div>
                        <div className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Score: {p.points} Pts</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[9px] text-slate-700 font-black uppercase">W/L</div>
                          <div className="font-oswald font-black text-rose-500 text-2xl">{p.wins}/{p.losses}</div>
                        </div>
                        {isAdmin && (
                          <button onClick={() => handleDeleteParticipant(p.id)} className="opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all">
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  )) : <div className="text-center py-20 opacity-20 uppercase text-[10px] font-black tracking-widest">No entries found</div>}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <h4 className="font-oswald text-2xl font-bold uppercase flex items-center gap-3 tracking-widest text-rose-500">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                  The Arena
                </h4>
                {currentMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {currentMatches.map(m => (
                      <div key={m.id} className="relative group">
                        <MatchCard 
                          match={m}
                          teamA={getParticipant(m.teamAId)}
                          teamB={getParticipant(m.teamBId)}
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
                ) : <div className="py-40 text-center glass rounded-[3.5rem] border-2 border-dashed border-slate-800 uppercase text-[10px] font-black text-slate-700 tracking-widest">Awaiting scheduled encounters...</div>}
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
                        <th className="p-10 text-[11px] font-black uppercase text-slate-500 tracking-widest">Category</th>
                        <th className="p-10 text-center text-[11px] font-black uppercase text-slate-500 tracking-widest">Total Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[...participants].sort((a, b) => b.points - a.points).map((p, i) => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-10 font-black text-slate-700 text-2xl">#{i + 1}</td>
                          <td className="p-10">
                            <div className="font-black text-slate-100 text-2xl font-oswald uppercase tracking-tight">{p.name}</div>
                            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{p.sport}</div>
                          </td>
                          <td className="p-10 text-slate-500 uppercase text-[11px] font-black">{p.category} Section</td>
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
        onUpdateAnnouncement={(val) => { 
          setAnnouncement(val); 
          dbService.updateSettings({ announcement: val }).catch(e => console.error(e)); 
        }}
      />
      
      <footer className="mt-24 border-t border-white/5 py-16 opacity-30 text-center uppercase text-[10px] font-black tracking-[0.5em]">
        Maulana Azad College of Engineering and Technology • Fight for Glory 2025 • Powered by Webpotli
      </footer>
    </div>
  );
};

export default App;