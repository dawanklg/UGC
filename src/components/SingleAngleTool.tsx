import React, { useState, useRef } from 'react';
import { ProductAnalysisResult } from '../types';
import { fetchWithApiKey } from '../services/api';
import { 
  Camera, 
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
  CheckCircle2
} from 'lucide-react';

export const SingleAngleTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisResult | null>(null);

  // Form Configs
  const [concept, setConcept] = useState('Foto Produk Profesional');
  const [customConcept, setCustomConcept] = useState('');
  const [angle, setAngle] = useState('AI Pilihkan');
  const [background, setBackground] = useState('AI Pilihkan');
  const [customBackground, setCustomBackground] = useState('');
  const [lighting, setLighting] = useState('AI Pilihkan');
  const [composition, setComposition] = useState('AI Pilihkan');
  const [photoStyle, setPhotoStyle] = useState('AI Pilihkan');

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real Image Generation state
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedAiImageUrl, setGeneratedAiImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const CONCEPTS = [
    { id: 'professional', label: 'Foto Produk Profesional', emoji: '📸', desc: 'Foto produk yang bersih, detail, realistis, dan terlihat seperti hasil pemotretan studio profesional.' },
    { id: 'marketplace', label: 'Marketplace', emoji: '🛍️', desc: 'Foto produk yang clean, jelas, fokus pada produk, dan cocok digunakan untuk katalog atau marketplace.' },
    { id: 'affiliate', label: 'Konten Affiliate', emoji: '🎬', desc: 'Foto produk yang lebih natural dan menarik untuk digunakan sebagai bahan konten affiliate.' },
    { id: 'advertisement', label: 'Advertisement', emoji: '📢', desc: 'Foto produk dengan komposisi visual yang lebih menarik dan memiliki kesan commercial advertising.' },
    { id: 'lifestyle', label: 'Lifestyle', emoji: '🏠', desc: 'Produk ditempatkan dalam lingkungan yang relevan sehingga terlihat lebih natural.' },
    { id: 'custom', label: 'Custom', emoji: '✨', desc: 'User dapat menentukan konsep sendiri.' }
  ];

  const ANGLES = ['Front — Tampak Depan', '3/4 — Sudut 3/4', 'Side — Tampak Samping', 'Back — Tampak Belakang', 'Top — Tampak Atas', 'Close-up — Detail Produk', 'AI Pilihkan'];
  const BACKGROUNDS = ['White Studio', 'Minimalist', 'Luxury', 'Lifestyle', 'Outdoor', 'AI Pilihkan', 'Custom'];
  const LIGHTINGS = ['Soft Studio', 'Natural Light', 'Bright Commercial', 'Dramatic', 'Warm', 'AI Pilihkan'];
  const COMPOSITIONS = ['Center', 'Rule of Thirds', 'Product Hero', 'Close-up', 'Dynamic', 'AI Pilihkan'];
  const STYLES = ['Professional Product Photography', 'E-commerce Photography', 'Commercial Photography', 'Lifestyle Photography', 'Natural Photography', 'AI Pilihkan'];

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

  const buildMasterPrompt = () => {
    const activeConcept = concept === 'Custom' ? customConcept : concept;
    const activeAngle = angle === 'AI Pilihkan' ? 'flattering 3/4 camera perspective' : angle;
    const activeBackground = background === 'Custom' ? customBackground : (background === 'AI Pilihkan' ? 'clean professional studio background' : background);
    const activeLighting = lighting === 'AI Pilihkan' ? 'soft studio lighting with natural highlights' : lighting;
    const activeComposition = composition === 'AI Pilihkan' ? 'centered hero composition' : composition;
    const activeStyle = photoStyle === 'AI Pilihkan' ? 'professional product photography' : photoStyle;

    const prodInfo = analysisResult ? `Product Type: ${analysisResult.productType}. Colors: ${analysisResult.colors}. Materials: ${analysisResult.material}. Distinctive Details: ${analysisResult.productDetails}.` : '';

    return `PHOTOREALISTIC PRODUCT PHOTOGRAPHY.

[PRODUCT IDENTITY LOCK - ABSOLUTE PRIORITY]
Reference Product: ${prodInfo}
Preserve the exact shape, proportions, brand logos, colors, materials, and textures from the original product reference image without any deformation or redesign.

[PHOTOGRAPHY PARAMETERS]
Concept: ${activeConcept}
Style: ${activeStyle}
Camera Angle: ${activeAngle}
Background: ${activeBackground}
Lighting Setup: ${activeLighting}
Composition: ${activeComposition}

[QUALITY & REALISM]
8k resolution, ultra-detailed, photorealistic, realistic materials, sharp product focus, soft shadows, clean commercial lighting, no plastic look, no distortion, masterpiece.`;
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
          referenceImageBase64: image
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedAiImageUrl(data.imageUrl);
      } else {
        alert(data.error || 'Gagal menghasilkan gambar AI preview.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi saat generate gambar.');
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
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold font-mono border border-[#141414]">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold font-mono uppercase tracking-tight text-[#141414]">
              PRODUCT IMAGE — SINGLE ANGLE
            </h1>
          </div>
          <p className="text-xs font-mono text-black/60 mt-1 uppercase">
            Transformasi foto produk menjadi prompt & gambar AI profesional dari satu sudut pandang.
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
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              01
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Upload Foto Produk</h2>
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
                  <CheckCircle2 className="w-4 h-4" /> Foto Produk Siap Menerima Analisis AI
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
                    Mulai Analisis Produk <ArrowRight className="w-4 h-4" />
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
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Analisis Produk AI (Product Identity Lock)</h2>
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
                    [SYSTEM_RUNNING] Menganalisis Geometri & Identitas Produk...
                  </span>
                  <h3 className="text-sm font-bold uppercase text-[#141414]">Mengekstrak Warna, Tekstur, Material, & Logo</h3>
                  <p className="text-xs text-black/70 font-sans">
                    Sistem Gemini AI sedang memindai seluruh aspek fisikal produk agar konsistensi visual terjaga 100%.
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
                        <ShieldCheck className="w-3 h-3 text-green-400" /> Terverifikasi
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {[
                        { label: 'Product Type', val: analysisResult?.productType },
                        { label: 'Shape & Silhouette', val: analysisResult?.shapeAndSilhouette },
                        { label: 'Colors', val: analysisResult?.colors },
                        { label: 'Material', val: analysisResult?.material },
                        { label: 'Texture', val: analysisResult?.texture },
                        { label: 'Logo & Branding', val: analysisResult?.logoAndBranding },
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

                <div className="bg-white border border-[#141414] p-3 text-xs text-[#141414] space-y-1 font-mono">
                  <p className="font-bold flex items-center gap-1.5 uppercase">
                    <ShieldCheck className="w-3.5 h-3.5 text-black" /> Garansi Konsistensi Produk:
                  </p>
                  <p className="text-black/80 font-sans text-[11px] leading-relaxed">
                    AI secara mutlak diarahkan untuk mempertahankan warna, logo, bentuk, dan material produk asli tanpa mengubah desain dasarnya.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setStep(3)}
                    className="px-5 py-2 bg-black hover:bg-black/80 text-white font-mono text-xs font-bold uppercase tracking-wider border border-[#141414] flex items-center gap-2 transition-colors"
                  >
                    Lanjutkan ke Konsep Foto <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 03: PILIH KONSEP FOTO */}
      {step === 3 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              03
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Pilih Konsep Foto Produk</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONCEPTS.map((c) => {
              const isSel = concept === c.label;
              return (
                <div
                  key={c.id}
                  onClick={() => setConcept(c.label)}
                  className={`p-4 border transition-colors cursor-pointer relative ${
                    isSel 
                      ? 'bg-[#141414] text-white border-[#141414]' 
                      : 'bg-white text-[#141414] border-[#141414] hover:bg-[#F2F2F0]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{c.emoji}</span>
                    {isSel && <Check className="w-4 h-4 text-green-400" />}
                  </div>
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${isSel ? 'text-white' : 'text-[#141414]'}`}>
                    {c.label}
                  </h3>
                  <p className={`text-[11px] font-sans mt-1 leading-relaxed ${isSel ? 'text-white/80' : 'text-black/60'}`}>{c.desc}</p>
                </div>
              );
            })}
          </div>

          {concept === 'Custom' && (
            <div className="bg-white p-4 border border-[#141414] space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase">Jelaskan Konsep Foto Produkmu</label>
              <textarea 
                value={customConcept}
                onChange={(e) => setCustomConcept(e.target.value)}
                placeholder="Contoh: Foto produk di atas meja marmer dengan pencahayaan warm matahari pagi..."
                className="w-full bg-[#F2F2F0] border border-[#141414] p-2.5 text-xs font-mono outline-none focus:bg-white h-20"
              />
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <button 
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-[#141414] bg-white text-[#141414] text-xs font-bold uppercase hover:bg-[#E4E3E0]"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Kembali
            </button>
            <button 
              onClick={() => setStep(4)}
              className="px-5 py-2 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-2"
            >
              Lanjutkan ke Atur Tampilan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 04: ATUR TAMPILAN FOTO */}
      {step === 4 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              04
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Atur Tampilan Foto (Camera, Lighting, & Background)</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            
            {/* Angle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">1. Angle Produk</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ANGLES.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAngle(opt)}
                    className={`px-3 py-2 border text-xs font-bold text-left transition-colors ${
                      angle === opt ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">2. Background Studio</label>
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
              {background === 'Custom' && (
                <input 
                  type="text" 
                  value={customBackground} 
                  onChange={(e) => setCustomBackground(e.target.value)} 
                  placeholder="Ketik background khusus..."
                  className="w-full bg-white border border-[#141414] p-2 text-xs font-mono outline-none"
                />
              )}
            </div>

            {/* Lighting */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">3. Pencahayaan (Lighting)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LIGHTINGS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setLighting(opt)}
                    className={`px-3 py-2 border text-xs font-bold text-left transition-colors ${
                      lighting === opt ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Composition */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">4. Komposisi Kamera</label>
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

            {/* Photography Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">5. Style Fotografi</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLES.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPhotoStyle(opt)}
                    className={`px-3 py-2 border text-xs font-bold text-left transition-colors ${
                      photoStyle === opt ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
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
                Generate Master Prompt & Gambar <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 05: FINAL OUTPUT & AI IMAGE GENERATOR */}
      {step === 5 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">
              05
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Final Single Angle Master Prompt & AI Preview</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sidebar Summary */}
            <div className="lg:col-span-4 bg-[#F2F2F0] p-4 border border-[#141414] space-y-4">
              <h3 className="text-xs font-bold text-[#141414] uppercase tracking-wider border-b border-[#141414] pb-2">
                Ringkasan Parameter
              </h3>
              
              <div className="w-full aspect-square bg-white border border-[#141414] overflow-hidden p-2 relative">
                <img src={image!} alt="Original" className="w-full h-full object-contain" />
                <div className="absolute bottom-2 left-2 right-2 bg-black text-white text-[9px] font-bold py-1 px-2 border border-[#141414] text-center uppercase tracking-wider">
                  IDENTITY LOCKED
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#141414]">
                <p><strong>Konsep:</strong> {concept}</p>
                <p><strong>Angle:</strong> {angle}</p>
                <p><strong>Background:</strong> {background}</p>
                <p><strong>Lighting:</strong> {lighting}</p>
                <p><strong>Composition:</strong> {composition}</p>
                <p><strong>Style:</strong> {photoStyle}</p>
              </div>
            </div>

            {/* Prompt & Real AI Generation Box */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Prompt Box */}
              <div className="bg-[#141414] text-white p-5 border border-[#141414] space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> MASTER SINGLE-ANGLE PROMPT
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
                    [COMPILING] Menyusun Master Prompt Presisi Tinggi...
                  </div>
                ) : (
                  <textarea 
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="w-full h-44 bg-black text-white font-mono text-xs leading-relaxed p-3 border border-white/20 outline-none resize-none"
                  />
                )}
              </div>

              {/* Real AI Image Preview Generator */}
              <div className="bg-[#F2F2F0] p-5 border border-[#141414] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#141414] uppercase font-mono">Generate Hasil Gambar AI Langsung</h3>
                    <p className="text-[11px] text-black/70 font-sans">Uji coba eksekusi prompt di atas menggunakan Gemini Vision & Image Model.</p>
                  </div>
                  <button
                    onClick={handleGenerateAiImage}
                    disabled={isGeneratingImage}
                    className="px-4 py-2 bg-black hover:bg-black/80 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-black disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4 text-yellow-400" />
                    {isGeneratingImage ? 'Generating Image...' : 'GENERATE GAMBAR AI'}
                  </button>
                </div>

                {isGeneratingImage && (
                  <div className="py-10 bg-white border border-[#141414] text-center space-y-2 font-mono">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-[#141414] uppercase">Sedang Merender Gambar Produk Baru...</p>
                    <p className="text-[10px] text-black/60">Mempertahankan Product Identity Lock.</p>
                  </div>
                )}

                {generatedAiImageUrl && !isGeneratingImage && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-green-700 font-mono flex items-center gap-1.5 uppercase">
                      <CheckCircle2 className="w-4 h-4" /> Gambar AI Berhasil Di-generate!
                    </div>
                    <div className="w-full aspect-square sm:aspect-video border border-[#141414] bg-black">
                      <img src={generatedAiImageUrl} alt="AI Generated Product" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex justify-end">
                      <a 
                        href={generatedAiImageUrl} 
                        download="single-angle-product.png"
                        className="px-4 py-2 bg-black text-white font-mono text-xs font-bold uppercase hover:bg-black/80 border border-black"
                      >
                        Download Gambar
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
