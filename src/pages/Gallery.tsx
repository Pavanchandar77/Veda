import { motion } from 'motion/react';
import { Box } from 'lucide-react';

const MOCK_SCENES = [
  { id: '1', title: 'Kyoto Temple Garden', author: '@alex_w', time: '2h ago', color: 'from-green-500/20 to-emerald-900/20' },
  { id: '2', title: 'Vintage Porsche 911', author: '@car_guy', time: '5h ago', color: 'from-orange-500/20 to-red-900/20' },
  { id: '3', title: 'My Workspace setup', author: '@dev_studio', time: '1d ago', color: 'from-indigo-500/20 to-blue-900/20' },
  { id: '4', title: 'Coffee Shop Corner', author: '@sarah', time: '2d ago', color: 'from-amber-500/20 to-orange-900/20' },
  { id: '5', title: 'Ceramic Vase Study', author: '@art_student', time: '3d ago', color: 'from-gray-400/20 to-gray-800/20' },
  { id: '6', title: 'Abandoned Factory', author: '@urban_exp', time: '4d ago', color: 'from-purple-500/20 to-slate-900/20' },
];

interface GalleryProps {
  onSelect: (id: string) => void;
}

export default function Gallery({ onSelect }: GalleryProps) {
  return (
    <div className="w-full min-h-screen pt-24 px-6 md:px-12 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Explore Reality</h2>
          <p className="text-white/50">Discover explorable environments captured by the community.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_SCENES.map((scene, i) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => onSelect(scene.id)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer bg-charcoal border border-white/[0.05] hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(99,102,241,0.15)] block aspect-[4/3]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${scene.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
              
              {/* Simulate 3D snapshot artifacting */}
              <div className="absolute inset-0 noise-bg opacity-20 mix-blend-overlay" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110">
                    <Box className="w-6 h-6 text-white/80" />
                 </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="font-semibold text-lg drop-shadow-md">{scene.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                  <span>{scene.author}</span>
                  <span>•</span>
                  <span>{scene.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
