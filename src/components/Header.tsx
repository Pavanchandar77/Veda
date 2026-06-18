import { ViewState } from '../App';
import { cn } from '../lib/utils';
import { Box } from 'lucide-react';

interface HeaderProps {
  currentView: ViewState;
  navigateTo: (view: ViewState) => void;
}

export default function Header({ currentView, navigateTo }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-white/[0.05] bg-obsidian/80 backdrop-blur-md">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => navigateTo('landing')}
      >
        <div className="w-8 h-8 rounded-lg bg-charcoal border border-white/10 flex items-center justify-center group-hover:border-electric/50 transition-colors">
          <Box className="w-4 h-4 text-electric" />
        </div>
        <span className="font-bold tracking-wide text-lg">VEDA</span>
      </div>
      
      <nav className="flex items-center gap-6">
        <button 
          onClick={() => navigateTo('gallery')}
          className={cn(
            "text-sm font-medium transition-colors hover:text-white",
            currentView === 'gallery' ? "text-white" : "text-white/60"
          )}
        >
          Gallery
        </button>
        <button 
          onClick={() => navigateTo('upload')}
          className="text-sm font-medium bg-white text-black px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Scan
        </button>
      </nav>
    </header>
  );
}
