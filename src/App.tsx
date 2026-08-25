import React, { useState, useEffect } from 'react';
import { ActiveTool } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SingleAngleTool } from './components/SingleAngleTool';
import { MultiAngleTool } from './components/MultiAngleTool';
import { HostCreatorTool } from './components/HostCreatorTool';
import { VideoEngineTool } from './components/VideoEngineTool';
import { ApiKeyModal } from './components/ApiKeyModal';
import { subscribeApiKeyError } from './services/api';

export default function App() {
  const [activeTool, setActiveTool] = useState<ActiveTool>('dashboard');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = subscribeApiKeyError((errorMsg) => {
      setApiKeyError(errorMsg || 'Terjadi masalah dengan API Key. Silakan masukkan API Key baru dan uji coba terlebih dahulu.');
      setIsApiKeyModalOpen(true);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans flex flex-col selection:bg-black selection:text-white">
      {/* Top Fixed Header Navigation */}
      <Navbar 
        activeTool={activeTool} 
        onNavigate={setActiveTool} 
        onOpenApiKeyModal={() => {
          setApiKeyError(undefined);
          setIsApiKeyModalOpen(true);
        }}
      />

      {/* Main Content View */}
      <main className="flex-1 pb-16">
        {activeTool === 'dashboard' && (
          <Dashboard onNavigate={setActiveTool} />
        )}
        {activeTool === 'single-angle' && (
          <SingleAngleTool />
        )}
        {activeTool === 'multi-angle' && (
          <MultiAngleTool />
        )}
        {activeTool === 'host-creator' && (
          <HostCreatorTool />
        )}
        {activeTool === 'video-engine' && (
          <VideoEngineTool />
        )}
      </main>

      {/* Global API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        errorMessage={apiKeyError}
      />

      {/* High Density Footer */}
      <footer className="border-t border-[#141414] bg-[#E4E3E0] py-3 text-[10px] font-mono text-[#141414] px-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 uppercase">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              SYSTEM_NORMAL
            </span>
            <span className="opacity-40">|</span>
            <span className="font-bold tracking-wider">TOOLS AFFILIATE UTAMA</span>
            <span className="opacity-50 hidden md:inline">— AI AFFILIATE CONTENT SUITE v2.4</span>
          </div>
          <div className="flex items-center gap-4 text-black/60">
            <span>NODE: ID-JKT-1</span>
            <span>GEMINI 3.7 / 3.1 ENGINE</span>
            <span>© {new Date().getFullYear()} KANG DAWANK</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
