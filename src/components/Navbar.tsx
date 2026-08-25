import React from 'react';
import { ActiveTool } from '../types';
import { 
  Sparkles, 
  Camera, 
  Layers, 
  UserCheck, 
  Video, 
  LayoutGrid,
  Crown,
  Key
} from 'lucide-react';
import { getStoredApiKey } from '../services/api';

interface NavbarProps {
  activeTool: ActiveTool;
  onNavigate: (tool: ActiveTool) => void;
  onOpenApiKeyModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTool, onNavigate, onOpenApiKeyModal }) => {
  const customKey = getStoredApiKey();

  return (
    <header className="bg-[#E4E3E0] border-b border-[#141414] sticky top-0 z-50 shrink-0">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 bg-black rounded-none flex items-center justify-center text-white text-xs font-mono font-bold border border-[#141414]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg uppercase tracking-tighter text-[#141414] leading-none">
                TOOLS AFFILIATE <span className="underline decoration-1">UTAMA</span>
              </h1>
            </div>
            <p className="text-[9px] font-mono font-bold text-black/50 tracking-widest uppercase mt-0.5">
              BY KANG DAWANK
            </p>
          </div>
        </div>

        {/* High Density Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-none transition-colors flex items-center gap-1.5 border ${
              activeTool === 'dashboard'
                ? 'bg-[#141414] text-white border-[#141414]'
                : 'text-black/70 border-transparent hover:border-[#141414] hover:text-black hover:bg-black/5'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => onNavigate('single-angle')}
            className={`px-3 py-1.5 rounded-none transition-colors flex items-center gap-1.5 border ${
              activeTool === 'single-angle'
                ? 'bg-[#141414] text-white border-[#141414]'
                : 'text-black/70 border-transparent hover:border-[#141414] hover:text-black hover:bg-black/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Single Angle
          </button>

          <button
            onClick={() => onNavigate('multi-angle')}
            className={`px-3 py-1.5 rounded-none transition-colors flex items-center gap-1.5 border ${
              activeTool === 'multi-angle'
                ? 'bg-[#141414] text-white border-[#141414]'
                : 'text-black/70 border-transparent hover:border-[#141414] hover:text-black hover:bg-black/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Multi Angle
          </button>

          <button
            onClick={() => onNavigate('host-creator')}
            className={`px-3 py-1.5 rounded-none transition-colors flex items-center gap-1.5 border ${
              activeTool === 'host-creator'
                ? 'bg-[#141414] text-white border-[#141414]'
                : 'text-black/70 border-transparent hover:border-[#141414] hover:text-black hover:bg-black/5'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Host Creator
          </button>

          <button
            onClick={() => onNavigate('video-engine')}
            className={`px-3 py-1.5 rounded-none transition-colors flex items-center gap-1.5 border ${
              activeTool === 'video-engine'
                ? 'bg-[#141414] text-white border-[#141414]'
                : 'text-black/70 border-transparent hover:border-[#141414] hover:text-black hover:bg-black/5'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Video Engine
          </button>
        </nav>

        {/* Access Badge & API Key Control */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={onOpenApiKeyModal}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#141414] transition-colors ${
              customKey
                ? 'bg-green-700 text-white hover:bg-green-800'
                : 'bg-white text-[#141414] hover:bg-[#D1D1CF]'
            }`}
            title="Kelola & Uji Coba Gemini API Key"
          >
            <Key className="w-3 h-3 text-yellow-400" />
            <span>{customKey ? 'API KEY: CUSTOM' : 'API KEY: SETTINGS'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#141414] text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border border-[#141414]">
            <Crown className="w-3 h-3 text-yellow-400" />
            <span>PREMIUM_LEVEL: E-7</span>
          </div>
        </div>

      </div>

      {/* Mobile Subnav bar */}
      <div className="lg:hidden flex overflow-x-auto gap-1 px-3 py-1.5 bg-[#D1D1CF] border-t border-[#141414] text-[10px] font-mono uppercase no-scrollbar">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`shrink-0 px-2.5 py-1 font-bold ${
            activeTool === 'dashboard' ? 'bg-black text-white' : 'bg-white text-black border border-[#141414]'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('single-angle')}
          className={`shrink-0 px-2.5 py-1 font-bold ${
            activeTool === 'single-angle' ? 'bg-black text-white' : 'bg-white text-black border border-[#141414]'
          }`}
        >
          Single Angle
        </button>
        <button
          onClick={() => onNavigate('multi-angle')}
          className={`shrink-0 px-2.5 py-1 font-bold ${
            activeTool === 'multi-angle' ? 'bg-black text-white' : 'bg-white text-black border border-[#141414]'
          }`}
        >
          Multi Angle
        </button>
        <button
          onClick={() => onNavigate('host-creator')}
          className={`shrink-0 px-2.5 py-1 font-bold ${
            activeTool === 'host-creator' ? 'bg-black text-white' : 'bg-white text-black border border-[#141414]'
          }`}
        >
          Host Creator
        </button>
        <button
          onClick={() => onNavigate('video-engine')}
          className={`shrink-0 px-2.5 py-1 font-bold ${
            activeTool === 'video-engine' ? 'bg-black text-white' : 'bg-white text-black border border-[#141414]'
          }`}
        >
          Video Engine
        </button>
      </div>
    </header>
  );
};
