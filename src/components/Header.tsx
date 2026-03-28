import React from 'react';
import { ChevronRight } from 'lucide-react';

export function Header() {
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
      <div className="hidden md:flex items-center gap-6 text-[10px] font-mono text-white/40 uppercase tracking-widest">
        <span>v1.0.4-alpha</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          System Active
        </span>
      </div>
    </header>
  );
}
