import React, { useState, useRef } from 'react';
import { ProductAnalysisResult } from '../types';
import { fetchWithApiKey } from '../services/api';
import { 
  Layers, 
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
  Grid
} from 'lucide-react';

export const MultiAngleTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisResult | null>(null);

  // Multi Angle Configs
  const [angleCount, setAngleCount] = useState('4 Angle');
  const [selectedAngles, setSelectedAngles] = useState<string[]>([
    'Front View — Tampak Depan', 
    '3/4 Front — Tampak 3/4 Depan', 
    'Side View — Tampak Samping', 
    'Rear View — Tampak Belakang'
  ]);
  const [composition, setComposition] = useState('AI Pilihkan');
  const [background, setBackground] = useState('White Studio');
  const [spacing, setSpacing] = useState('Balanced');

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real Image Generation state
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedAiImageUrl, setGeneratedAiImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ANGLE_COUNTS = ['2 Angle', '3 Angle', '4 Angle', '5 Angle', 'AI Pilihkan'];
  const AVAILABLE_ANGLES = [
    'Front View — Tampak Depan', 
    '3/4 Front — Tampak 3/4 Depan', 
    'Side View — Tampak Samping', 
    '3/4 Rear — Tampak 3/4 Belakang', 
    'Rear View — Tampak Belakang', 
    'Top View — Tampak Atas', 
    'Bottom View — Tampak Bawah', 
    'Detail View — Tampilan Detail', 
    'AI Pilihkan'
  ];
  
  const COMPOSITIONS = ['Grid', '2×2', 'Horizontal', 'Vertical', 'AI Pilihkan'];
  const BACKGROUNDS = ['White Studio', 'Light Gray', 'Minimal Studio', 'Clean Product Sheet', 'AI Pilihkan'];
  const SPACINGS = ['Compact', 'Balanced', 'Spacious', 'AI Pilihkan'];

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

  const toggleAngle = (ang: string) => {
    if (ang === 'AI Pilihkan') {
      setSelectedAngles(['AI Pilihkan']);
      return;
    }
    let newSel = selectedAngles.filter(a => a !== 'AI Pilihkan');
    if (newSel.includes(ang)) {
      newSel = newSel.filter(a => a !== ang);
    } else {
      const maxCount = angleCount === 'AI Pilihkan' ? 5 : parseInt(angleCount.split(' ')[0]);
      if (newSel.length < maxCount) {
        newSel.push(ang);
      } else {
        newSel.shift();
        newSel.push(ang);
      }
    }
    setSelectedAngles(newSel);
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

  const buildMasterPrompt = () => {
    const count = angleCount === 'AI Pilihkan' ? 'multiple (3 to 4)' : angleCount.split(' ')[0];
    const anglesList = selectedAngles.includes('AI Pilihkan') 
      ? '1. Front View\n2. 3/4 Front View\n3. Side View\n4. Rear View' 
      : selectedAngles.map((a, i) => `${i + 1}. ${a.split(' — ')[0]}`).join('\n');

    let layoutDesc = composition === 'AI Pilihkan' ? 'neat grid layout' : composition;
    let bgDesc = background === 'AI Pilihkan' ? 'clean white studio background' : background;
    let spacingDesc = spacing === 'AI Pilihkan' ? 'balanced spacing' : spacing.toLowerCase();

    return `[CORE INSTRUCTION]
Generate ONE SINGLE COMPOSITE IMAGE containing multiple views of the EXACT SAME PRODUCT shown in the reference image.
DO NOT generate separate images. DO NOT create different product variations or a collage of unrelated products.

[PRODUCT IDENTITY LOCK - ABSOLUTE PRIORITY]
Product Type: ${analysisResult?.productType || 'Reference Product'}.
Colors: ${analysisResult?.colors || 'Exact reference colors'}.
Material: ${analysisResult?.material || 'Exact reference material'}.
The core identity, exact shape, colors, materials, patterns, logos, and details must be perfectly preserved across all views.
DO NOT redesign the product. DO NOT change colors or materials.

[MULTI-ANGLE CONFIGURATION]
Create a single multi-view product sheet showing the exact same product from ${count} distinct viewpoints:
${anglesList}

[COMPOSITION & LAYOUT]
Layout: Arrange views in a ${layoutDesc}.
Background: ${bgDesc}.
Spacing: ${spacingDesc} spacing between views with clean alignment and no overlapping.

[PHOTOREALISM & QUALITY]
Photorealistic product photography, realistic materials, accurate textures, natural shadows, realistic lighting, sharp focus, professional commercial photography, 8k resolution.`;
  };

  const handleGenerateFinal = () => {
    setStep(5);
    setIsGeneratingPrompt(true);
    setTimeout(() => {
      setGeneratedPrompt(buildMasterPrompt());
      setIsGeneratingPrompt(false);
    }, 1000);
  };

  const handleGenerateAiImage = async () => {
    setIsGeneratingImage(true);
    setGeneratedAiImageUrl(null);
    try {
      const res = await fetchWithApiKey('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: generatedPrompt,
          referenceImageBase64: image,
          aspectRatio: '16:9'
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedAiImageUrl(data.imageUrl);
      } else {
        alert(data.error || 'Gagal menghasilkan gambar AI composite.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi saat generate gambar multi-angle.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setImage(null);
    setFileName('');
    setStep(1);
    setAnalysisResult(null);
    setGeneratedAiImageUrl(null);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold font-mono border border-[#141414]">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold font-mono uppercase tracking-tight text-[#141414]">
              PRODUCT IMAGE — MULTI ANGLE
            </h1>
          </div>
          <p className="text-xs font-mono text-black/60 mt-1 uppercase">
            Ubah 1 foto produk menjadi gambar komposit multi-angle konsisten dalam 1 frame sheet.
          </p>
        </div>

        <button 
          onClick={handleReset}
          className="px-3 py-1.5 text-xs font-mono font-bold uppercase text-[#141414] bg-white hover:bg-[#D1D1CF] border border-[#141414] transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* STEP 01: UPLOAD PRODUK */}
      {step === 1 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              01
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Upload Foto Produk Reference</h2>
          </div>

          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#141414] p-10 text-center cursor-pointer bg-white hover:bg-[#F2F2F0] transition-colors flex flex-col items-center justify-center min-h-[240px] group"
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} 
              />
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-xl mb-3 border border-[#141414]">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-mono font-bold uppercase text-[#141414]">Klik atau Tarik Foto Produk ke Sini</h3>
              <p className="text-[11px] font-mono text-black/60 mt-1 uppercase">Mendukung format JPG, PNG, atau WEBP (Max 10MB)</p>
              <button className="mt-5 px-5 py-2 bg-black text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-black/80 transition-colors border border-[#141414]">
                Pilih dari Perangkat
              </button>
            </div>
          ) : (
            <div className="bg-[#F2F2F0] p-6 border border-[#141414] flex flex-col sm:flex-row items-center gap-6">
              <div className="w-40 h-40 bg-white border border-[#141414] overflow-hidden shrink-0 flex items-center justify-center p-2">
                <img src={image} alt="Product Preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 space-y-3 text-center sm:text-left font-mono">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-[#141414] text-xs border border-[#141414]">
                  <ImageIcon className="w-3.5 h-3.5 text-black" /> {fileName}
                </span>
                <p className="text-xs font-bold text-green-700 flex items-center justify-center sm:justify-start gap-1.5 uppercase">
                  <CheckCircle2 className="w-4 h-4" /> Foto Produk Siap Dikunci untuk Multi-Angle
                </p>
                <div className="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
                  <button 
                    onClick={() => setImage(null)}
                    className="px-4 py-2 text-xs font-bold uppercase border border-[#141414] bg-white text-[#141414] hover:bg-[#E4E3E0] transition-colors"
                  >
                    Ganti Foto
                  </button>
                  <button 
                    onClick={runProductAnalysis}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-black/80 transition-colors border border-[#141414] flex items-center gap-2"
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
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              02
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Analisis Produk AI & Lock Identity</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            {isAnalyzing ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
                <div className="w-36 h-36 bg-white border border-[#141414] overflow-hidden relative shrink-0 p-2">
                  <img src={image!} alt="Analyzing" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/10">
                    <div className="w-full h-1 bg-black animate-bounce mt-8"></div>
                  </div>
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1 font-mono">
                  <span className="text-xs font-bold text-black uppercase tracking-wider animate-pulse block">
                    [SYSTEM_RUNNING] Membuat Parameter Multi-Angle Lock...
                  </span>
                  <h3 className="text-sm font-bold uppercase text-[#141414]">Merekam Geometri & Struktur 3D Produk</h3>
                  <p className="text-xs text-black/70 font-sans">
                    Memastikan semua sudut pandang (depan, samping, belakang, detail) mempresentasikan produk yang persis sama.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-32 h-32 bg-white border border-[#141414] overflow-hidden shrink-0 relative p-2">
                    <img src={image!} alt="Locked Product" className="w-full h-full object-contain" />
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-black text-white flex items-center justify-center border border-[#141414]">
                      <Lock className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 font-mono">
                    <div className="flex items-center justify-between border-b border-[#141414] pb-2">
                      <h3 className="font-bold text-sm uppercase text-[#141414]">PRODUCT IDENTITY LOCK</h3>
                      <span className="bg-black text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 border border-[#141414]">
                        <ShieldCheck className="w-3 h-3 text-green-400" /> Terkunci
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {[
                        { label: 'Product Type', val: analysisResult?.productType },
                        { label: 'Silhouette', val: analysisResult?.shapeAndSilhouette },
                        { label: 'Color Lock', val: analysisResult?.colors },
                        { label: 'Material Lock', val: analysisResult?.material },
                        { label: 'Branding', val: analysisResult?.logoAndBranding },
                        { label: 'Key Details', val: analysisResult?.productDetails },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white px-3 py-1.5 border border-[#141414] flex items-center justify-between text-xs">
                          <div className="truncate pr-2">
                            <span className="block text-[9px] font-bold text-black/50 uppercase">{item.label}</span>
                            <span className="font-bold text-[#141414] truncate">{item.val || 'Terdeteksi'}</span>
                          </div>
                          <Lock className="w-3 h-3 text-black/40 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setStep(3)}
                    className="px-5 py-2 bg-black hover:bg-black/80 text-white font-mono text-xs font-bold uppercase tracking-wider border border-[#141414] flex items-center gap-2 transition-colors"
                  >
                    Lanjutkan ke Multi-Angle Setup <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 03: MULTI-ANGLE SETUP */}
      {step === 3 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              03
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Multi-Angle Setup</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            
            {/* 1. Jumlah Angle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">1. Jumlah Angle Tampilan</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ANGLE_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => {
                      setAngleCount(cnt);
                      if (cnt === 'AI Pilihkan') {
                        setSelectedAngles(['AI Pilihkan']);
                      }
                    }}
                    className={`px-3 py-2 border text-xs font-bold text-center transition-colors ${
                      angleCount === cnt ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pilih Sudut Produk */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">2. Pilih Sudut Pandang Spesifik</label>
                <span className="text-[10px] font-bold text-white bg-black px-2 py-0.5 border border-[#141414] uppercase">
                  Terpilih: {selectedAngles.includes('AI Pilihkan') ? 0 : selectedAngles.length} Angle
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {AVAILABLE_ANGLES.map((opt) => {
                  const isSel = selectedAngles.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleAngle(opt)}
                      className={`px-3 py-2 border text-xs font-bold text-left transition-colors flex items-center justify-between ${
                        isSel ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                      }`}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      <div className={`w-4 h-4 border flex items-center justify-center text-[10px] ${isSel ? 'bg-white text-black border-white' : 'border-[#141414]'}`}>
                        {isSel && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
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
                onClick={() => setStep(4)}
                disabled={selectedAngles.length === 0}
                className="px-5 py-2 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-2 disabled:opacity-50"
              >
                Lanjutkan ke Layout & Spacing <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 04: COMPOSITION & LAYOUT */}
      {step === 4 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              04
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Composition Setup (Layout, Background, & Spacing)</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            
            {/* Layout */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">1. Susunan Layout Multi-Angle</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMPOSITIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setComposition(opt)}
                    className={`px-3 py-2 border text-xs font-bold text-left transition-colors ${
                      composition === opt ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">2. Background Sheet</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BACKGROUNDS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setBackground(opt)}
                    className={`px-3 py-2 border text-xs font-bold text-left transition-colors ${
                      background === opt ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">3. Jarak Antar Tampilan (Spacing)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SPACINGS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSpacing(opt)}
                    className={`px-3 py-2 border text-xs font-bold text-left transition-colors ${
                      spacing === opt ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#141414]/20">
              <button 
                onClick={() => setStep(3)}
                className="px-4 py-2 border border-[#141414] bg-white text-[#141414] text-xs font-bold uppercase hover:bg-[#E4E3E0]"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Kembali
              </button>
              <button 
                onClick={handleGenerateFinal}
                className="px-5 py-2 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-2"
              >
                Generate Final Multi-Angle Prompt <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 05: FINAL OUTPUT & AI IMAGE COMPOSITE */}
      {step === 5 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              05
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Final Multi-Angle Prompt & Composite Image</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sidebar Config */}
            <div className="lg:col-span-4 bg-[#F2F2F0] p-4 border border-[#141414] space-y-4">
              <h3 className="text-xs font-bold text-[#141414] uppercase tracking-wider border-b border-[#141414] pb-2">
                Multi-Angle Summary
              </h3>

              <div className="w-full aspect-square bg-white border border-[#141414] overflow-hidden p-2 relative">
                <img src={image!} alt="Original" className="w-full h-full object-contain" />
              </div>

              <div className="space-y-1.5 text-xs text-[#141414]">
                <p><strong>Jumlah Angle:</strong> {angleCount}</p>
                <p><strong>Selected:</strong> {selectedAngles.join(', ')}</p>
                <p><strong>Layout:</strong> {composition}</p>
                <p><strong>Background:</strong> {background}</p>
                <p><strong>Spacing:</strong> {spacing}</p>
              </div>
            </div>

            {/* Prompt Box & Preview */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Prompt */}
              <div className="bg-[#141414] text-white p-5 border border-[#141414] space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Grid className="w-4 h-4" /> MASTER MULTI-ANGLE PROMPT
                  </span>
                  <button 
                    onClick={handleCopyPrompt}
                    className="px-3 py-1 bg-white text-black hover:bg-gray-200 text-xs font-bold transition-colors flex items-center gap-1.5 border border-white"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copied ? 'COPIED ✓' : 'COPY PROMPT'}
                  </button>
                </div>

                {isGeneratingPrompt ? (
                  <div className="py-10 text-center text-white/50 text-xs animate-pulse uppercase">
                    [COMPILING] Menyusun Multi-Angle Composite Prompt...
                  </div>
                ) : (
                  <textarea 
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="w-full h-44 bg-black text-white font-mono text-xs leading-relaxed p-3 border border-white/20 outline-none resize-none"
                  />
                )}
              </div>

              {/* Real AI Image Composite Generator */}
              <div className="bg-[#F2F2F0] p-5 border border-[#141414] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#141414] uppercase font-mono">Generate Composite Sheet AI</h3>
                    <p className="text-[11px] text-black/70 font-sans">Render gambar multi-angle sekaligus dalam 1 sheet komposit.</p>
                  </div>
                  <button
                    onClick={handleGenerateAiImage}
                    disabled={isGeneratingImage}
                    className="px-4 py-2 bg-black hover:bg-black/80 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-black disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4 text-yellow-400" />
                    {isGeneratingImage ? 'Rendering Multi-Angle...' : 'GENERATE MULTI-ANGLE AI'}
                  </button>
                </div>

                {isGeneratingImage && (
                  <div className="py-10 bg-white border border-[#141414] text-center space-y-2 font-mono">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-[#141414] uppercase">Sedang Merender Multi-Angle Composite Sheet...</p>
                    <p className="text-[10px] text-black/60">Menyinkronkan visual dari depan, samping, dan belakang.</p>
                  </div>
                )}

                {generatedAiImageUrl && !isGeneratingImage && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-green-700 font-mono flex items-center gap-1.5 uppercase">
                      <CheckCircle2 className="w-4 h-4" /> Multi-Angle Composite Sheet Berhasil Di-generate!
                    </div>
                    <div className="w-full aspect-video border border-[#141414] bg-black">
                      <img src={generatedAiImageUrl} alt="AI Multi Angle Sheet" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex justify-end">
                      <a 
                        href={generatedAiImageUrl} 
                        download="multi-angle-product-sheet.png"
                        className="px-4 py-2 bg-black text-white font-mono text-xs font-bold uppercase hover:bg-black/80 border border-black"
                      >
                        Download Sheet
                      </a>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
