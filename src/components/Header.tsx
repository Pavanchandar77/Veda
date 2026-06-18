import { ViewState } from '../App';
import { cn } from '../lib/utils';
import { Box } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentView: ViewState;
  navigateTo: (view: ViewState) => void;
}

export default function Header({ currentView, navigateTo }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl px-6 py-3 flex items-center justify-between rounded-full border border-white/10 bg-charcoal/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => navigateTo('landing')}
      >
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 90 }}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyber-purple to-cyber-cyan p-[1px] flex items-center justify-center shadow-lg"
        >
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <Box className="w-4 h-4 text-cyber-cyan group-hover:text-cyber-pink transition-colors duration-300" />
          </div>
        </motion.div>
        <span className="font-display font-bold tracking-wider text-base bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent group-hover:from-cyber-cyan group-hover:to-cyber-pink transition-all duration-300">
          VEDA
        </span>
      </div>
      
      <nav className="flex items-center gap-6">
        <button 
          onClick={() => navigateTo('gallery')}
          className={cn(
            "relative text-sm font-medium transition-all duration-300 py-1",
            currentView === 'gallery' ? "text-white font-semibold" : "text-white/60 hover:text-white"
          )}
        >
          Gallery
          {currentView === 'gallery' && (
            <motion.div 
              layoutId="nav-underline" 
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full"
            />
          )}
        </button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateTo('upload')}
          className="glow-btn text-xs font-semibold uppercase tracking-wider bg-white text-black px-5 py-2 rounded-full cursor-pointer"
        >
          Scan
        </motion.button>
      </nav>
    </motion.header>
  );
}
