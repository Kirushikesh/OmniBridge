import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Activity, Leaf, Users, Info, X, ChevronRight, Phone, MapPin, FileText } from 'lucide-react';
import { BridgeResult, BridgeCategory } from '../types';

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

interface ResultViewProps {
  result: BridgeResult;
  reset: () => void;
}

export function ResultView({ result, reset }: ResultViewProps) {
  return (
    <motion.div 
      key="result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-6"
      aria-live="assertive"
    >
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
          aria-label="Close result"
          role="button"
          className="p-2 glass-panel hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
  );
}
