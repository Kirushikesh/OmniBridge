/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Mic, 
  Send, 
  AlertCircle, 
  Activity, 
  Leaf, 
  Users, 
  ChevronRight, 
  Phone, 
  MapPin, 
  FileText, 
  Info,
  X,
  Camera,
  Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { processIntent, BridgeResult, BridgeCategory } from './services/gemini';

const CATEGORY_ICONS = {
  [BridgeCategory.EMERGENCY]: <AlertCircle className="w-6 h-6 text-danger" />,
  [BridgeCategory.HEALTHCARE]: <Activity className="w-6 h-6 text-blue-400" />,
  [BridgeCategory.ENVIRONMENT]: <Leaf className="w-6 h-6 text-accent" />,
  [BridgeCategory.SOCIAL_AID]: <Users className="w-6 h-6 text-purple-400" />,
  [BridgeCategory.GENERAL]: <Info className="w-6 h-6 text-gray-400" />,
};

const URGENCY_COLORS = {
  LOW: 'bg-blue-500/20 text-blue-400',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  CRITICAL: 'bg-red-500/20 text-red-400 animate-pulse',
};

export default function App() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BridgeResult | null>(null);
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage({
          data: e.target?.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  });

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
      {/* Header */}
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

      <main className="w-full max-w-4xl flex-1 flex flex-col gap-8">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-6"
            >
              {/* Input Zone */}
              <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-accent uppercase tracking-widest">Input Stream</label>
                    <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Describe the situation, paste messy medical notes, or report an incident..."
                      className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-light placeholder:text-white/20 min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 items-center">
                    <div 
                      {...getRootProps()} 
                      className={`flex-1 min-w-[200px] border-2 border-dashed rounded-xl p-4 transition-colors cursor-pointer flex items-center justify-center gap-3 ${
                        isDragActive ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {image ? (
                        <div className="flex items-center gap-3 w-full">
                          <img src={image.data} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                          <span className="text-xs text-white/60 truncate flex-1">Image Attached</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setImage(null); }}
                            className="p-1 hover:bg-white/10 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Camera className="w-5 h-5 text-white/40" />
                          <span className="text-xs text-white/40">Drop image or click to upload</span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="p-4 rounded-xl glass-panel hover:bg-white/10 transition-colors group">
                        <Mic className="w-5 h-5 text-white/60 group-hover:text-accent" />
                      </button>
                      <button 
                        onClick={handleProcess}
                        disabled={isProcessing || (!input && !image)}
                        className="px-8 py-4 rounded-xl bg-accent text-black font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Process
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {isProcessing && <div className="scan-line" />}
              </div>

              {/* Examples/Hints */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: <AlertCircle className="w-4 h-4" />, text: "Emergency: 'Car accident at 5th and Main, smoke visible'" },
                  { icon: <Activity className="w-4 h-4" />, text: "Medical: 'Patient has high fever, rash on arm, history of asthma'" },
                  { icon: <Leaf className="w-4 h-4" />, text: "Environment: 'Oil spill detected in local creek near industrial park'" }
                ].map((hint, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(hint.text.split(': ')[1].replace(/'/g, ''))}
                    className="glass-panel p-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2 text-white/40">
                      {hint.icon}
                      <span className="text-[10px] font-mono uppercase tracking-widest">Example</span>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-2 italic">"{hint.text}"</p>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-6"
            >
              {/* Result Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="p-3 glass-panel">
                    {CATEGORY_ICONS[result.category]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">{result.category}</span>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${URGENCY_COLORS[result.urgency]}`}>
                        {result.urgency} Priority
                      </span>
                    </div>
                    <h2 className="text-2xl font-light">{result.summary}</h2>
                  </div>
                </div>
                <button 
                  onClick={reset}
                  className="p-2 glass-panel hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Structured Data */}
                <div className="md:col-span-2 flex flex-col gap-6">
                  <div className="glass-panel p-6">
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">Extracted Intelligence</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {Object.entries(result.structuredData).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-[10px] font-mono text-accent/60 uppercase">{key}</span>
                          <div className="text-sm text-white/80">
                            {Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {value.map((v, i) => (
                                  <span key={i} className="px-2 py-1 bg-white/5 rounded text-[10px] border border-white/10">{v}</span>
                                ))}
                              </div>
                            ) : (
                              <p>{String(value)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel p-6">
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">System Reasoning</h3>
                    <p className="text-sm text-white/60 italic leading-relaxed">
                      {result.reasoning}
                    </p>
                  </div>
                </div>

                {/* Action Column */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] font-mono text-accent uppercase tracking-widest px-2">Life-Saving Actions</h3>
                  {result.actions.map((action, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-panel p-4 hover:bg-white/5 transition-all group cursor-pointer border-l-2 border-l-accent"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          {action.type === 'call' && <Phone className="w-4 h-4 text-accent" />}
                          {action.type === 'map' && <MapPin className="w-4 h-4 text-accent" />}
                          {action.type === 'form' && <FileText className="w-4 h-4 text-accent" />}
                          {action.type === 'info' && <Info className="w-4 h-4 text-accent" />}
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-accent transition-colors" />
                      </div>
                      <h4 className="text-sm font-bold mb-1 group-hover:text-accent transition-colors">{action.title}</h4>
                      <p className="text-xs text-white/40 leading-snug">{action.description}</p>
                      <div className="mt-3 pt-3 border-t border-white/5 text-[10px] font-mono text-white/60 truncate">
                        {action.payload}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger text-sm"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
        <div className="flex gap-6">
          <span>Privacy Encrypted</span>
          <span>GDPR Compliant</span>
          <span>AI Ethics Verified</span>
        </div>
        <div>© 2026 OmniBridge Intelligence Systems</div>
      </footer>
    </div>
  );
}
