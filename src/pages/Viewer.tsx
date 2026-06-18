import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Share, MapPin, X, Music, RotateCcw, Sliders, Menu, Info } from 'lucide-react';
import { cn } from '../lib/utils';

// Static description and metadata registry for each scene
const SCENE_INFO: Record<string, { title: string; desc: string; coords: string; size: string; device: string }> = {
  '1': { 
    title: 'Kyoto Temple Garden', 
    desc: 'A high-fidelity volumetric capture of a garden courtyard inside a historic Kyoto temple. Features red wooden structures, mossy stone walls, and green bonsai foliage.', 
    coords: '35.0268° N, 135.7730° E',
    size: '8.4 MB',
    device: 'Veda Core v1.2'
  },
  '2': { 
    title: 'Vintage Porsche 911', 
    desc: 'A detailed 3D laser-line scan of a vintage silver Porsche 911. Captures sleek curved panels, dark rubber tires, chrome wheels, and glowing head/tail lights.', 
    coords: '48.7758° N, 9.1829° E',
    size: '12.1 MB',
    device: 'CUDA Pipeline B'
  },
  '3': { 
    title: 'My Workspace Setup', 
    desc: 'Volumetric scan of a developer desk. Accurately maps the table flat surface, dual monitors glowing in cyan, glowing mechanical keyboard keys, and office chair.', 
    coords: '37.7749° N, 122.4194° W',
    size: '6.8 MB',
    device: 'HoloScan Pro'
  },
  '4': { 
    title: 'Coffee Shop Corner', 
    desc: 'Cozy café interior scan capturing a round oak table, dark metal chair frame, silver espresso machine on the back counter, and ivy hanging basket.', 
    coords: '40.7128° N, 74.0060° W',
    size: '9.2 MB',
    device: 'Veda Core v1.2'
  },
  '5': { 
    title: 'Ceramic Vase Study', 
    desc: 'Archival quality museum scan of a ceramic vase. Generates terracotta revolving profile walls with gold metallic glazes standing on a white pedestal.', 
    coords: '51.5074° N, 0.1278° W',
    size: '4.1 MB',
    device: 'High-Res Optical'
  },
  '6': { 
    title: 'Abandoned Factory', 
    desc: 'Industrial warehouse exploration scan. Resolves deep rusted steel I-beams, overhead distribution piping networks, concrete floor slab, and floating dust.', 
    coords: '52.5200° N, 13.4050° E',
    size: '14.5 MB',
    device: 'CUDA Pipeline B'
  },
};

// Holographic point cloud object representing a high-fidelity volumetric scan
function ScannedObject({ id, autoRotate }: { id: string | null; autoRotate: boolean }) {
  const points = useRef<THREE.Points>(null);
  const [loadedData, setLoadedData] = useState<{ positions: Float32Array; colors: Float32Array } | null>(null);

  // Dynamic binary splat loading logic
  useEffect(() => {
    if (!id || !id.startsWith('scan-')) {
      setLoadedData(null);
      return;
    }

    const splatUrl = `/scans/${id}.splat`;
    console.log(`[VIEWER] Loading binary splat asset: ${splatUrl}`);

    fetch(splatUrl)
      .then(res => {
        if (!res.ok) throw new Error("Network response failed.");
        return res.arrayBuffer();
      })
      .then(buffer => {
        const numPoints = Math.floor(buffer.byteLength / 44);
        const posArray = new Float32Array(numPoints * 3);
        const colArray = new Float32Array(numPoints * 3);
        const view = new DataView(buffer);

        for (let i = 0; i < numPoints; i++) {
          const offset = i * 44;
          
          // Read x, y, z positions as float32
          posArray[i * 3] = view.getFloat32(offset, true);
          posArray[i * 3 + 1] = view.getFloat32(offset + 4, true);
          posArray[i * 3 + 2] = view.getFloat32(offset + 8, true);
          
          // Read color (r, g, b at offset + 24)
          colArray[i * 3] = view.getUint8(offset + 24) / 255;
          colArray[i * 3 + 1] = view.getUint8(offset + 25) / 255;
          colArray[i * 3 + 2] = view.getUint8(offset + 26) / 255;
        }

        console.log(`[VIEWER] Loaded and parsed ${numPoints} Gaussian splat nodes.`);
        setLoadedData({ positions: posArray, colors: colArray });
      })
      .catch(err => {
        console.error("[VIEWER] Error loading splat file:", err);
      });
  }, [id]);

  // Generate procedural coordinates (fallback / gallery mocks)
  const [proceduralPositions, proceduralColors] = useMemo(() => {
    const count = 40000;
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);

    const setPoint = (index: number, x: number, y: number, z: number, colorHex: string) => {
      const noise = 0.025;
      p[index * 3] = x + (Math.random() - 0.5) * noise;
      p[index * 3 + 1] = y + (Math.random() - 0.5) * noise;
      p[index * 3 + 2] = z + (Math.random() - 0.5) * noise;

      const r = parseInt(colorHex.substring(1, 3), 16) / 255;
      const g = parseInt(colorHex.substring(3, 5), 16) / 255;
      const b = parseInt(colorHex.substring(5, 7), 16) / 255;

      c[index * 3] = r;
      c[index * 3 + 1] = g;
      c[index * 3 + 2] = b;
    };

    if (id === '1') {
      for (let i = 0; i < count; i++) {
        const pct = i / count;
        if (pct < 0.4) {
          const subIdx = i % 3;
          const tierY = -0.5 + subIdx * 0.6;
          const maxRadius = 0.6 - subIdx * 0.15;
          
          if (Math.random() > 0.3) {
            const u = Math.random();
            const theta = Math.random() * Math.PI * 2;
            const r = Math.pow(u, 0.5) * maxRadius;
            const px = r * Math.cos(theta);
            const pz = r * Math.sin(theta);
            const cornerHeight = 0.12 * Math.pow(r / maxRadius, 2.5) * (1.0 + 0.3 * Math.cos(theta * 4));
            setPoint(i, px, tierY + cornerHeight, pz, '#b91c1c');
          } else {
            const theta = (Math.floor(Math.random() * 4) * Math.PI) / 2;
            const px = 0.35 * Math.cos(theta);
            const pz = 0.35 * Math.sin(theta);
            const py = -0.8 + Math.random() * 1.5;
            setPoint(i, px, py, pz, '#78350f');
          }
        } else if (pct < 0.7) {
          const x = -1.2 + Math.random() * 0.8;
          const zWidth = (Math.random() - 0.5) * 0.35;
          const archY = -1.1 + 0.35 * Math.sin(Math.PI * (x + 1.2) / 0.8);
          
          if (Math.random() > 0.4) {
            setPoint(i, x, archY, zWidth, '#dc2626');
          } else {
            const railY = archY + 0.15;
            const side = Math.random() > 0.5 ? 0.17 : -0.17;
            setPoint(i, x, railY, side, '#991b1b');
          }
        } else {
          const isLeft = Math.random() > 0.5;
          const centerX = isLeft ? -0.8 : 0.8;
          const centerY = isLeft ? 0.3 : 0.1;
          const centerZ = isLeft ? -0.4 : 0.5;
          const r = Math.random() * 0.38;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          
          const px = centerX + r * Math.sin(phi) * Math.cos(theta);
          const py = centerY + r * Math.sin(phi) * Math.sin(theta);
          const pz = centerZ + r * Math.cos(phi);
          
          setPoint(i, px, py, pz, isLeft ? '#047857' : '#059669');
        }
      }
    } else if (id === '2') {
      for (let i = 0; i < count; i++) {
        const pct = i / count;
        if (pct < 0.6) {
          const x = (Math.random() - 0.5) * 2.5;
          const z = (Math.random() - 0.5) * 1.15;
          let topY = 0.12;
          if (x > 0.4) {
            topY = 0.12 - 0.25 * Math.pow((x - 0.4) / 0.85, 2.0);
          } else if (x < -0.3) {
            topY = 0.12 - 0.18 * Math.pow((x + 0.3) / 0.95, 1.8);
          }
          const y = -0.5 + Math.random() * (topY + 0.5);
          const distToWheelCenter = Math.min(Math.abs(x - 0.75), Math.abs(x + 0.75));
          const isWheelWell = distToWheelCenter < 0.35 && y < -0.2 && Math.abs(z) > 0.45;
          
          if (isWheelWell) {
            setPoint(i, x, y, z, '#0f172a');
          } else if (x > 1.2 && Math.abs(z) > 0.3 && y > -0.1) {
            setPoint(i, x, y, z, '#06b6d4');
          } else if (x < -1.2 && y > 0.0) {
            setPoint(i, x, y, z, '#ec4899');
          } else {
            setPoint(i, x, y, z, '#94a3b8');
          }
        } else if (pct < 0.75) {
          const x = -0.6 + Math.random() * 1.0;
          const z = (Math.random() - 0.5) * 0.85 * (1.0 - Math.abs(x - 0.15) * 0.45);
          const roofHeight = 0.5 - 0.35 * Math.pow(x - 0.1, 2.0);
          const y = 0.05 + Math.random() * (roofHeight - 0.05);
          
          if (Math.abs(x - 0.3) < 0.05 || Math.abs(x + 0.5) < 0.05 || Math.abs(z) > 0.38) {
            setPoint(i, x, y, z, '#0f172a');
          } else {
            setPoint(i, x, y, z, '#94a3b8');
          }
        } else {
          const isFront = Math.random() > 0.5;
          const isRight = Math.random() > 0.5;
          const wheelX = isFront ? 0.75 : -0.75;
          const wheelZ = isRight ? 0.5 : -0.5;
          const wheelY = -0.5;
          const theta = Math.random() * Math.PI * 2;
          const r = 0.15 + Math.random() * 0.15;
          const pz = wheelZ + (Math.random() - 0.5) * 0.12;
          const px = wheelX + r * Math.cos(theta);
          const py = wheelY + r * Math.sin(theta);
          const isRim = r < 0.17;
          setPoint(i, px, py, pz, isRim ? '#cbd5e1' : '#0f172a');
        }
      }
    } else if (id === '3') {
      for (let i = 0; i < count; i++) {
        const pct = i / count;
        if (pct < 0.35) {
          const x = (Math.random() - 0.5) * 2.6;
          const z = (Math.random() - 0.5) * 1.7;
          setPoint(i, x, -0.4, z, '#7c2d12');
        } else if (pct < 0.6) {
          const isRight = Math.random() > 0.5;
          const screenWidth = 0.6;
          const screenHeight = 0.45;
          const sVal = (Math.random() - 0.5) * screenWidth;
          const py = -0.2 + Math.random() * screenHeight;
          const angle = isRight ? -0.25 : 0.25;
          const offset = isRight ? 0.35 : -0.35;
          const px = offset + sVal * Math.cos(angle);
          const pz = -0.3 + sVal * Math.sin(angle);
          const isStand = py < -0.15 && Math.abs(sVal) < 0.05;
          if (isStand) {
            setPoint(i, px, py, pz, '#334155');
          } else {
            setPoint(i, px, py, pz, '#06b6d4');
          }
        } else if (pct < 0.75) {
          const x = (Math.random() - 0.5) * 0.9;
          const z = 0.1 + Math.random() * 0.4;
          const y = -0.38;
          const isMouse = x > 0.28;
          if (isMouse) {
            setPoint(i, x, y, z, '#ec4899');
          } else {
            setPoint(i, x, y, z, '#8b5cf6');
          }
        } else if (pct < 0.9) {
          const isLeft = Math.random() > 0.5;
          const isFront = Math.random() > 0.5;
          const px = isLeft ? -1.15 : 1.15;
          const pz = isFront ? 0.68 : -0.68;
          const py = -1.2 + Math.random() * 0.8;
          setPoint(i, px, py, pz, '#1e293b');
        } else {
          const x = (Math.random() - 0.5) * 0.5;
          const z = 0.5 + Math.random() * 0.4;
          const y = -1.2 + Math.random() * 1.3;
          const isBase = y < -0.8;
          setPoint(i, x, y, z, isBase ? '#1e293b' : '#2563eb');
        }
      }
    } else if (id === '4') {
      for (let i = 0; i < count; i++) {
        const pct = i / count;
        if (pct < 0.35) {
          const theta = Math.random() * Math.PI * 2;
          const r = Math.pow(Math.random(), 0.6) * 0.65;
          const px = r * Math.cos(theta) - 0.25;
          const pz = r * Math.sin(theta) + 0.15;
          setPoint(i, px, -0.3, pz, '#92400e');
        } else if (pct < 0.5) {
          const x = (Math.random() - 0.5) * 2.6;
          const z = -0.7 + (Math.random() - 0.5) * 0.3;
          const y = -0.4 + Math.random() * 0.8;
          const isMachine = x > 0.2 && y > 0.0;
          if (isMachine) {
            setPoint(i, x, y, z, '#cbd5e1');
          } else {
            setPoint(i, x, y, z, '#451a03');
          }
        } else if (pct < 0.65) {
          const py = 0.3 + Math.random() * 0.8;
          if (py > 0.8) {
            setPoint(i, 0.25, py, 0.0, '#0f172a');
          } else {
            const r = (0.8 - py) * 0.45;
            const theta = Math.random() * Math.PI * 2;
            const px = 0.25 + r * Math.cos(theta);
            const pz = 0.0 + r * Math.sin(theta);
            setPoint(i, px, py, pz, py < 0.45 ? '#eab308' : '#78350f');
          }
        } else if (pct < 0.8) {
          const seatX = 0.45;
          const seatZ = 0.25;
          const x = seatX + (Math.random() - 0.5) * 0.45;
          const z = seatZ + (Math.random() - 0.5) * 0.45;
          const y = -1.2 + Math.random() * 1.1;
          setPoint(i, x, y, z, '#0f172a');
        } else {
          const px = -0.85 + (Math.random() - 0.5) * 0.3;
          const py = 0.25 - Math.random() * 0.95;
          const pz = -0.25 + (Math.random() - 0.5) * 0.3;
          setPoint(i, px, py, pz, '#16a34a');
        }
      }
    } else if (id === '5') {
      for (let i = 0; i < count; i++) {
        const pct = i / count;
        if (pct < 0.65) {
          const y = -0.6 + Math.random() * 1.3;
          let r = 0.35;
          if (y < -0.1) {
            r = 0.35 + 0.22 * Math.cos(((y + 0.1) / 0.5) * Math.PI / 2);
          } else if (y < 0.45) {
            r = 0.35 - 0.15 * Math.sin(((y + 0.1) / 0.55) * Math.PI / 2);
          } else {
            r = 0.2 + 0.22 * Math.pow((y - 0.45) / 0.25, 2.0);
          }
          const theta = Math.random() * Math.PI * 2;
          const px = r * Math.cos(theta);
          const pz = r * Math.sin(theta);
          const isGold = Math.sin(theta * 6 + y * 8) > 0.4;
          setPoint(i, px, y, pz, isGold ? '#eab308' : '#ea580c');
        } else if (pct < 0.9) {
          const x = (Math.random() - 0.5) * 0.8;
          const z = (Math.random() - 0.5) * 0.8;
          const y = -1.3 + Math.random() * 0.7;
          const isVein = Math.sin(x * 5 + y * 3) > 0.7;
          setPoint(i, x, y, z, isVein ? '#64748b' : '#f1f5f9');
        } else {
          const py = -0.5 + Math.random() * 1.9;
          const r = (1.4 - py) * 0.5;
          const theta = Math.random() * Math.PI * 2;
          const px = r * Math.cos(theta);
          const pz = r * Math.sin(theta);
          setPoint(i, px, py, pz, '#fef08a');
        }
      }
    } else if (id === '6') {
      for (let i = 0; i < count; i++) {
        const pct = i / count;
        if (pct < 0.35) {
          const x = (Math.random() - 0.5) * 2.8;
          const z = (Math.random() - 0.5) * 2.0;
          setPoint(i, x, -1.2, z, '#334155');
        } else if (pct < 0.65) {
          const isLeft = Math.random() > 0.5;
          const girderX = isLeft ? -0.85 : 0.85;
          const girderZ = isLeft ? -0.45 : 0.45;
          const py = -1.2 + Math.random() * 2.6;
          const u = Math.random();
          let px = girderX;
          let pz = girderZ;
          if (u < 0.35) {
            pz = girderZ + (Math.random() - 0.5) * 0.15;
          } else if (u < 0.68) {
            px = girderX - 0.08;
            pz = girderZ + (Math.random() - 0.5) * 0.25;
          } else {
            px = girderX + 0.08;
            pz = girderZ + (Math.random() - 0.5) * 0.25;
          }
          setPoint(i, px, py, pz, '#7c2d12');
        } else if (pct < 0.85) {
          const isPipeA = Math.random() > 0.5;
          const px = (Math.random() - 0.5) * 2.6;
          const py = isPipeA ? 0.75 : 0.55;
          const pz = isPipeA ? -0.3 : 0.3;
          setPoint(i, px, py, pz, isPipeA ? '#ca8a04' : '#0891b2');
        } else {
          const px = (Math.random() - 0.5) * 2.6;
          const py = -1.2 + Math.random() * 2.6;
          const pz = (Math.random() - 0.5) * 1.8;
          setPoint(i, px, py, pz, '#8b5cf6');
        }
      }
    } else {
      for (let i = 0; i < count; i++) {
        const pct = i / count;
        if (pct < 0.75) {
          const isStrandB = Math.random() > 0.5;
          const theta = (i / (count * 0.75)) * Math.PI * 14;
          const height = -1.1 + (i / (count * 0.75)) * 2.3;
          const angle = theta + (isStrandB ? Math.PI : 0);
          const r = 0.55;
          const px = r * Math.cos(angle);
          const pz = r * Math.sin(angle);
          setPoint(i, px, height, pz, isStrandB ? '#06b6d4' : '#8b5cf6');
        } else {
          const step = Math.floor(Math.random() * 50);
          const theta = (step / 50) * Math.PI * 14;
          const height = -1.1 + (step / 50) * 2.3;
          const t = Math.random();
          const r = 0.55 * (2 * t - 1);
          const px = r * Math.cos(theta);
          const pz = r * Math.sin(theta);
          setPoint(i, px, height, pz, '#ec4899');
        }
      }
    }

    return [p, c];
  }, [id]);

  // Determine final geometry buffers
  const [positions, colors] = useMemo(() => {
    if (loadedData) {
      return [loadedData.positions, loadedData.colors];
    }
    return [proceduralPositions, proceduralColors];
  }, [loadedData, proceduralPositions, proceduralColors]);

  useFrame((state, delta) => {
    if (points.current && autoRotate) {
      points.current.rotation.y += delta * 0.22;
      points.current.rotation.x += delta * 0.06;
    }
  });

  return (
    <group>
      <Points key={positions.length} ref={points} positions={positions} colors={colors} stride={3}>
        <PointMaterial
          transparent
          vertexColors
          size={0.012}
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Sync state data from mapping
  const sceneData = useMemo(() => {
    if (id && SCENE_INFO[id]) return SCENE_INFO[id];
    return {
      title: 'Holographic Scan Result',
      desc: 'Volumetric reconstruction of the captured video stream. Dynamic splat coordinates generated from frame depth keyframes.',
      coords: '37.4275° N, 122.1697° W',
      size: '5.0 MB',
      device: 'CUDA Pipeline B'
    };
  }, [id]);

  const [title, setTitle] = useState(sceneData.title);
  const [desc, setDesc] = useState(sceneData.desc);

  useEffect(() => {
    setTitle(sceneData.title);
    setDesc(sceneData.desc);
  }, [sceneData]);

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
            <ScannedObject id={id} autoRotate={autoRotate} />
            
            {/* Holographic grid alignment base */}
            {/* @ts-ignore */}
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
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-xs leading-relaxed text-white focus:outline-none focus:border-cyber-purple/55 resize-none h-28 placeholder:text-white/20 transition-all font-sans"
                />
              </div>

              {/* Spatial Coordinates */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-semibold text-white/40 uppercase tracking-widest">Spatial Reference</label>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-cyber-cyan/25 transition-all text-xs text-white/70 group cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-white/30 group-hover:text-cyber-cyan transition-colors" />
                    <span className="font-mono">{sceneData.coords}</span>
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
                  <span className="text-white/80">{sceneData.size}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>Gaussian Splat Kernels</span>
                  <span className="text-white/80">40,000 pts</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>Processed On</span>
                  <span className="text-white/80">{sceneData.device}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
