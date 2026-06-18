import { motion } from 'motion/react';
import { Box, User, Clock } from 'lucide-react';

import kyotoGarden from '../../assets/kyoto_garden.png';
import porsche911 from '../../assets/porsche_911.png';
import workspaceSetup from '../../assets/workspace_setup.png';
import coffeeShop from '../../assets/coffee_shop.png';
import ceramicVase from '../../assets/ceramic_vase.png';
import abandonedFactory from '../../assets/abandoned_factory.png';

const MOCK_SCENES = [
  { id: '1', title: 'Kyoto Temple Garden', author: '@alex_w', time: '2h ago', image: kyotoGarden, tag: 'Gaussian Splat' },
  { id: '2', title: 'Vintage Porsche 911', author: '@car_guy', time: '5h ago', image: porsche911, tag: 'NeRF scan' },
  { id: '3', title: 'My Workspace Setup', author: '@dev_studio', time: '1d ago', image: workspaceSetup, tag: 'Holographic' },
  { id: '4', title: 'Coffee Shop Corner', author: '@sarah', time: '2d ago', image: coffeeShop, tag: 'Gaussian Splat' },
  { id: '5', title: 'Ceramic Vase Study', author: '@art_student', time: '3d ago', image: ceramicVase, tag: 'High-Fidelity' },
  { id: '6', title: 'Abandoned Factory', author: '@urban_exp', time: '4d ago', image: abandonedFactory, tag: 'Splat volume' },
];

interface GalleryProps {
  onSelect: (id: string) => void;
}

export default function Gallery({ onSelect }: GalleryProps) {
  return (
    <div className="w-full min-h-screen pt-28 px-6 md:px-12 pb-16 bg-obsidian relative overflow-hidden">
      
      {/* Background radial glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyber-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyber-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Title */}
        <div className="mb-12 border-l-2 border-cyber-cyan pl-6">
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2"
          >
            Explore Reality
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/50 text-sm md:text-base"
          >
            Discover and interact with high-fidelity 3D captures created by the community.
          </motion.p>
        </div>

        {/* Scene Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_SCENES.map((scene, i) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onSelect(scene.id)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer bg-charcoal border border-white/5 hover:border-cyber-cyan/30 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(6,182,212,0.15)] aspect-[4/3]"
            >
              {/* Scene Preview Image */}
              <div className="absolute inset-0 overflow-hidden">
                <img 
                  src={scene.image} 
                  alt={scene.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-[0.85]"
                />
              </div>

              {/* Holographic overlay */}
              <div className="absolute inset-0 noise-bg opacity-10 mix-blend-overlay pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

              {/* Floating Technology Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[10px] font-mono uppercase tracking-widest bg-black/60 backdrop-blur-md border border-white/10 text-cyber-cyan px-2.5 py-1 rounded-full">
                  {scene.tag}
                </span>
              </div>

              {/* Interactive Hover Box Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-black/55 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                  <Box className="w-5 h-5 text-cyber-cyan animate-[pulse_2s_infinite]" />
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-2">
                <h3 className="font-display font-bold text-lg text-white drop-shadow-md tracking-wide">
                  {scene.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-white/50 font-mono">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 opacity-60" />
                    <span>{scene.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    <span>{scene.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
