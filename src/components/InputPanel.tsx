import React, { useCallback, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { Mic, Send, X, Camera, Loader2, AlertCircle, Activity, Leaf } from 'lucide-react';

interface InputPanelProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  image: { data: string; mimeType: string } | null;
  setImage: (image: { data: string; mimeType: string } | null) => void;
  isProcessing: boolean;
  handleProcess: () => void;
}

export function InputPanel({ input, setInput, image, setImage, isProcessing, handleProcess }: InputPanelProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListen = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice dictation is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        // Find if we already appended part of this, simple approach is just concatenate
        // since we only act on isFinal to avoid duplicating intermediate text.
        setInput(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
      }
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

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
  }, [setImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col gap-6"
    >
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
            {isListening && (
              <span aria-live="polite" className="text-xs text-danger animate-pulse">
                Listening for voice dictation...
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div 
              {...getRootProps()} 
              className={`flex-1 min-w-[200px] border-2 border-dashed rounded-xl p-4 transition-colors cursor-pointer flex items-center justify-center gap-3 ${
                isDragActive ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/30'
              }`}
              role="button"
              aria-label="Upload an image"
            >
              <input {...getInputProps()} />
              {image ? (
                <div className="flex items-center gap-3 w-full">
                  <img src={image.data} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                  <span className="text-xs text-white/60 truncate flex-1">Image Attached</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    className="p-1 hover:bg-white/10 rounded-full"
                    aria-label="Remove image"
                    role="button"
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
              <button 
                onClick={toggleListen}
                aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
                role="button"
                className={`p-4 rounded-xl glass-panel hover:bg-white/10 transition-colors group ${isListening ? 'bg-danger/20' : ''}`}
              >
                <Mic className={`w-5 h-5 ${isListening ? 'text-danger animate-pulse' : 'text-white/60 group-hover:text-accent'}`} />
              </button>
              <button 
                onClick={handleProcess}
                disabled={isProcessing || (!input && !image)}
                aria-label="Process intent"
                role="button"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <AlertCircle className="w-4 h-4" />, text: "Emergency: 'Car accident at 5th and Main, smoke visible'" },
          { icon: <Activity className="w-4 h-4" />, text: "Medical: 'Patient has high fever, rash on arm, history of asthma'" },
          { icon: <Leaf className="w-4 h-4" />, text: "Environment: 'Oil spill detected in local creek near industrial park'" }
        ].map((hint, i) => (
          <button 
            key={i}
            onClick={() => setInput(hint.text.split(': ')[1].replace(/'/g, ''))}
            aria-label={`Use example: ${hint.text}`}
            role="button"
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
  );
}
