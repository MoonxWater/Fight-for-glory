import React, { useState } from 'react';

interface AdminPanelProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
  onLogin: (key: string) => void;
  onLogout: () => void;
  onToggle: () => void;
  announcement: string;
  onUpdateAnnouncement: (val: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isAdmin, isLoggedIn, onLogin, onLogout, onToggle, announcement, onUpdateAnnouncement
}) => {
  const [adminKey, setAdminKey] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(adminKey);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isLoggedIn ? 'bg-rose-600 hover:bg-rose-500' : 'bg-slate-800 hover:bg-slate-700'}`}
      >
        <i className={`fa-solid ${isLoggedIn ? 'fa-user-shield' : 'fa-lock'} text-xl text-white`}></i>
      </button>

      {isAdmin && (
        <div className="absolute bottom-16 right-0 w-80 glass rounded-[2rem] p-6 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-5">
          {!isLoggedIn ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <h3 className="font-orbitron text-lg font-bold mb-3 uppercase tracking-tighter glory-gradient">Admin Portal</h3>
              <div>
                <input
                  type="password"
                  placeholder="Enter Admin Access Key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <button type="submit" className="w-full py-4 glory-bg rounded-xl text-[10px] font-black uppercase tracking-widest text-white">
                Authorize Access
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-orbitron text-sm font-bold uppercase tracking-widest text-rose-500">GLORY CONSOLE</h3>
                <button onClick={onLogout} className="text-[9px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest">Sign Out</button>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Global Alert Message</label>
                <textarea
                  value={announcement}
                  onChange={(e) => onUpdateAnnouncement(e.target.value)}
                  placeholder="Ex: Cricket Finals starting now at Main Ground!"
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all h-28 text-white"
                />
              </div>

              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <p className="text-[10px] text-rose-300 leading-relaxed font-bold">
                  <i className="fa-solid fa-circle-check mr-1.5"></i>
                  Management Link Active. You can now modify match data.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};