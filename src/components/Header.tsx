import React, { useState } from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full max-w-4xl flex justify-between items-center mb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.3)]">
          <ChevronRight className="text-black w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase">OmniBridge</h1>
          <p className="text-[10px] text-white/50 font-mono uppercase tracking-[0.2em]">Universal Intent Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6 text-[10px] font-mono text-white/40 uppercase tracking-widest">
          <span>v1.0.4-alpha</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            System Active
          </span>
        </div>

        {user && (
          <div className="relative">
            <button
              id="user-menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-accent/40 transition-colors duration-200"
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 w-56 glass-panel p-3 shadow-2xl"
                >
                  <div className="px-2 py-1 mb-2 border-b border-white/10 pb-3">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-[11px] font-mono text-white/40 truncate">{user.email}</p>
                  </div>
                  <button
                    id="sign-out-btn"
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-white/70 hover:text-danger hover:bg-danger/10 transition-colors duration-200"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
