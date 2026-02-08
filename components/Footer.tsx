import React from 'react';

interface FooterProps {
  onViewChange?: (view: string) => void;
  onCategoryChange?: (category: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onViewChange, onCategoryChange }) => {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (view: string) => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const handleCategoryNavigation = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <footer className="bg-[#0a0f1f] border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-trophy text-white text-lg"></i>
              </div>
              <h3 className="font-orbitron text-xl font-bold tracking-tighter uppercase italic">
                FIGHT FOR <span className="text-rose-500">GLORY</span>
              </h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The premier athletic showcase of MACET. Where champions are forged and legends are born.
            </p>
            {/* <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">MACET</span>
              <span className="text-slate-700">•</span>
              <span className="text-rose-500 text-[10px] font-black uppercase tracking-widest">2026</span>
            </div> */}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-oswald text-lg font-bold uppercase tracking-widest text-white">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: 'Home', view: 'LANDING', icon: 'fa-home' },
                { name: 'Leaderboard', view: 'LEADERBOARD', icon: 'fa-ranking-star' },
                { name: 'Live Stream', view: 'LIVE_STREAM', icon: 'fa-play-circle' },
                { name: 'Battle Arena', view: 'MATCHES', icon: 'fa-shield' }
              ].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavigation(link.view)}
                    className="flex items-center gap-3 text-slate-400 hover:text-rose-500 transition-colors text-sm group w-full text-left"
                  >
                    <i className={`fa-solid ${link.icon} w-4 text-center group-hover:scale-110 transition-transform`}></i>
                    <span className="font-medium">{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports Categories */}
          <div className="space-y-4">
            <h4 className="font-oswald text-lg font-bold uppercase tracking-widest text-white">Categories</h4>
            <ul className="space-y-2">
              {[
                { name: 'Boys Division', category: 'Boys', color: 'text-blue-400' },
                { name: 'Girls Division', category: 'Girls', color: 'text-pink-400' }
              ].map((category) => (
                <li key={category.name}>
                  <button
                    onClick={() => handleCategoryNavigation(category.category)}
                    className={`flex items-center gap-3 text-slate-400 hover:${category.color} transition-colors text-sm group w-full text-left`}
                  >
                    <i className="fa-solid fa-medal w-4 text-center group-hover:rotate-12 transition-transform"></i>
                    <span className="font-medium">{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="font-oswald text-lg font-bold uppercase tracking-widest text-white">Connect</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <i className="fa-solid fa-location-dot w-4 text-rose-500"></i>
                <span>MACET - Patna </span>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-black uppercase tracking-widest text-slate-600">Developed By</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between group">
                    <a
                      href="https://github.com/Koyu2391"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm"
                      aria-label="Md Al Fahad Ahmad GitHub"
                    >
                      <i className="fa-brands fa-github w-4 text-rose-500"></i>
                      <span>Md Al Fahad Ahmad</span>
                    </a>
                  </div>
                  <div className="flex items-center justify-between group">
                    <a
                      href="https://github.com/MoonxWater"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm"
                      aria-label="Seraj Muneer Faridy GitHub"
                    >
                      <i className="fa-brands fa-github w-4 text-rose-500"></i>
                      <span>Seraj Muneer Faridy</span>
                    </a>
                  </div>
                  <div className="flex items-center justify-between group">
                    <a
                      href="https://github.com/ShariqueRaza1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm"
                      aria-label="Sharique Raza GitHub"
                    >
                      <i className="fa-brands fa-github w-4 text-rose-500"></i>
                      <span>Sharique Raza</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="flex items-center gap-3 pt-2">
              {[
                { icon: 'fa-globe', label: 'Website' },
                { icon: 'fa-envelope', label: 'Email' },
                { icon: 'fa-phone', label: 'Contact' }
              ].map((social) => (
                <button
                  key={social.label}
                  className="w-10 h-10 bg-slate-800 hover:bg-rose-600 rounded-lg flex items-center justify-center transition-all hover:scale-110 border border-white/5 hover:border-rose-500/50"
                  aria-label={social.label}
                >
                  <i className={`fa-solid ${social.icon} text-white text-sm`}></i>
                </button>
              ))}
            </div> */}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-slate-500 text-xs font-medium text-center">
              © {currentYear} Fight for Glory. All rights reserved.
            </div>
            {/* <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
              <a href="#privacy" className="text-slate-500 hover:text-rose-500 transition-colors font-medium">
                Privacy Policy
              </a>
              <a href="#terms" className="text-slate-500 hover:text-rose-500 transition-colors font-medium">
                Terms of Service
              </a>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-slate-500 font-medium">System Online</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
