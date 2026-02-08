import React, { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';

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
  const [showDashboard, setShowDashboard] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(adminKey);
  };

  const handleOpenDashboard = () => {
    setShowDashboard(true);
  };

  const handleCloseDashboard = () => {
    setShowDashboard(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={isLoggedIn ? handleOpenDashboard : onToggle}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isLoggedIn ? 'bg-rose-600 hover:bg-rose-500' : 'bg-slate-800 hover:bg-slate-700'}`}
        >
          <i className={`fa-solid ${isLoggedIn ? 'fa-user-shield' : 'fa-lock'} text-xl text-white`}></i>
        </button>

        {isAdmin && !isLoggedIn && (
          <div className="absolute bottom-16 right-0 w-80 glass rounded-[2rem] p-6 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-5">
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
          </div>
        )}
      </div>

      {showDashboard && isLoggedIn && (
        <AdminDashboard onClose={handleCloseDashboard} />
      )}
    </>
  );
};