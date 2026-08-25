import React from 'react';
import { ActiveTool } from '../types';
import { 
  Camera, 
  Layers, 
  Video, 
  UserCheck, 
  ArrowRight, 
  Check, 
  Flame,
  Rocket
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tool: ActiveTool) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* High Density Metric Matrix Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-[#141414] bg-[#E4E3E0] shrink-0">
        <div className="border-r border-b md:border-b-0 border-[#141414] p-3 flex flex-col justify-between h-20">
          <span className="font-serif italic text-[10px] opacity-60 uppercase">Active AI Tools</span>
          <span className="font-mono text-3xl leading-none tracking-tighter text-[#141414]">04</span>
        </div>
        <div className="border-b md:border-b-0 md:border-r border-[#141414] p-3 flex flex-col justify-between h-20">
          <span className="font-serif italic text-[10px] opacity-60 uppercase">Gemini Vision Engine</span>
          <span className="font-mono text-3xl leading-none tracking-tighter text-green-700">ONLINE</span>
        </div>
        <div className="border-r border-[#141414] p-3 flex flex-col justify-between h-20">
          <span className="font-serif italic text-[10px] opacity-60 uppercase">System Latency</span>
          <span className="font-mono text-3xl leading-none tracking-tighter text-[#141414]">14ms</span>
        </div>
        <div className="p-3 flex flex-col justify-between bg-[#141414] text-white h-20">
          <span className="font-serif italic text-[10px] opacity-60 uppercase">Workflow Engine</span>
          <span className="font-mono text-3xl leading-none tracking-tighter">E-7 MAX</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-2 border-b border-[#141414] pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#141414] text-white text-[10px] font-mono font-bold uppercase tracking-widest border border-[#141414]">
          <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
          SYSTEM_SELECT_WORKFLOW
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-[#141414] uppercase tracking-tighter font-mono">
          PILIH WORKFLOW AI AFFILIATE
        </h1>
        
        <p className="text-[#141414]/70 text-xs sm:text-sm font-mono max-w-2xl leading-relaxed">
          Pilih tools yang kamu butuhkan untuk membuat konten affiliate dari produk sampai siap diproses AI Image & Video Generator.
        </p>
      </div>

      {/* 4 Core Workflow Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: PRODUCT IMAGE — SINGLE ANGLE */}
        <div className="bg-[#F2F2F0] border border-[#141414] p-6 hover:bg-white transition-colors duration-150 flex flex-col justify-between relative group">
          <div className="absolute top-4 right-4">
            <span className="bg-[#141414] text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
              DETAIL_PRODUCT
            </span>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#141414] text-white flex items-center justify-center text-xl border border-[#141414]">
              <Camera className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-base font-bold font-mono text-[#141414] uppercase tracking-tight">
                PRODUCT IMAGE — SINGLE ANGLE
              </h2>
              <p className="text-[#141414]/80 text-xs font-sans mt-2 leading-relaxed">
                Ubah gambar produk biasa menjadi prompt AI untuk menghasilkan tampilan produk yang lebih rapi, realistis, dan profesional dari satu sudut.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-[#141414]/20 font-mono text-xs text-[#141414]">
              {[
                'Product photography studio style',
                'Detail dan material lebih jelas',
                'Tampilan profesional & tajam',
                'Siap digunakan di AI Image Generator'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('single-angle')}
              className="w-full py-2.5 px-4 bg-[#141414] text-white hover:bg-black/80 font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 border border-[#141414] transition-colors"
            >
              BUKA TOOLS
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 2: PRODUCT IMAGE — MULTI ANGLE */}
        <div className="bg-[#F2F2F0] border border-[#141414] p-6 hover:bg-white transition-colors duration-150 flex flex-col justify-between relative group">
          <div className="absolute top-4 right-4">
            <span className="bg-[#141414] text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
              MULTI_VIEW
            </span>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#141414] text-white flex items-center justify-center text-xl border border-[#141414]">
              <Layers className="w-6 h-6 text-green-400" />
            </div>

            <div>
              <h2 className="text-base font-bold font-mono text-[#141414] uppercase tracking-tight">
                PRODUCT IMAGE — MULTI ANGLE
              </h2>
              <p className="text-[#141414]/80 text-xs font-sans mt-2 leading-relaxed">
                Ubah satu gambar produk menjadi prompt AI untuk menghasilkan satu gambar dengan beberapa sudut produk secara konsisten.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-[#141414]/20 font-mono text-xs text-[#141414]">
              {[
                'Multi-angle product showcase',
                'Front / side / rear view grid',
                'Product identity consistency',
                'Cocok untuk katalog & konten affiliate'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('multi-angle')}
              className="w-full py-2.5 px-4 bg-[#141414] text-white hover:bg-black/80 font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 border border-[#141414] transition-colors"
            >
              BUKA TOOLS
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 3: AI AFFILIATE VIDEO ENGINE */}
        <div className="bg-[#F2F2F0] border border-[#141414] p-6 hover:bg-white transition-colors duration-150 flex flex-col justify-between relative group">
          <div className="absolute top-4 right-4">
            <span className="bg-[#141414] text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
              BIG_ENGINE
            </span>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#141414] text-white flex items-center justify-center text-xl border border-[#141414]">
              <Video className="w-6 h-6 text-purple-400" />
            </div>

            <div>
              <h2 className="text-base font-bold font-mono text-[#141414] uppercase tracking-tight">
                AI AFFILIATE VIDEO ENGINE
              </h2>
              <p className="text-[#141414]/80 text-xs font-sans mt-2 leading-relaxed">
                Buat konsep, script, dan prompt untuk video affiliate AI dengan workflow yang lebih lengkap dan siap digunakan di berbagai AI video generator.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-[#141414]/20 font-mono text-xs text-[#141414]">
              {[
                'Ide video kreatif terarah',
                'Script & narasi terstruktur',
                'Video prompt siap pakai',
                'AI video workflow lengkap'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('video-engine')}
              className="w-full py-2.5 px-4 bg-[#141414] text-white hover:bg-black/80 font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 border border-[#141414] transition-colors"
            >
              BUKA TOOLS
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 4: AI AFFILIATE HOST CREATOR */}
        <div className="bg-[#F2F2F0] border border-[#141414] p-6 hover:bg-white transition-colors duration-150 flex flex-col justify-between relative group">
          <div className="absolute top-4 right-4">
            <span className="bg-[#141414] text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
              AI_HOST
            </span>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#141414] text-white flex items-center justify-center text-xl border border-[#141414]">
              <UserCheck className="w-6 h-6 text-teal-400" />
            </div>

            <div>
              <h2 className="text-base font-bold font-mono text-[#141414] uppercase tracking-tight">
                AI AFFILIATE HOST CREATOR
              </h2>
              <p className="text-[#141414]/80 text-xs font-sans mt-2 leading-relaxed">
                Buat karakter host affiliate ultra-realistis dengan detail yang dapat disesuaikan, termasuk opsi menggunakan foto wajah sendiri sebagai referensi.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-[#141414]/20 font-mono text-xs text-[#141414]">
              {[
                'Buat karakter host AI konsisten',
                'Gunakan foto wajah sendiri / custom',
                'Full-body character master prompt',
                'Detail wajah, tubuh, outfit, dan pose'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('host-creator')}
              className="w-full py-2.5 px-4 bg-[#141414] text-white hover:bg-black/80 font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 border border-[#141414] transition-colors"
            >
              BUKA TOOLS
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* High Density Process Matrix */}
      <div className="bg-[#141414] text-white border border-[#141414] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/20 pb-4 gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider">
            <Rocket className="w-4 h-4 text-green-400" /> WORKFLOW SIKLUS AFFILIATE
          </div>
          <span className="font-mono text-[10px] text-white/50 uppercase">MATRIX_PROCEDURE: RUN_SEQUENTIAL</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-[#1E1E1E] border border-white/20 p-4 space-y-2 font-mono">
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest block">[01] INPUT</span>
            <h4 className="font-bold text-xs uppercase text-white">Upload Produk</h4>
            <p className="text-[11px] text-white/60 leading-relaxed font-sans">
              Siapkan foto mentah produk affiliate kamu.
            </p>
          </div>

          <div className="bg-[#1E1E1E] border border-white/20 p-4 space-y-2 font-mono">
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest block">[02] OPTIMIZE</span>
            <h4 className="font-bold text-xs uppercase text-white">Optimalkan Visual</h4>
            <p className="text-[11px] text-white/60 leading-relaxed font-sans">
              Gunakan tools image untuk hasil profesional.
            </p>
          </div>

          <div className="bg-[#1E1E1E] border border-white/20 p-4 space-y-2 font-mono">
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest block">[03] SCRIPT</span>
            <h4 className="font-bold text-xs uppercase text-white">Buat Script & Prompt</h4>
            <p className="text-[11px] text-white/60 leading-relaxed font-sans">
              Dapatkan ide narasi dan prompt video spesifik.
            </p>
          </div>

          <div className="bg-[#1E1E1E] border border-white/20 p-4 space-y-2 font-mono">
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest block">[04] EXECUTE</span>
            <h4 className="font-bold text-xs uppercase text-white">Generate Konten AI</h4>
            <p className="text-[11px] text-white/60 leading-relaxed font-sans">
              Eksekusi di platform AI andalanmu.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
