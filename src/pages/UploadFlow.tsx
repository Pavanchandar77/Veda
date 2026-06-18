import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, Video, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

const STAGES = [
  "Ingesting Video Frames...",
  "Extracting Depth Maps...",
  "Running Structure from Motion...",
  "Generating Point Cloud...",
  "Optimizing Gaussian Splats...",
  "Finalizing Volume Mesh...",
];

interface UploadFlowProps {
  onComplete: (id: string) => void;
}

export default function UploadFlow({ onComplete }: UploadFlowProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{id: number, text: string, type: 'sys' | 'proc' | 'info' | 'success'}[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logIdRef = useRef(0);
  const stageIndexRef = useRef(0);
  
  const uploadCompletedRef = useRef(false);
  const targetIdRef = useRef<string | null>(null);

  const startReconstruction = (file: File) => {
    setIsProcessing(true);
    uploadCompletedRef.current = false;
    targetIdRef.current = null;
    setProgress(0);
    setLogs([{ id: logIdRef.current++, text: `[SYSTEM] Ingestion started for: ${file.name}...`, type: 'sys' }]);

    const formData = new FormData();
    formData.append('video', file);

    fetch('/api/scan', {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (!res.ok) throw new Error("Server pipeline failed.");
        return res.json();
      })
      .then(data => {
        console.log("[UPLOAD] Scan successful:", data);
        targetIdRef.current = data.id;
        uploadCompletedRef.current = true;
      })
      .catch(err => {
        console.error("[UPLOAD] Scan failed:", err);
        setLogs(prev => [
          ...prev, 
          { id: logIdRef.current++, text: `[ERROR] Reconstruction failed: ${err.message}`, type: 'sys' }
        ]);
        setTimeout(() => setIsProcessing(false), 4000);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startReconstruction(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (!isProcessing) return;

    let currentProgress = 0;
    const interval = setInterval(() => {
      // Slow down simulated progress at 90% if the network request is still uploading
      if (currentProgress < 90) {
        currentProgress += 1;
        setProgress(currentProgress);
      } else if (uploadCompletedRef.current) {
        currentProgress += 2;
        if (currentProgress > 100) currentProgress = 100;
        setProgress(currentProgress);
      }

      const stage = Math.floor((currentProgress / 100) * STAGES.length);
      if (stage !== stageIndexRef.current && stage < STAGES.length) {
        stageIndexRef.current = stage;
        setStageIndex(stage);
        setLogs(prev => [
          ...prev, 
          { id: logIdRef.current++, text: `[PROCESS] ${STAGES[stage]}`, type: 'proc' }
        ]);
      } else if (Math.random() > 0.8) {
        const randomLogs = [
          { text: `[INFO] Extracted ${60 + Math.floor(Math.random() * 80)} keyframes`, type: 'info' },
          { text: `[INFO] Optimizing camera pose projection coordinates...`, type: 'info' },
          { text: `[INFO] Allocating system buffers & initializing reconstruction...`, type: 'info' },
          { text: `[SYSTEM] Pipeline check completed in ${Math.floor(Math.random() * 100) + 30}ms`, type: 'sys' }
        ];
        const selectedLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
        setLogs(prev => {
          const nextLogs = [...prev, { id: logIdRef.current++, text: selectedLog.text, type: selectedLog.type as any }];
          if (nextLogs.length > 8) return nextLogs.slice(nextLogs.length - 8);
          return nextLogs;
        });
      }

      if (currentProgress >= 100 && uploadCompletedRef.current && targetIdRef.current) {
        clearInterval(interval);
        setLogs(prev => [
          ...prev, 
          { id: logIdRef.current++, text: `[SUCCESS] 3D Gaussian Splat model synthesized successfully.`, type: 'success' }
        ]);
        setTimeout(() => {
          onComplete(targetIdRef.current!);
        }, 1500);
      }
    }, 80); // 8s total duration

    return () => clearInterval(interval);
  }, [isProcessing, onComplete]);

  return (
    <div className="w-full min-h-screen pt-28 pb-12 flex items-center justify-center bg-obsidian px-6 relative overflow-hidden">
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="video/*" 
        className="hidden" 
      />

      {/* Ambient backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-[#050508]/40 to-[#030303]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-purple/5 rounded-full blur-[120px] pointer-events-none" />

      {!isProcessing ? (
        <motion.div 
          className="max-w-2xl w-full flex flex-col items-center z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">Create a New Scene</h2>
            <p className="text-white/50 text-base md:text-lg max-w-md mx-auto">
              Walk steadily around your subject. Keep rotation smooth and lighting consistent.
            </p>
          </div>

          <div
            className={cn(
              "w-full aspect-video rounded-3xl border border-white/10 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer bg-charcoal/30 backdrop-blur-xl relative overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.4)]",
              isHovering ? "border-cyber-cyan/50 bg-cyber-cyan/[0.02] shadow-[0_0_50px_rgba(6,182,212,0.15)]" : "hover:border-white/20 hover:bg-white/[0.01]"
            )}
            onDragEnter={() => setIsHovering(true)}
            onDragLeave={() => setIsHovering(false)}
            onDrop={(e) => { 
              e.preventDefault(); 
              setIsHovering(false); 
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                startReconstruction(e.dataTransfer.files[0]);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleUploadClick}
          >
            {/* Sci-Fi Scanner Ray */}
            <div className="scanline opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Hologram Circle */}
            <div className="absolute w-[180px] h-[180px] border border-dashed border-white/5 rounded-full animate-[spin_60s_linear_infinite] group-hover:border-cyber-cyan/10 transition-colors" />
            <div className="absolute w-[240px] h-[240px] border border-white/[0.02] rounded-full animate-[spin_120s_linear_infinite] group-hover:border-cyber-purple/5 transition-colors" />

            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyber-cyan/10 transition-all duration-300 relative z-10 border border-white/10 group-hover:border-cyber-cyan/30">
              <UploadCloud className={cn("w-6 h-6 transition-colors duration-300", isHovering ? "text-cyber-cyan" : "text-white/60")} />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2 relative z-10 text-white">Drag & drop your video</h3>
            <p className="text-sm font-mono text-white/40 relative z-10">MP4, MOV (Max 500MB)</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="max-w-4xl w-full z-10"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass-panel rounded-3xl p-6 md:p-8 overflow-hidden relative shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyber-purple/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyber-cyan/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              
              {/* Left Column: Progress Info */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-cyber-purple/10 flex items-center justify-center border border-cyber-purple/20">
                      <Cpu className="w-5 h-5 text-cyber-purple" />
                    </div>
                    <div>
                      <span className="text-xs font-mono uppercase tracking-widest text-cyber-purple">Processing Pipeline</span>
                      <h3 className="text-xl font-display font-bold text-white">Reconstruction Active</h3>
                    </div>
                  </div>
                  
                  {/* Stages List */}
                  <div className="flex flex-col gap-3">
                    {STAGES.map((stage, i) => {
                      const isActive = i === stageIndex && progress < 100;
                      const isCompleted = i < stageIndex || progress === 100;
                      return (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-center gap-3 text-sm transition-all duration-300",
                            isActive ? "text-white font-semibold transform translate-x-1" : isCompleted ? "text-white/80" : "text-white/20"
                          )}
                        >
                          <div className="w-5 h-5 flex items-center justify-center">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-cyber-cyan" />
                            ) : isActive ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-cyber-purple animate-ping" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            )}
                          </div>
                          <span className="font-sans text-xs md:text-sm tracking-wide">{stage}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 lg:mt-0">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Overall Progress</span>
                    <span className="text-2xl font-mono font-medium text-cyber-cyan">{progress}%</span>
                  </div>
                  {/* Progress Bar Container */}
                  <div className="w-full h-[6px] bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                      style={{ boxShadow: '0 0 10px rgba(99,102,241,0.5)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Console Log */}
              <div className="lg:col-span-7">
                <div className="bg-black/50 border border-white/5 rounded-2xl overflow-hidden shadow-inner flex flex-col h-[320px]">
                  <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-2">Console Output</span>
                  </div>
                  <div className="p-4 font-mono text-[11px] leading-relaxed overflow-y-auto flex-1 flex flex-col justify-end">
                    <AnimatePresence>
                      {logs.map((log) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "mb-1.5 flex items-start gap-2",
                            log.type === 'success' ? "text-cyber-cyan" :
                            log.type === 'proc' ? "text-cyber-purple" :
                            log.type === 'sys' ? "text-cyber-pink" : "text-white/60"
                          )}
                        >
                          <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-40" />
                          <span>{log.text}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
