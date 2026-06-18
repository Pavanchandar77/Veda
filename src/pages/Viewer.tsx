import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Share, MapPin, X, Music, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

// A mock 3D geometry representing the scanned object
function ScannedObject({ autoRotate }: { autoRotate: boolean }) {
  const points = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    // Generate a torus knot shaped point cloud to look like a scanned complex object
    const p = new Float32Array(30000 * 3);
    for (let i = 0; i < 30000; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        
        // Torus knot equation
        const r = 0.8 + 0.3 * Math.cos(3 * v);
        const x = r * Math.cos(2 * v);
        const y = r * Math.sin(2 * v);
        const z = 0.3 * Math.sin(3 * v);

        // Add noise
        p[i * 3] = x + (Math.random() - 0.5) * 0.4;
        p[i * 3 + 1] = y + (Math.random() - 0.5) * 0.4;
        p[i * 3 + 2] = z + (Math.random() - 0.5) * 0.4;
    }
    return p;
  }, []);

  useFrame((state, delta) => {
    if (points.current && autoRotate) {
      points.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      <Points ref={points} positions={positions} stride={3}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
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
  const [title, setTitle] = useState("Untitled Scan");

  return (
    <div className="fixed inset-0 w-full h-screen bg-black z-50 flex overflow-hidden flex-col">
      <div className="flex-1 relative w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <React.Suspense fallback={null}>
            <color attach="background" args={['#050505']} />
            <ambientLight intensity={0.5} />
            <Environment preset="city" />
            <ScannedObject autoRotate={autoRotate} />
          </React.Suspense>
          {/* @ts-ignore */}
          <OrbitControls enableDamping dampingFactor={0.05} autoRotate={false} />
        </Canvas>

        {/* HUD Elements */}
        <div className="absolute top-6 left-6 flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-charcoal/80 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-xl font-bold text-white focus:outline-none placeholder:text-white/30 border-b border-transparent focus:border-white/20 transition-colors py-1"
          />
        </div>

        <div className="absolute top-6 right-6 flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal/80 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors font-medium text-sm">
            <Share className="w-4 h-4" />
            Share WebGL
          </button>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-charcoal/80 backdrop-blur-md border border-white/10 rounded-full p-2">
          <button 
            className={cn(
              "px-4 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-2",
              autoRotate ? "bg-electric text-white" : "text-white/60 hover:text-white hover:bg-white/5"
            )}
            onClick={() => setAutoRotate(!autoRotate)}
          >
             <RotateCcw className="w-3 h-3" /> Auto-Rotate
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="px-4 text-xs font-mono text-white/40 border border-transparent">
             Orbit: Drag • Zoom: Scroll
          </div>
        </div>
      </div>

      {/* Context Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div 
            className="w-[320px] bg-charcoal/80 backdrop-blur-xl border-l border-white/10 flex flex-col h-full z-10 absolute right-0 top-0"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Context</h3>
              <button onClick={() => setIsSidebarOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-8 overflow-y-auto w-full">
              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Description</label>
                <textarea 
                  placeholder="Where is this? What is the story?"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-electric/50 resize-none h-24 placeholder:text-white/30"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Location Data</label>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/80 group">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/40 group-hover:text-electric transition-colors" />
                    <span>Add Coordinates</span>
                  </div>
                </button>
              </div>

              {/* Audio Context */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Ambient Audio</label>
                <div className="w-full border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/[0.02] hover:border-white/20 transition-all cursor-pointer">
                   <Music className="w-5 h-5 text-white/40" />
                   <span className="text-xs text-white/50">Upload background sound</span>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>File Size</span>
                  <span className="font-mono">8.4 MB</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/40 mt-2">
                  <span>Created</span>
                  <span className="font-mono">Just now</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
