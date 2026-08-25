import React, { useState, useRef } from 'react';
import { ProductAnalysisResult, GeneratedScriptResult } from '../types';
import { fetchWithApiKey } from '../services/api';
import { 
  Video, 
  Upload, 
  Check, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Copy, 
  Sparkles, 
  ShieldCheck,
  Wand2,
  Image as ImageIcon,
  CheckCircle2,
  Play,
  FileText,
  Clapperboard,
  Music
} from 'lucide-react';

export const VideoEngineTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisResult | null>(null);

  // Video Configs
  const [videoConcept, setVideoConcept] = useState('Problem Solution');
  const [platform, setPlatform] = useState('TikTok');
  const [targetAudience, setTargetAudience] = useState('Gen Z & Milenial');
  const [duration, setDuration] = useState('30 Detik');
  const [language, setLanguage] = useState('Bahasa Indonesia Casual');

  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptResult, setScriptResult] = useState<GeneratedScriptResult | null>(null);

  // Scene-by-Scene AI Image Generation state map
  const [generatingScenes, setGeneratingScenes] = useState<{ [key: number]: boolean }>({});
  const [sceneImages, setSceneImages] = useState<{ [key: number]: string }>({});

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const CONCEPTS = [
    { label: 'Problem Solution', desc: 'Diawali dengan masalah relatable audiens lalu hadirkan produk sebagai solusi instan.' },
    { label: 'Soft Selling / Lifestyle', desc: 'Menampilkan penggunaan produk secara estetik & natural dalam kehidupan sehari-hari.' },
    { label: 'Hard Selling / Promo', desc: 'Fokus langsung pada diskon, penawaran terbatas, dan promo racun belanja.' },
    { label: 'Unboxing & First Impression', desc: 'Membuka kemasan, memperlihatkan detail produk, dan impresi pertama yang jujur.' },
    { label: 'Feature Highlight', desc: 'Menyoroti 3 fitur atau keunggulan teratas produk secara mendalam.' },
    { label: 'UGC Style (User Generated Content)', desc: 'Gaya video ala konten jujur pembeli dengan gaya bahasa santai khas sosmed.' }
  ];

  const PLATFORMS = ['TikTok', 'Shopee Video', 'Instagram Reels', 'YouTube Shorts'];
  const AUDIENCES = ['Gen Z & Milenial', 'Ibu-ibu / Housewife', 'Working Professional', 'Semua Umur'];
  const DURATIONS = ['15 Detik (3 Scene)', '30 Detik (5 Scene)', '60 Detik (8 Scene)'];

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon unggah file gambar valid (JPG/PNG/WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const runProductAnalysis = async () => {
    setStep(2);
    setIsAnalyzing(true);
    try {
      if (image) {
        const res = await fetchWithApiKey('/api/analyze-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: image })
        });
        const data = await res.json();
        if (data.analysis) {
          setAnalysisResult(data.analysis);
        } else {
          setAnalysisResult(data.fallbackAnalysis);
        }
      }
    } catch {
      setAnalysisResult({
        productType: "Identifikasi Spesifik Produk",
        shapeAndSilhouette: "Bentuk & Siluet Asli",
        colors: "Warna Utama & Sekunder",
        material: "Material Terdeteksi",
        texture: "Tekstur Permukaan",
        patternAndGraphics: "Elemen Grafis Visible",
        logoAndBranding: "Logo & Penanda Merek",
        productDetails: "Detail Komponen Produk",
        distinctiveFeatures: "Fitur Khas Utama",
        visibleStructure: "Struktur Terlihat",
        summaryText: "Identitas visual produk berhasil dikunci secara konsisten."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateScript = async () => {
    setStep(4);
    setIsGeneratingScript(true);
    setScriptResult(null);

    try {
      const res = await fetchWithApiKey('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productAnalysis: analysisResult,
          concept: videoConcept,
          platform,
          targetAudience,
          duration,
          language
        })
      });
      const data = await res.json();
      if (data.script || data.scriptResult) {
        const raw = data.script || data.scriptResult;
        
        let scenesArray = [];
        if (Array.isArray(raw.scenes) && raw.scenes.length > 0) {
          scenesArray = raw.scenes;
        } else if (Array.isArray(raw.scriptSections) && raw.scriptSections.length > 0) {
          scenesArray = raw.scriptSections.map((sec: any, idx: number) => ({
            sceneNumber: idx + 1,
            timeRange: sec.timestamp || `Scene ${idx + 1}`,
            visualDescription: sec.visualDirection || 'Visual Scene',
            voiceoverText: sec.narrationText || '',
            onScreenText: sec.narrationText ? (sec.narrationText.slice(0, 35) + '...') : '',
            visualPrompt: sec.visualDirection || sec.narrationText || 'Product presentation',
          }));
        }

        setScriptResult({
          title: raw.title || 'Script Video Affiliate',
          durationSeconds: raw.durationSeconds || 30,
          hookText: raw.hookText || raw.hook || 'Rekomendasi Produk Affiliate Terbaik!',
          hook: raw.hook || raw.hookText || 'Rekomendasi Produk Affiliate Terbaik!',
          cta: raw.cta || 'Klik keranjang kuning sekarang sebelum kehabisan!',
          recommendedMusic: raw.recommendedMusic || 'Trending TikTok Audio / Upbeat Energy',
          scenes: scenesArray,
          fullNarration: raw.fullNarration || ''
        });
      }
    } catch {
      alert('Gagal menghasilkan script affiliate.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateSceneImage = async (sceneIndex: number, visualPrompt: string) => {
    setGeneratingScenes(prev => ({ ...prev, [sceneIndex]: true }));
    try {
      const res = await fetchWithApiKey('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `AFFILIATE VIDEO FRAME SCENE. ${visualPrompt}. Product Identity: ${analysisResult?.productType || 'Product'}, Colors: ${analysisResult?.colors || 'original colors'}, Photorealistic 8k, sharp focus, cinematic lighting.`,
          referenceImageBase64: image,
          aspectRatio: '9:16'
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setSceneImages(prev => ({ ...prev, [sceneIndex]: data.imageUrl }));
      } else {
        alert(data.error || 'Gagal generate gambar scene.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setGeneratingScenes(prev => ({ ...prev, [sceneIndex]: false }));
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReset = () => {
    setImage(null);
    setFileName('');
    setStep(1);
    setAnalysisResult(null);
    setScriptResult(null);
    setSceneImages({});
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 font-mono">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#141414] pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold border border-[#141414]">
              <Video className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-[#141414] tracking-tight uppercase">
              AI AFFILIATE VIDEO ENGINE
            </h1>
          </div>
          <p className="text-xs text-[#141414]/70 mt-1 font-sans">
            Generate narasi voiceover, teks di layar, dan visual prompt scene-by-scene untuk video affiliate berkonversi tinggi.
          </p>
        </div>

        <button 
          onClick={handleReset}
          className="px-3.5 py-1.5 text-xs font-bold text-[#141414] bg-white hover:bg-[#F2F2F0] border border-[#141414] transition-colors flex items-center gap-1.5 self-start sm:self-auto uppercase"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* STEP 01: UPLOAD PRODUK */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              01
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Upload Foto Produk Video</h2>
          </div>

          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#141414] p-10 text-center cursor-pointer bg-[#F2F2F0] hover:bg-white transition-all flex flex-col items-center justify-center min-h-[240px] group"
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} 
              />
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-3 border border-[#141414] group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#141414]">Klik atau Tarik Foto Produk ke Sini</h3>
              <p className="text-[11px] text-[#141414]/70 mt-1 font-sans">Mendukung format JPG, PNG, atau WEBP (Max 10MB)</p>
              <button className="mt-5 px-5 py-2 bg-black text-white font-bold text-xs hover:bg-black/80 transition-colors uppercase tracking-wider border border-[#141414]">
                Pilih dari Perangkat
              </button>
            </div>
          ) : (
            <div className="bg-[#F2F2F0] p-6 border border-[#141414] flex flex-col sm:flex-row items-center gap-6">
              <div className="w-40 h-40 bg-white border border-[#141414] overflow-hidden shrink-0 flex items-center justify-center p-2">
                <img src={image} alt="Product Preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#141414] text-[#141414] text-xs font-bold">
                  <ImageIcon className="w-3.5 h-3.5 text-black" /> {fileName}
                </span>
                <p className="text-xs font-bold text-green-700 flex items-center justify-center sm:justify-start gap-1.5 uppercase">
                  <CheckCircle2 className="w-4 h-4" /> Produk Siap Diolah Menjadi Konsep Video AI
                </p>
                <div className="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
                  <button 
                    onClick={() => setImage(null)}
                    className="px-4 py-2 text-xs font-bold border border-[#141414] bg-white text-[#141414] hover:bg-[#E4E3E0] uppercase"
                  >
                    Ganti Foto
                  </button>
                  <button 
                    onClick={runProductAnalysis}
                    className="px-5 py-2 text-xs font-bold border border-[#141414] bg-black text-white hover:bg-black/80 uppercase tracking-wider flex items-center gap-2"
                  >
                    Analisis Produk AI <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 02: ANALISIS PRODUK AI */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              02
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Analisis Keunggulan Visual Produk</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            {isAnalyzing ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 py-6">
                <div className="w-36 h-36 bg-white border border-[#141414] overflow-hidden relative shrink-0 p-2">
                  <img src={image!} alt="Analyzing" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/10">
                    <div className="w-full h-1 bg-black animate-bounce mt-8"></div>
                  </div>
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <span className="text-xs font-bold text-black uppercase tracking-wider animate-pulse">
                    [ANALYZING] Mengidentifikasi Selling Point Produk...
                  </span>
                  <h3 className="text-xs font-bold uppercase text-[#141414]">Mengekstrak Problem, Solution, & Selling Angle</h3>
                  <p className="text-xs text-[#141414]/70 font-sans">
                    Sistem sedang membaca karakteristik visual produk untuk merancang skenario narasi affiliate yang paling menarik.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-32 h-32 bg-white border-2 border-[#141414] overflow-hidden shrink-0 relative p-2">
                    <img src={image!} alt="Locked Product" className="w-full h-full object-contain" />
                    <div className="absolute top-1 right-1 w-6 h-6 bg-black text-white flex items-center justify-center">
                      <Lock className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center justify-between border-b border-[#141414] pb-2">
                      <h3 className="font-bold text-xs uppercase text-[#141414]">PRODUCT IDENTITY & SELLING LOCK</h3>
                      <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 border border-[#141414]">
                        <ShieldCheck className="w-3 h-3 text-green-400" /> Terkunci
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {[
                        { label: 'Kategori Produk', val: analysisResult?.productType },
                        { label: 'Visual Character', val: analysisResult?.shapeAndSilhouette },
                        { label: 'Color Palette', val: analysisResult?.colors },
                        { label: 'Material & Texture', val: analysisResult?.material },
                        { label: 'Branding / Logo', val: analysisResult?.logoAndBranding },
                        { label: 'Key Feature', val: analysisResult?.productDetails },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white px-3 py-1.5 border border-[#141414] flex items-center justify-between">
                          <div className="truncate pr-2">
                            <span className="block text-[9px] font-bold text-black uppercase">{item.label}</span>
                            <span className="text-xs font-bold text-[#141414] truncate">{item.val || 'Terdeteksi'}</span>
                          </div>
                          <Lock className="w-3 h-3 text-black/40 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[#141414]/20">
                  <button 
                    onClick={() => setStep(3)}
                    className="px-5 py-2 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-2"
                  >
                    Lanjutkan ke Konsep & Platform Video <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 03: PENGATURAN KONSEP & PLATFORM */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              03
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Pengaturan Konsep & Platform Video</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            
            {/* Konsep Video */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">1. Konsep / Angle Video *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {CONCEPTS.map(c => {
                  const isSel = videoConcept === c.label;
                  return (
                    <div 
                      key={c.label}
                      onClick={() => setVideoConcept(c.label)}
                      className={`p-3 border cursor-pointer transition-colors ${
                        isSel ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold uppercase">{c.label}</h4>
                        {isSel && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </div>
                      <p className={`text-[11px] leading-snug font-sans ${isSel ? 'text-gray-300' : 'text-black/70'}`}>{c.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target Platform & Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">2. Platform Video *</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`py-2 px-3 border text-xs font-bold text-left transition-colors ${
                        platform === p ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">3. Target Audience *</label>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIENCES.map(a => (
                    <button
                      key={a}
                      onClick={() => setTargetAudience(a)}
                      className={`py-2 px-3 border text-xs font-bold text-left transition-colors ${
                        targetAudience === a ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">4. Durasi Video *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-2 px-3 border text-xs font-bold text-center transition-colors ${
                      duration === d ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#141414]/20">
              <button 
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-[#141414] bg-white text-[#141414] text-xs font-bold uppercase hover:bg-[#E4E3E0]"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Kembali
              </button>
              <button 
                onClick={handleGenerateScript}
                className="px-5 py-2 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-2"
              >
                GENERATE SCRIPT & VIDEO PROMPTS <Sparkles className="w-4 h-4 text-yellow-400" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 04: FULL SCRIPT & SCENE PROMPTS */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              04
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Hasil Script Affiliate & Master Video Prompts</h2>
          </div>

          {isGeneratingScript ? (
            <div className="bg-[#F2F2F0] border border-[#141414] p-10 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs font-bold uppercase text-[#141414]">Gemini AI Sedang Menyusun Script Affiliate & Scene Prompts...</p>
              <p className="text-[11px] text-black/70 font-sans">Menganalisis Hook 3 Detik Pertama, Narasi Voiceover, Teks Layar, dan Prompt Gambar Tiap Scene.</p>
            </div>
          ) : scriptResult ? (
            <div className="space-y-6">
              
              {/* Script Overview Card */}
              <div className="bg-[#141414] text-white p-5 sm:p-6 border border-[#141414] space-y-4 font-mono">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block">HOOK UTAMA (3 DETIK PERTAMA)</span>
                    <h3 className="text-sm font-bold text-white mt-1">"{scriptResult.hook || scriptResult.hookText || 'Rekomendasi Produk'}"</h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-white text-black text-[10px] font-bold px-2.5 py-0.5 uppercase border border-white">
                      {videoConcept}
                    </span>
                    <span className="bg-white text-black text-[10px] font-bold px-2.5 py-0.5 uppercase border border-white">
                      {platform}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-black p-3 border border-white/20">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">CTA (Call To Action)</span>
                    <p className="font-bold text-white mt-0.5">{scriptResult.cta || 'Beli Sekarang'}</p>
                  </div>
                  <div className="bg-black p-3 border border-white/20">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Rekomendasi Audio</span>
                    <p className="font-bold text-white mt-0.5 flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-yellow-400" /> {scriptResult.recommendedMusic || 'Trending BGM'}
                    </p>
                  </div>
                  <div className="bg-black p-3 border border-white/20">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Est. Durasi & Scene</span>
                    <p className="font-bold text-white mt-0.5">{duration} — {(scriptResult.scenes || []).length} Scenes</p>
                  </div>
                </div>
              </div>

              {/* Scene-by-Scene Breakdown */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-[#141414] flex items-center gap-2">
                  <Clapperboard className="w-4 h-4" /> Rincian Scene & Visual AI Generator Prompt
                </h3>

                {(scriptResult.scenes || []).map((sc, idx) => (
                  <div key={idx} className="bg-[#F2F2F0] border border-[#141414] p-5 space-y-4">
                    
                    {/* Scene Header */}
                    <div className="flex items-center justify-between border-b border-[#141414] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-black text-white font-bold flex items-center justify-center text-xs">
                          {sc.sceneNumber}
                        </span>
                        <h4 className="font-bold text-xs text-[#141414] uppercase tracking-wider">
                          Scene {sc.sceneNumber} ({sc.timeRange}) — {sc.visualDescription}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleCopyText(`[SCENE ${sc.sceneNumber}]\nVoiceover: ${sc.voiceoverText}\nOnscreen Text: ${sc.onScreenText}\nVisual Prompt: ${sc.visualPrompt}`, idx)}
                        className="px-2.5 py-1 bg-white text-black border border-[#141414] hover:bg-[#E4E3E0] text-[11px] font-bold transition-colors flex items-center gap-1 uppercase"
                      >
                        <Copy className="w-3 h-3" /> {copiedIndex === idx ? 'Copied ✓' : 'Copy Scene'}
                      </button>
                    </div>

                    {/* Script Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 border border-[#141414] space-y-1">
                        <span className="text-[10px] font-bold text-black uppercase flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Voiceover Narration (Bahasa Indonesia)
                        </span>
                        <p className="font-bold text-[#141414] leading-relaxed font-sans">{sc.voiceoverText}</p>
                      </div>

                      <div className="bg-white p-3 border border-[#141414] space-y-1">
                        <span className="text-[10px] font-bold text-black uppercase flex items-center gap-1">
                          <Play className="w-3 h-3" /> Teks di Layar (On-Screen Text)
                        </span>
                        <p className="font-bold text-[#141414] font-sans">{sc.onScreenText}</p>
                      </div>
                    </div>

                    {/* Visual Prompt & AI Render */}
                    <div className="bg-[#141414] text-white p-4 border border-[#141414] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Visual AI Image Generator Prompt
                        </span>
                        <button
                          onClick={() => handleGenerateSceneImage(idx, sc.visualPrompt)}
                          disabled={generatingScenes[idx]}
                          className="px-3 py-1 bg-white text-black hover:bg-gray-200 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 disabled:opacity-50 border border-white"
                        >
                          <Wand2 className="w-3 h-3" />
                          {generatingScenes[idx] ? 'Rendering...' : 'Generate Frame AI'}
                        </button>
                      </div>

                      <p className="font-mono text-xs text-gray-300 leading-relaxed bg-black p-3 border border-white/20">
                        {sc.visualPrompt}
                      </p>

                      {/* Scene AI Image Result */}
                      {sceneImages[idx] && (
                        <div className="pt-2 space-y-2">
                          <span className="text-[10px] font-bold text-green-400 flex items-center gap-1 uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5" /> AI Frame Preview Ready
                          </span>
                          <div className="w-full max-w-xs mx-auto aspect-[9/16] border border-white/20 bg-black">
                            <img src={sceneImages[idx]} alt={`Scene ${sc.sceneNumber}`} className="w-full h-full object-contain" />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ) : null}
        </div>
      )}

    </div>
  );
};
