import { motion } from 'motion/react';
import { BrainCircuit, Feather, Globe } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-center pt-20">
      <div className="absolute inset-0 z-0 opacity-50">
        {/* Glow overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric/20 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-4xl w-full px-6 flex flex-col items-center text-center">
        <motion.h1 
          className="text-6xl md:text-8xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/50 text-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Preserve Reality in 3D.
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-white mb-12 max-w-2xl font-light"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          Upload a video. Get a shareable, explorable 3D world instantly.
        </motion.p>
        
        <motion.button
          onClick={onStart}
          className="relative group px-8 py-4 rounded-full bg-indigo-500 hover:bg-indigo-400 transition-colors text-white font-medium text-lg overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Start Scanning
          </span>
        </motion.button>
        
        <motion.div 
          className="mt-24 flex items-center gap-8 opacity-40 grayscale"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <span className="text-sm font-mono tracking-widest uppercase">Powered By</span>
          <span className="font-bold">React</span>
          <span className="font-bold">WebGL</span>
          <span className="font-bold">Three.js</span>
          <span className="font-bold">Gaussian Splatting</span>
        </motion.div>
      </div>

      <div className="absolute bottom-12 w-full px-6 flex justify-center z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            { icon: BrainCircuit, title: "Neural Fidelity", desc: "Powered by Gaussian Splatting for photorealism." },
            { icon: Feather, title: "Light as Air", desc: "10MB files that load on mobile data." },
            { icon: Globe, title: "Web Native", desc: "No app install. Runs in any browser." },
          ].map((feature, i) => (
            <div key={i} className="bg-charcoal/50 backdrop-blur-xl border border-white/[0.05] p-6 rounded-2xl flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-electric" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-white/50 text-sm mt-1">{feature.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

