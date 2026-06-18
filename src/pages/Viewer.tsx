import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Share, MapPin, X, Music, RotateCcw, Sliders, Menu, Info } from 'lucide-react';
import { cn } from '../lib/utils';

// Holographic point cloud object representing a high-fidelity volumetric scan
function ScannedObject({ autoRotate }: { autoRotate: boolean }) {
  const points = useRef<THREE.Points>(null);
  
  // Generate coordinates for a complex torus knot point cloud
  const positions = useMemo(() => {
    const p = new Float32Array(35000 * 3);
    for (let i = 0; i < 35000; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        
        // Torus knot equations
        const r = 1.0 + 0.35 * Math.cos(3 * v);
        const x = r * Math.cos(2 * v);
        const y = r * Math.sin(2 * v);
        const z = 0.35 * Math.sin(3 * v);

        // Inject random noise to simulate points generated from Gaussian Splats
        p[i * 3] = x + (Math.random() - 0.5) * 0.35;
        p[i * 3 + 1] = y + (Math.random() - 0.5) * 0.35;
        p[i * 3 + 2] = z + (Math.random() - 0.5) * 0.35;
    }
    return p;
  }, []);

  // Generate color channels mapping vertex position coordinates to a cyber neon gradient
  const colors = useMemo(() => {
    const c = new Float32Array(35000 * 3);
    for (let i = 0; i < 35000; i++) {
      const y = positions[i * 3 + 1];
      const t = (y + 1.35) / 2.7; // Normalized height value

      // Blend from Cyan (#06b6d4) at the bottom to Hot Pink (#ec4899) at the top
      c[i * 3] = (6 + (236 - 6) * t) / 255;
      c[i * 3 + 1] = (182 + (72 - 182) * t) / 255;
      c[i * 3 + 2] = (212 + (153 - 212) * t) / 255;
    }
    return c;
  }, [positions]);

  useFrame((state, delta) => {
    if (points.current && autoRotate) {
      points.current.rotation.y += delta * 0.15;
      points.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group>
      <Points ref={points} positions={positions} colors={colors} stride={3}>
        <PointMaterial
          transparent
          vertexColors
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.75}
        />
      </Points>
    </group>
  );
}

interface ViewerProps {
  id: string | null;
  onClose: () => void;
}

export default function Viewer({ id, onClose }: ViewerProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [title, setTitle] = useState("Kyoto Temple Garden");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-screen bg-obsidian z-50 flex overflow-hidden flex-col">
      
      {/* 3D Canvas Viewport */}
      <div className="flex-1 relative w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 3.8] }}>
          <React.Suspense fallback={null}>
            <color attach="background" args={['#030303']} />
            <ambientLight intensity={0.6} />
            <Environment preset="city" />
            
            {/* Scanned Point Cloud */}
            <ScannedObject autoRotate={autoRotate} />
            
            {/* Holographic grid alignment base */}
            <gridHelper 
              args={[10, 20, '#06b6d4', '#1f1635']} 
              position={[0, -1.3, 0]} 
            />
          </React.Suspense>
          {/* @ts-ignore */}
          <OrbitControls enableDamping dampingFactor={0.05} autoRotate={false} />
        </Canvas>

        {/* Top Header Overlay HUD */}
        <div className="absolute top-6 left-6 flex items-center gap-4 z-20">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-charcoal/70 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 text-white cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </motion.button>
          
          <div className="flex flex-col bg-charcoal/60 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-2xl shadow-lg">
            <span className="text-[9px] font-mono uppercase tracking-widest text-cyber-cyan">Volumetric Scan</span>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-sm font-display font-semibold text-white focus:outline-none placeholder:text-white/30 border-b border-transparent focus:border-white/10 transition-colors py-0.5"
            />
          </div>
        </div>

        {/* Top Right Action HUD */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal/70 backdrop-blur-xl border border-cyber-cyan/30 text-white hover:border-cyber-cyan transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-lg shadow-cyber-cyan/5"
          >
            <Share className="w-4 h-4 text-cyber-cyan" />
            Share Splat
          </motion.button>
          
          {!isSidebarOpen && (
            <motion.button 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 rounded-full bg-charcoal/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-white/5"
            >
              <Menu className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Bottom Orbit / Controls Panel */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-charcoal/70 backdrop-blur-xl border border-white/10 rounded-full p-2 z-20 shadow-2xl">
          <button 
            className={cn(
              "px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer",
              autoRotate ? "bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
            )}
            onClick={() => setAutoRotate(!autoRotate)}
          >
             <RotateCcw className="w-3 h-3" /> Auto-Rotate
          </button>
          <div className="w-px h-4 bg-white/15" />
          <div className="px-4 text-[10px] font-mono text-white/40 tracking-wider flex items-center gap-1.5 select-none">
             <Info className="w-3.5 h-3.5 opacity-55" />
             <span>Orbit: Drag • Zoom: Scroll</span>
          </div>
        </div>
      </div>

      {/* Floating Control/Context Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div 
            className="w-[340px] bg-charcoal/40 backdrop-blur-2xl border-l border-white/5 flex flex-col h-full z-30 absolute right-0 top-0 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyber-cyan" />
                <h3 className="font-display font-bold text-base tracking-wide">Scene Telemetry</h3>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="text-white/40 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-8 overflow-y-auto w-full flex-1">
              
              {/* Description Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-semibold text-white/40 uppercase tracking-widest">Metadata Notes</label>
                <textarea 
                  placeholder="Where was this scanned? What are the key details?"
                  defaultValue="A high-fidelity volumetric capture of a garden courtyard inside a historic Kyoto temple. Features stone lanterns, mossy rocks, and bonsai-style pine branches."
                  className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-xs leading-relaxed text-white focus:outline-none focus:border-cyber-purple/55 resize-none h-28 placeholder:text-white/20 transition-all font-sans"
                />
              </div>

              {/* Spatial Coordinates */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-semibold text-white/40 uppercase tracking-widest">Spatial Reference</label>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-cyber-cyan/20 transition-all text-xs text-white/70 group cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-white/30 group-hover:text-cyber-cyan transition-colors" />
                    <span className="font-mono">35.0268° N, 135.7730° E</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-cyber-cyan font-mono opacity-0 group-hover:opacity-100 transition-opacity">Linked</span>
                </button>
              </div>

              {/* Ambient Audio Context */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-semibold text-white/40 uppercase tracking-widest">Acoustic Ambience</label>
                <div 
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={cn(
                    "w-full border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer shadow-inner",
                    isPlayingAudio 
                      ? "border-cyber-purple bg-cyber-purple/5 text-cyber-purple" 
                      : "border-dashed border-white/10 hover:bg-white/[0.01] hover:border-white/20 text-white/40"
                  )}
                >
                  <Music className={cn("w-5 h-5", isPlayingAudio ? "animate-bounce" : "")} />
                  <span className="text-xs font-semibold">
                    {isPlayingAudio ? "Playing Ambient Sounds" : "Connect Ambient Sound"}
                  </span>
                  {isPlayingAudio && (
                    <div className="flex gap-1 items-end h-3 mt-1">
                      <div className="w-[2px] bg-cyber-purple animate-[pulse_1s_infinite_100ms] h-2" />
                      <div className="w-[2px] bg-cyber-purple animate-[pulse_1s_infinite_300ms] h-3" />
                      <div className="w-[2px] bg-cyber-purple animate-[pulse_1s_infinite_200ms] h-1.5" />
                      <div className="w-[2px] bg-cyber-purple animate-[pulse_1s_infinite_400ms] h-2.5" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Asset Diagnostics */}
              <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-2 select-none">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>Volumetric Size</span>
                  <span className="text-white/80">8.4 MB</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>Gaussian Splat Kernels</span>
                  <span className="text-white/80">35,000 pts</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>Processed On</span>
                  <span className="text-white/80">CUDA Device 0</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
