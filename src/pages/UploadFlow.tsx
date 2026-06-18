import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, Video, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock processing stages
const STAGES = [
  "Ingesting Video Frames...",
  "Extracting Depth Maps...",
  "Running Structure from Motion...",
  "Generating Point Cloud...",
  "Optimizing Gaussian Splats...",
  "Finalizing Mesh...",
];

interface UploadFlowProps {
  onComplete: (id: string) => void;
}

export default function UploadFlow({ onComplete }: UploadFlowProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{id: number, text: string}[]>([]);
  const logIdRef = useRef(0);
  const stageIndexRef = useRef(0);

  const handleUploadClick = () => {
    setIsProcessing(true);
    setLogs([{ id: logIdRef.current++, text: "[SYSTEM] Initializing upload sequence..." }]);
  };

  useEffect(() => {
    if (!isProcessing) return;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      const stage = Math.floor((currentProgress / 100) * STAGES.length);
      if (stage !== stageIndexRef.current && stage < STAGES.length) {
        stageIndexRef.current = stage;
        setStageIndex(stage);
        setLogs(prev => [...prev, { id: logIdRef.current++, text: `[PROCESS] ${STAGES[stage]}` }]);
      } else if (Math.random() > 0.8) {
        // Random techy logs
        const randomLogs = [
          `[INFO] Detected 240 keyframes`,
          `[CALC] Optimizing camera pose params...`,
          `[MEM] Allocating VRAM buffer...`,
          `[CUDA] Kernel execution completed in ${Math.floor(Math.random() * 200)}ms`
        ];
        const logText = randomLogs[Math.floor(Math.random() * randomLogs.length)];
        setLogs(prev => {
           const nextLogs = [...prev, { id: logIdRef.current++, text: logText }];
           if (nextLogs.length > 8) return nextLogs.slice(nextLogs.length - 8);
           return nextLogs;
        });
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setLogs(prev => [...prev, { id: logIdRef.current++, text: `[SUCCESS] 3D Model generated successfully.` }]);
        setTimeout(() => {
          onComplete(`splat-${Date.now()}`);
        }, 1500);
      }
    }, 50); // 5s total processing (faster for user)

    return () => clearInterval(interval);
  }, [isProcessing, onComplete]);

  return (
    <div className="w-full h-screen pt-20 flex items-center justify-center bg-obsidian px-6">
      
      {!isProcessing ? (
        <motion.div 
          className="max-w-2xl w-full flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Create a New Scene</h2>
            <p className="text-white/50 text-lg">Walk in a circle around your subject. Keep lighting steady.</p>
          </div>

          <div
            className={cn(
              "w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer bg-charcoal/30 backdrop-blur-sm group",
              isHovering ? "border-electric bg-electric/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
            )}
            onDragEnter={() => setIsHovering(true)}
            onDragLeave={() => setIsHovering(false)}
            onDrop={(e) => { e.preventDefault(); setIsHovering(false); handleUploadClick(); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleUploadClick}
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud className={cn("w-8 h-8 transition-colors", isHovering ? "text-electric" : "text-white/60")} />
            </div>
            <h3 className="text-xl font-medium mb-2">Drag & drop your video</h3>
            <p className="text-sm font-mono text-white/40">MP4, MOV (Max 500MB)</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="max-w-3xl w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="bg-charcoal border border-white/10 rounded-2xl p-8 overflow-hidden relative shadow-2xl">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-electric/20 rounded-full blur-[80px]" />

            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                    {progress === 100 ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      >
                        <Video className="w-6 h-6 text-electric" />
                      </motion.div>
                    )}
                    {progress === 100 ? "Processing Complete" : "Synthesizing Reality"}
                  </h3>
                  <p className="text-white/50 text-sm mt-2">{STAGES[stageIndex]}</p>
                </div>
                <div className="text-3xl font-mono font-light text-electric/80">
                  {progress}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-electric shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>

              {/* Terminal Log Output */}
              <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-white/60 h-48 overflow-hidden flex flex-col justify-end border border-white/5">
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-1 py-1"
                    >
                      {log.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
