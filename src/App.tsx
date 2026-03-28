import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { processIntent } from './services/gemini';
import { saveIntent } from './services/firestoreService';
import { BridgeResult } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InputPanel } from './components/InputPanel';
import { ResultView } from './components/ResultView';
import { LoginScreen } from './components/LoginScreen';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, loading } = useAuth();

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BridgeResult | null>(null);
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // While OAuth resolves the persisted session, show a minimal loader
  if (loading) {
    return (
      <div className="min-h-screen data-grid flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Authenticating…</p>
        </div>
      </div>
    );
  }

  // Unauthenticated — show login gate
  if (!user) {
    return <LoginScreen />;
  }

  const handleProcess = async () => {
    if (!input && !image) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const data = await processIntent(input, image || undefined);
      setResult(data);
      // Save submission and result to Firebase Firestore
      await saveIntent(input, image, data);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setImage(null);
    setInput('');
    setError(null);
  };

  return (
    <div className="min-h-screen data-grid flex flex-col items-center p-4 md:p-8">
      <Header />

      <main className="w-full max-w-4xl flex-1 flex flex-col gap-8">
        <AnimatePresence mode="wait">
          {!result ? (
            <InputPanel 
              key="input"
              input={input}
              setInput={setInput}
              image={image}
              setImage={setImage}
              isProcessing={isProcessing}
              handleProcess={handleProcess}
            />
          ) : (
            <ResultView 
              key="result"
              result={result}
              reset={reset}
            />
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger text-sm"
            role="alert"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
