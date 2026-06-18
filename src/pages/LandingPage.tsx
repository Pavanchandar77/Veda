import { useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Feather, Globe, ArrowRight } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function NebulaParticles() {
  const pointsRef1 = useRef<THREE.Points>(null);
  const pointsRef2 = useRef<THREE.Points>(null);

  // Generate distinct coordinate buffers for cyan and purple star clouds
  const [cyanCoords, purpleCoords] = useMemo(() => {
    const c = new Float32Array(600 * 3);
    const p = new Float32Array(600 * 3);
    
    for (let i = 0; i < 600; i++) {
      // Generate spherical coordinate distributions
      const r1 = 2 + Math.random() * 4;
      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.acos(Math.random() * 2 - 1);
      c[i * 3] = r1 * Math.sin(phi1) * Math.cos(theta1);
      c[i * 3 + 1] = r1 * Math.sin(phi1) * Math.sin(theta1);
      c[i * 3 + 2] = r1 * Math.cos(phi1);

      const r2 = 3 + Math.random() * 3;
      const theta2 = Math.random() * Math.PI * 2;
      const phi2 = Math.acos(Math.random() * 2 - 1);
      p[i * 3] = r2 * Math.sin(phi2) * Math.cos(theta2);
      p[i * 3 + 1] = r2 * Math.sin(phi2) * Math.sin(theta2);
      p[i * 3 + 2] = r2 * Math.cos(phi2);
    }
    return [c, p];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef1.current) {
      pointsRef1.current.rotation.y += delta * 0.02;
      pointsRef1.current.rotation.x += delta * 0.005;
    }
    if (pointsRef2.current) {
      pointsRef2.current.rotation.y -= delta * 0.015;
      pointsRef2.current.rotation.z += delta * 0.008;
    }
  });

  return (
    <group>
      <Points ref={pointsRef1} positions={cyanCoords} stride={3}>
        <PointMaterial
          transparent
          color="#06b6d4"
          size={0.04}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.4}
        />
      </Points>
      <Points ref={pointsRef2} positions={purpleCoords} stride={3}>
        <PointMaterial
          transparent
          color="#8b5cf6"
          size={0.06}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.35}
        />
      </Points>
    </group>
  );
}

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden bg-obsidian">
      
      {/* ThreeJS 3D Particle Cloud Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <NebulaParticles />
        </Canvas>
      </div>

      {/* Screen tint and grid overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-obsidian/30 to-obsidian" />
      <div className="absolute inset-0 z-0 pointer-events-none noise-bg opacity-[0.02]" />

      <div className="relative z-10 max-w-4xl w-full px-6 flex flex-col items-center text-center">
        
        {/* Soft neon aura behind hero text */}
        <div className="absolute -top-12 w-[350px] h-[350px] bg-cyber-purple/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-12 w-[300px] h-[300px] bg-cyber-cyan/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-6 leading-tight"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Preserve Reality in{' '}
          <span className="text-cyber-gradient font-extrabold">3D.</span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl font-light tracking-wide leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Upload standard video footage. Harness neural representations to output photorealistic, explorable volumetric environments instantly.
        </motion.p>
        
        <motion.button
          onClick={onStart}
          className="glow-btn group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-sm uppercase tracking-wider flex items-center gap-3 cursor-pointer shadow-[0_12px_24px_rgba(255,255,255,0.06)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.2)]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span>Start Scanning</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>
        
        <motion.div 
          className="mt-24 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 opacity-30 select-none text-xs font-mono tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span>React 19</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <span>Three.js</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <span>Vite v6</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <span>Gaussian Splatting</span>
        </motion.div>
      </div>

      {/* Floating feature list at bottom */}
      <div className="w-full px-6 flex justify-center mt-20 z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            { 
              icon: BrainCircuit, 
              title: "Neural Fidelity", 
              desc: "Powered by Gaussian Splatting for photorealism.",
              color: "group-hover:text-cyber-purple",
              bg: "group-hover:bg-cyber-purple/5"
            },
            { 
              icon: Feather, 
              title: "Light as Air", 
              desc: "10MB streamable assets optimized for mobile.",
              color: "group-hover:text-cyber-pink",
              bg: "group-hover:bg-cyber-pink/5"
            },
            { 
              icon: Globe, 
              title: "Web Native", 
              desc: "Zero installation required. Runs inside standard browsers.",
              color: "group-hover:text-cyber-cyan",
              bg: "group-hover:bg-cyber-cyan/5"
            },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="glass-card group p-6 rounded-2xl flex flex-col gap-4"
            >
              <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-colors duration-300 ${feature.bg}`}>
                <feature.icon className={`w-5 h-5 text-white/70 transition-colors duration-300 ${feature.color}`} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-white group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm mt-1 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
