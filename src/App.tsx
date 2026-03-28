import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { processIntent } from './services/gemini';
import { BridgeResult } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InputPanel } from './components/InputPanel';
import { ResultView } from './components/ResultView';

export default function App() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BridgeResult | null>(null);
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!input && !image) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const data = await processIntent(input, image || undefined);
      setResult(data);
    } catch (err: any) {
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
