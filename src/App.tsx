/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import UploadFlow from './pages/UploadFlow';
import Viewer from './pages/Viewer';
import Gallery from './pages/Gallery';
import Header from './components/Header';

export type ViewState = 'landing' | 'upload' | 'viewer' | 'gallery';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const navigateTo = (view: ViewState, id?: string) => {
    setCurrentView(view);
    if (id) setActiveVideoId(id);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-black text-white flex flex-col">
      {currentView !== 'viewer' && <Header currentView={currentView} navigateTo={navigateTo} />}
      <main className="flex-1 relative">
        {currentView === 'landing' && <LandingPage onStart={() => navigateTo('upload')} />}
        {currentView === 'upload' && <UploadFlow onComplete={(id) => navigateTo('viewer', id)} />}
        {currentView === 'viewer' && <Viewer id={activeVideoId} onClose={() => navigateTo('gallery')} />}
        {currentView === 'gallery' && <Gallery onSelect={(id) => navigateTo('viewer', id)} />}
      </main>
    </div>
  );
}
