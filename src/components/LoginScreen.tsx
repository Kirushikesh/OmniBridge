import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ShieldCheck, Globe, Zap } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: <Zap className="w-4 h-4" />, label: 'Real-Time Triage', sub: 'Emergency-grade intent analysis' },
  { icon: <Globe className="w-4 h-4" />, label: 'Multilingual', sub: 'Zero-shot language detection' },
  { icon: <ShieldCheck className="w-4 h-4" />, label: 'Encrypted & Secure', sub: 'GDPR-compliant data pipeline' },
];

export function LoginScreen() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen data-grid flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glow blob */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,102,0.07) 0%, transparent 70%)',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-4"
            style={{ boxShadow: '0 0 40px rgba(0,255,102,0.4)' }}
          >
            <ChevronRight className="text-black w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">OmniBridge</h1>
          <p className="text-[11px] font-mono text-white/40 uppercase tracking-[0.25em] mt-1">
            Universal Intent Engine
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-panel p-8 relative overflow-hidden">
          <div className="scan-line" aria-hidden="true" />

          <h2 className="text-lg font-bold mb-1">Welcome back</h2>
          <p className="text-sm text-white/50 mb-8">
            Sign in to access the intelligence platform and start bridging intent to action.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3 mb-8">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{f.label}</p>
                  <p className="text-[11px] text-white/40 font-mono">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Google OAuth Sign In — official Google button */}
          <div className="flex justify-center" id="google-sign-in-container">
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) {
                  login(response.credential);
                }
              }}
              onError={() => {
                setError('Sign-in failed. Please try again.');
              }}
              theme="filled_black"
              shape="pill"
              size="large"
              width="360"
              text="continue_with"
              logo_alignment="center"
            />
          </div>

          {error && (
            <p role="alert" className="mt-4 text-center text-xs text-danger font-mono">
              {error}
            </p>
          )}

          <p className="mt-6 text-center text-[10px] font-mono text-white/25 uppercase tracking-wider">
            Powered by Google OAuth 2.0
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] font-mono text-white/20 uppercase tracking-widest">
          © 2026 OmniBridge Intelligence Systems
        </p>
      </motion.div>
    </div>
  );
}
