import React, { useState, useRef } from 'react';
import { HostCreatorConfig } from '../types';
import { fetchWithApiKey } from '../services/api';
import { 
  UserCheck, 
  Upload, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Copy, 
  Sparkles, 
  Wand2, 
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  Bot
} from 'lucide-react';

export const HostCreatorTool: React.FC = () => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<HostCreatorConfig>({
    mode: 'ai-face',
    gender: 'Pria',
    ageGroup: '25–30',
    height: 'Tinggi',
    bodyType: 'Slim',
    bodyProportion: 'Natural',
    skinTone: 'Medium',

    faceShape: 'Natural / AI Pilihan',
    eyeShape: 'Almond',
    eyeColor: 'AI Pilihan',
    noseShape: 'Natural',
    lipShape: 'Natural',
    jawline: 'Soft',
    eyebrows: 'Straight',
    hairColor: 'AI Pilihan',
    hairLength: 'Short',
    hairStyle: 'Natural',
    beardMustache: 'Clean Shaven',
    distinctiveFeature: ['Tidak ada'],

    clothingStyle: 'Smart Casual',
    topOutfit: 'T-Shirt',
    topColor: 'Blue',
    bottomOutfit: 'Jeans',
    bottomColor: 'Navy',
    shoes: 'Sneakers',
    shoesColor: 'White',
    accessories: ['Watch'],
    materialOption: 'Cotton',
    clothingFit: 'Regular Fit',
    extraOutfitDetails: '',

    mainPose: 'Berdiri santai',
    bodyPosition: 'Menghadap kamera',
    facialExpression: 'Friendly',
    handPosition: 'Rileks di samping tubuh',
    legPosition: 'Berdiri tegak',
    cameraAngle: 'Eye Level',
    framing: 'Full Body Centered',
    characterPosition: 'Center',

    visualStyle: 'Ultra Realistic',
    cameraStyle: 'Professional DSLR / Mirrorless Photography',
    lens: '50mm',
    depthOfField: 'Natural Depth of Field',
    lighting: 'Natural Professional Lighting',
    skinRealism: 'Natural Skin Texture + Realistic Skin Details',
    imageQuality: 'Ultra Detailed + Professional Photography',
    backgroundStyle: 'Clean Neutral Background',
    cameraDistance: 'Natural Full Body Distance',
    aspectRatio: '9:16'
  });

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Image preview state
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedAiImageUrl, setGeneratedAiImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateConfig = (key: keyof HostCreatorConfig, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleFaceUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateConfig('userFaceImage', e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const buildMasterHostPrompt = () => {
    const isUploadMode = config.mode === 'upload-face' && config.userFaceImage;

    const faceInstruction = isUploadMode 
      ? `[FACE IDENTITY LOCK] Use the exact facial features, skin tone, facial structure, eyes, and expressions from the reference image. Preserve 100% facial identity.` 
      : `[AI GENERATED FACE] ${config.gender}, age ${config.ageGroup}, skin tone ${config.skinTone}, face shape ${config.faceShape}, eye shape ${config.eyeShape}, eye color ${config.eyeColor}, nose ${config.noseShape}, lips ${config.lipShape}, jawline ${config.jawline}, hair ${config.hairLength} ${config.hairColor} in ${config.hairStyle} style, facial hair: ${config.beardMustache}.`;

    return `MASTER AI AFFILIATE HOST CREATOR PROMPT.

[CHARACTER OVERVIEW]
${faceInstruction}
Gender: ${config.gender}.
Body: Height ${config.height}, ${config.bodyType} body build, ${config.bodyProportion} proportion.

[OUTFIT & STYLING]
Style: ${config.clothingStyle}.
Top: ${config.topColor} ${config.topOutfit}.
Bottom: ${config.bottomColor} ${config.bottomOutfit}.
Footwear: ${config.shoesColor} ${config.shoes}.
Accessories: ${config.accessories.join(', ')}.
Fabric & Fit: ${config.materialOption}, ${config.clothingFit}. ${config.extraOutfitDetails ? `Additional: ${config.extraOutfitDetails}` : ''}

[POSE, EXPRESSION, & FRAMING]
Pose: ${config.mainPose}, body ${config.bodyPosition}.
Expression: ${config.facialExpression}.
Hands & Legs: ${config.handPosition}, ${config.legPosition}.
Framing: ${config.framing}, camera angle ${config.cameraAngle}, subject position ${config.characterPosition}.

[PHOTOGRAPHY & REALISM]
Style: ${config.visualStyle}, ${config.cameraStyle}.
Lens & DOF: ${config.lens} lens, ${config.depthOfField}.
Lighting: ${config.lighting}.
Realism: ${config.skinRealism}, ${config.imageQuality}, no CGI, no 3D render look, clean realistic human pores and skin imperfections.
Background: ${config.backgroundStyle}.
Camera Distance: ${config.cameraDistance}.
Aspect Ratio: ${config.aspectRatio}. Full-body head-to-toe shot.`;
  };

  const handleGenerateFinal = () => {
    setStep(7); // Final step
    setIsGeneratingPrompt(true);
    setTimeout(() => {
      setGeneratedPrompt(buildMasterHostPrompt());
      setIsGeneratingPrompt(false);
    }, 1000);
  };

  const handleGenerateHostImage = async () => {
    setIsGeneratingImage(true);
    setGeneratedAiImageUrl(null);
    try {
      const res = await fetchWithApiKey('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: generatedPrompt,
          referenceImageBase64: config.mode === 'upload-face' ? config.userFaceImage : undefined,
          aspectRatio: config.aspectRatio
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedAiImageUrl(data.imageUrl);
      } else {
        alert(data.error || 'Gagal merender gambar host AI.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi saat generate gambar host.');
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
    setStep(1);
    setGeneratedAiImageUrl(null);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold font-mono border border-[#141414]">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold font-mono uppercase tracking-tight text-[#141414]">
              AI HOST & CREATOR GENERATOR
            </h1>
          </div>
          <p className="text-xs font-mono text-black/60 mt-1 uppercase">
            Rancang karakter model/host affiliate ultra-realistis dengan kontrol fisik, outfit, pose & framing presisi.
          </p>
        </div>

        <button 
          onClick={handleReset}
          className="px-3 py-1.5 text-xs font-mono font-bold uppercase text-[#141414] bg-white hover:bg-[#D1D1CF] border border-[#141414] transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* STEP 1: MODALITAS IDENTITAS */}
      {step === 1 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">01</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Modalitas Identitas Wajah Host</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Mode AI Face */}
            <div 
              onClick={() => updateConfig('mode', 'ai-face')}
              className={`p-5 border transition-colors cursor-pointer space-y-3 ${
                config.mode === 'ai-face' 
                  ? 'bg-[#141414] text-white border-[#141414]' 
                  : 'bg-white text-[#141414] border-[#141414] hover:bg-[#F2F2F0]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 border flex items-center justify-center ${config.mode === 'ai-face' ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div className={`w-4 h-4 border flex items-center justify-center text-[10px] ${config.mode === 'ai-face' ? 'bg-white text-black border-white' : 'border-[#141414]'}`}>
                  {config.mode === 'ai-face' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider">GENERATE DENGAN AI FACE</h3>
                <p className={`text-[11px] font-sans mt-1 leading-relaxed ${config.mode === 'ai-face' ? 'text-white/80' : 'text-black/60'}`}>
                  Buat karakter model/host AI baru secara fleksibel dari nol.
                </p>
              </div>
            </div>

            {/* Mode Upload Face */}
            <div 
              onClick={() => updateConfig('mode', 'upload-face')}
              className={`p-5 border transition-colors cursor-pointer space-y-3 ${
                config.mode === 'upload-face' 
                  ? 'bg-[#141414] text-white border-[#141414]' 
                  : 'bg-white text-[#141414] border-[#141414] hover:bg-[#F2F2F0]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 border flex items-center justify-center ${config.mode === 'upload-face' ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div className={`w-4 h-4 border flex items-center justify-center text-[10px] ${config.mode === 'upload-face' ? 'bg-white text-black border-white' : 'border-[#141414]'}`}>
                  {config.mode === 'upload-face' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider">GUNAKAN FOTO SENDIRI</h3>
                <p className={`text-[11px] font-sans mt-1 leading-relaxed ${config.mode === 'upload-face' ? 'text-white/80' : 'text-black/60'}`}>
                  Gunakan foto wajah sendiri sebagai referensi identitas karakter.
                </p>
              </div>
            </div>

          </div>

          {/* If Upload Face selected */}
          {config.mode === 'upload-face' && (
            <div className="bg-[#F2F2F0] p-5 border border-[#141414] space-y-3 font-mono">
              <h4 className="text-xs font-bold text-[#141414] uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-black" /> Upload Foto Wajah Reference
              </h4>

              {config.userFaceImage ? (
                <div className="flex items-center gap-4">
                  <img src={config.userFaceImage} alt="Face" className="w-20 h-20 border border-[#141414] object-cover bg-white" />
                  <div>
                    <span className="text-xs font-bold text-green-700 flex items-center gap-1 uppercase">
                      <CheckCircle2 className="w-4 h-4" /> Foto Wajah Berhasil Diunggah
                    </span>
                    <button 
                      onClick={() => updateConfig('userFaceImage', undefined)}
                      className="mt-2 text-xs text-[#141414] underline font-bold uppercase hover:text-black"
                    >
                      Ganti Foto
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#141414] p-6 text-center cursor-pointer bg-white hover:bg-[#E4E3E0] transition-colors"
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => e.target.files?.[0] && handleFaceUpload(e.target.files[0])}
                  />
                  <Upload className="w-6 h-6 text-black mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#141414] uppercase">Klik untuk upload foto wajah (PNG, JPG, max 5MB)</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button 
              onClick={() => setStep(2)}
              className="px-5 py-2 bg-black hover:bg-black/80 text-white font-mono text-xs font-bold uppercase tracking-wider border border-[#141414] flex items-center gap-2 transition-colors"
            >
              LANJUT KE STEP 2 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* STEP 2: IDENTITAS DASAR & FISIK */}
      {step === 2 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">02</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Identitas Dasar & Bentuk Fisik Host</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            
            {/* Gender */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">1. Jenis Kelamin *</label>
              <div className="grid grid-cols-2 gap-2">
                {['Pria', 'Wanita'].map(g => (
                  <button 
                    key={g} 
                    onClick={() => updateConfig('gender', g as any)}
                    className={`py-2 border text-xs font-bold transition-colors ${
                      config.gender === g ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">2. Usia *</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {['18–24', '25–30', '31–40', '41–50', '51+', 'Spesifik'].map(a => (
                  <button 
                    key={a} 
                    onClick={() => updateConfig('ageGroup', a)}
                    className={`py-2 border text-xs font-bold transition-colors ${
                      config.ageGroup === a ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Height & Body Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">3. Tinggi Badan *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pendek', 'Sedang', 'Tinggi', 'Sgt Tinggi'].map(h => (
                    <button 
                      key={h} 
                      onClick={() => updateConfig('height', h)}
                      className={`py-2 border text-xs font-bold transition-colors ${
                        config.height === h ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">4. Bentuk Tubuh *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Slim', 'Average', 'Athletic', 'Muscular', 'Curvy', 'Plus Size'].map(b => (
                    <button 
                      key={b} 
                      onClick={() => updateConfig('bodyType', b)}
                      className={`py-2 border text-xs font-bold transition-colors ${
                        config.bodyType === b ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Skin Tone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">5. Skin Tone *</label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {['Very Fair', 'Fair', 'Light', 'Medium', 'Tan', 'Deep', 'Dark'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => updateConfig('skinTone', s)}
                    className={`py-2 border text-xs font-bold transition-colors ${
                      config.skinTone === s ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#141414]/20">
              <button 
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-[#141414] bg-white text-[#141414] text-xs font-bold uppercase hover:bg-[#E4E3E0]"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Kembali
              </button>
              <button 
                onClick={() => setStep(3)}
                className="px-5 py-2 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-2"
              >
                LANJUT KE STEP 3 <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 3: DETAIL WAJAH, RAMBUT, CIRI KHAS */}
      {step === 3 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">03</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Detail Wajah, Rambut, & Penampilan</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            
            {/* Wajah */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#141414] uppercase tracking-wider block">DETAIL WAJAH</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#141414] block mb-1.5 uppercase">Bentuk Wajah</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Oval', 'Round', 'Square', 'Natural / AI Pilihan'].map(f => (
                      <button 
                        key={f} 
                        onClick={() => updateConfig('faceShape', f)}
                        className={`py-1.5 px-2 border text-xs font-bold ${config.faceShape === f ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#141414] block mb-1.5 uppercase">Bentuk Mata</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Almond', 'Round', 'Monolid', 'Natural'].map(m => (
                      <button 
                        key={m} 
                        onClick={() => updateConfig('eyeShape', m)}
                        className={`py-1.5 px-2 border text-xs font-bold ${config.eyeShape === m ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rambut */}
            <div className="space-y-2 pt-2 border-t border-[#141414]/20">
              <span className="text-xs font-bold text-[#141414] uppercase tracking-wider block">RAMBUT & JENGGOT</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#141414] block mb-1.5 uppercase">Panjang Rambut</label>
                  <div className="space-y-1">
                    {['Very Short', 'Short', 'Medium', 'Long'].map(l => (
                      <button 
                        key={l} 
                        onClick={() => updateConfig('hairLength', l)}
                        className={`w-full py-1.5 px-3 border text-xs text-left font-bold ${config.hairLength === l ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#141414] block mb-1.5 uppercase">Gaya Rambut</label>
                  <div className="space-y-1">
                    {['Natural', 'Textured', 'Straight', 'Curly', 'Side Part'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => updateConfig('hairStyle', s)}
                        className={`w-full py-1.5 px-3 border text-xs text-left font-bold ${config.hairStyle === s ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#141414] block mb-1.5 uppercase">Jenggot / Kumis</label>
                  <div className="space-y-1">
                    {['Clean Shaven', 'Light Stubble', 'Short Beard', 'Full Beard'].map(b => (
                      <button 
                        key={b} 
                        onClick={() => updateConfig('beardMustache', b)}
                        className={`w-full py-1.5 px-3 border text-xs text-left font-bold ${config.beardMustache === b ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
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
                className="px-5 py-2 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-2"
              >
                LANJUT KE STEP 4 <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 4: STYLE & PAKAIAN */}
      {step === 4 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">04</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Style & Pakaian Host</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            
            {/* Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">1. Gaya Pakaian *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Casual', 'Smart Casual', 'Streetwear', 'Minimalist', 'Elegant', 'Professional', 'Sporty', 'Korean Style'].map(st => (
                  <button 
                    key={st} 
                    onClick={() => updateConfig('clothingStyle', st)}
                    className={`py-2 border text-xs font-bold transition-colors ${
                      config.clothingStyle === st ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414] hover:bg-black/5'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Atasan & Warna */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">2. Atasan *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['T-Shirt', 'Oversized T-Shirt', 'Polo Shirt', 'Shirt', 'Hoodie', 'Blazer'].map(top => (
                    <button 
                      key={top} 
                      onClick={() => updateConfig('topOutfit', top)}
                      className={`py-2 border text-xs font-bold ${config.topOutfit === top ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                    >
                      {top}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">3. Warna Atasan *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['White', 'Black', 'Gray', 'Navy', 'Blue', 'Beige'].map(col => (
                    <button 
                      key={col} 
                      onClick={() => updateConfig('topColor', col)}
                      className={`py-2 border text-xs font-bold ${config.topColor === col ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bawahan & Sepatu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">4. Bawahan *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Jeans', 'Chinos', 'Trousers', 'Cargo Pants'].map(bot => (
                    <button 
                      key={bot} 
                      onClick={() => updateConfig('bottomOutfit', bot)}
                      className={`py-2 border text-xs font-bold ${config.bottomOutfit === bot ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                    >
                      {bot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">5. Sepatu *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Sneakers', 'Running Shoes', 'Loafers', 'Boots'].map(s => (
                    <button 
                      key={s} 
                      onClick={() => updateConfig('shoes', s)}
                      className={`py-2 border text-xs font-bold ${config.shoes === s ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
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
                onClick={() => setStep(5)}
                className="px-5 py-2 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-2"
              >
                LANJUT KE STEP 5 <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 5: POSE, EKSPRESI, & KAMERA */}
      {step === 5 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">05</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Pose, Ekspresi, & Framing Kamera</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            
            {/* Pose Utama */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">1. Pose Utama *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Berdiri santai', 
                  'Berdiri tegak', 
                  'Berdiri dengan satu tangan di saku', 
                  'Berdiri sambil melipat tangan', 
                  'Berdiri sambil menunjuk', 
                  'Casual influencer pose', 
                  'Natural creator pose'
                ].map(p => (
                  <button 
                    key={p} 
                    onClick={() => updateConfig('mainPose', p)}
                    className={`p-2.5 text-left border text-xs font-bold ${config.mainPose === p ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Ekspresi Wajah */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">2. Ekspresi Wajah *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Natural', 'Friendly', 'Friendly smile', 'Confident', 'Energetic', 'Calm', 'Professional', 'Happy'].map(e => (
                  <button 
                    key={e} 
                    onClick={() => updateConfig('facialExpression', e)}
                    className={`py-2 border text-xs font-bold ${config.facialExpression === e ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Framing & Camera Angle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">3. Camera Angle *</label>
                <div className="space-y-1">
                  {['Eye Level', 'Slight Low Angle', 'Slight High Angle', 'Straight Camera'].map(ca => (
                    <button 
                      key={ca} 
                      onClick={() => updateConfig('cameraAngle', ca)}
                      className={`w-full p-2 text-left border text-xs font-bold ${config.cameraAngle === ca ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                    >
                      {ca}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">4. Framing Shot *</label>
                <div className="space-y-1">
                  {['Full Body Centered', 'Full Body with Space Around Character'].map(fr => (
                    <button 
                      key={fr} 
                      onClick={() => updateConfig('framing', fr)}
                      className={`w-full p-2 text-left border text-xs font-bold ${config.framing === fr ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                    >
                      {fr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#141414]/20">
              <button 
                onClick={() => setStep(4)}
                className="px-4 py-2 border border-[#141414] bg-white text-[#141414] text-xs font-bold uppercase hover:bg-[#E4E3E0]"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Kembali
              </button>
              <button 
                onClick={() => setStep(6)}
                className="px-5 py-2 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-2"
              >
                LANJUT KE STEP 6 <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 6: VISUAL & FOTOGRAFI REALISTIS */}
      {step === 6 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">06</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Visual & Fotografi Realistis (Quality Lock)</h2>
          </div>

          <div className="bg-[#F2F2F0] p-6 border border-[#141414] space-y-6">
            
            {/* Visual Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">1. Gaya Visual *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Ultra Realistic', 'Photorealistic', 'Hyper Realistic', 'Natural Photography'].map(v => (
                  <button 
                    key={v} 
                    onClick={() => updateConfig('visualStyle', v)}
                    className={`py-2 border text-xs font-bold ${config.visualStyle === v ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting & Aspect Ratio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">2. Lighting Setup *</label>
                <div className="space-y-1">
                  {['Natural Professional Lighting', 'Natural Daylight', 'Soft Studio Lighting', 'Soft Window Light', 'Cinematic Lighting'].map(l => (
                    <button 
                      key={l} 
                      onClick={() => updateConfig('lighting', l)}
                      className={`w-full p-2 text-left border text-xs font-bold ${config.lighting === l ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141414] uppercase tracking-wider block">3. Aspect Ratio *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { ratio: '9:16', label: '9:16 (TikTok)' },
                    { ratio: '4:5', label: '4:5 (Feed)' },
                    { ratio: '1:1', label: '1:1 (Square)' },
                    { ratio: '16:9', label: '16:9 (Landscape)' }
                  ].map(ar => (
                    <button 
                      key={ar.ratio} 
                      onClick={() => updateConfig('aspectRatio', ar.ratio)}
                      className={`p-2.5 border text-xs font-bold text-center ${config.aspectRatio === ar.ratio ? 'bg-black text-white border-black' : 'bg-white text-[#141414] border-[#141414]'}`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#141414]/20">
              <button 
                onClick={() => setStep(5)}
                className="px-4 py-2 border border-[#141414] bg-white text-[#141414] text-xs font-bold uppercase hover:bg-[#E4E3E0]"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Kembali
              </button>
              <button 
                onClick={handleGenerateFinal}
                className="px-5 py-2 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-2"
              >
                GENERATE MASTER HOST PROMPT <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 7: FINAL MASTER HOST PROMPT & REAL AI GENERATION */}
      {step === 7 && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-black text-white font-bold flex items-center justify-center text-xs border border-[#141414]">07</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">Final Master Host Prompt & AI Host Render</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Summary */}
            <div className="lg:col-span-4 bg-[#F2F2F0] p-4 border border-[#141414] space-y-4">
              <h3 className="text-xs font-bold text-[#141414] uppercase tracking-wider border-b border-[#141414] pb-2">
                Ringkasan Host AI
              </h3>

              {config.mode === 'upload-face' && config.userFaceImage && (
                <div className="w-full aspect-square bg-white border border-[#141414] overflow-hidden p-1 relative">
                  <img src={config.userFaceImage} alt="User Face" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 right-2 bg-black text-white text-[9px] font-bold py-1 px-2 border border-[#141414] text-center uppercase tracking-wider">
                    FACIAL IDENTITY LOCKED
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-[#141414]">
                <p><strong>Gender & Usia:</strong> {config.gender}, {config.ageGroup}</p>
                <p><strong>Fisik:</strong> {config.height}, {config.bodyType}</p>
                <p><strong>Outfit:</strong> {config.topOutfit} + {config.bottomOutfit}</p>
                <p><strong>Pose:</strong> {config.mainPose}</p>
                <p><strong>Ratio:</strong> {config.aspectRatio}</p>
              </div>
            </div>

            {/* Prompt & Render Box */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-[#141414] text-white p-5 border border-[#141414] space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> MASTER CHARACTER HOST PROMPT
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
                    [COMPILING] Menyusun Master Character Host Prompt...
                  </div>
                ) : (
                  <textarea 
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="w-full h-52 bg-black text-white font-mono text-xs leading-relaxed p-3 border border-white/20 outline-none resize-none"
                  />
                )}
              </div>

              {/* Real AI Image Render */}
              <div className="bg-[#F2F2F0] p-5 border border-[#141414] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#141414] uppercase font-mono">Generate Host AI Full Body</h3>
                    <p className="text-[11px] text-black/70 font-sans">Render karakter host affiliate realistis secara langsung.</p>
                  </div>
                  <button
                    onClick={handleGenerateHostImage}
                    disabled={isGeneratingImage}
                    className="px-4 py-2 bg-black hover:bg-black/80 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-black disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4 text-yellow-400" />
                    {isGeneratingImage ? 'Rendering Host...' : 'GENERATE HOST AI'}
                  </button>
                </div>

                {isGeneratingImage && (
                  <div className="py-10 bg-white border border-[#141414] text-center space-y-2 font-mono">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-[#141414] uppercase">Sedang Merender Karakter Host Ultra-Realistis...</p>
                  </div>
                )}

                {generatedAiImageUrl && !isGeneratingImage && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-green-700 font-mono flex items-center gap-1.5 uppercase">
                      <CheckCircle2 className="w-4 h-4" /> Karakter Host AI Berhasil Di-generate!
                    </div>
                    <div className="w-full max-w-sm mx-auto aspect-[9/16] border border-[#141414] bg-black">
                      <img src={generatedAiImageUrl} alt="AI Host" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex justify-end">
                      <a 
                        href={generatedAiImageUrl} 
                        download="ai-affiliate-host.png"
                        className="px-4 py-2 bg-black text-white font-mono text-xs font-bold uppercase hover:bg-black/80 border border-black"
                      >
                        Download Host Image
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
