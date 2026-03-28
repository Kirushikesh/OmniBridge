import React from 'react';

export function Footer() {
  return (
    <footer className="w-full max-w-4xl mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
      <div className="flex gap-6">
        <span>Privacy Encrypted</span>
        <span>GDPR Compliant</span>
        <span>AI Ethics Verified</span>
      </div>
      <div>© 2026 OmniBridge Intelligence Systems</div>
    </footer>
  );
}
