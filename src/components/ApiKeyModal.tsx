import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertTriangle, RefreshCw, Eye, EyeOff, X, Shield, Sparkles } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey, verifyApiKey } from '../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string;
  onKeyUpdated?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  errorMessage,
  onKeyUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeStoredKey, setActiveStoredKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getStoredApiKey();
      setActiveStoredKey(current);
      setApiKeyInput(current);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({
        success: false,
        message: 'Mohon masukkan API Key Gemini sebelum melakukan uji coba.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await verifyApiKey(apiKeyInput.trim());
    setIsTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: res.message || 'API Key valid & berhasil terhubung ke server Gemini!',
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'API Key tidak valid atau kuota habis.',
      });
    }
  };

  const handleSaveKey = () => {
    if (!apiKeyInput.trim()) {
      alert('Masukkan API Key yang valid terlebih dahulu.');
      return;
    }
    setStoredApiKey(apiKeyInput.trim());
    setActiveStoredKey(apiKeyInput.trim());
    if (onKeyUpdated) onKeyUpdated();
    alert('API Key berhasil disimpan dan akan digunakan untuk seluruh fitur!');
    onClose();
  };

  const handleResetToSystemKey = () => {
    clearStoredApiKey();
    setApiKeyInput('');
    setActiveStoredKey('');
    setTestResult(null);
    if (onKeyUpdated) onKeyUpdated();
    alert('Pengaturan dikembalikan ke API Key default sistem.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#E4E3E0] border-2 border-[#141414] w-full max-w-xl shadow-[8px_8px_0px_0px_#141414] overflow-hidden font-mono text-[#141414]">
        
        {/* Header */}
        <div className="bg-[#141414] text-white p-4 flex items-center justify-between border-b border-[#141414]">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              PENGATURAN & UJI COBA GEMINI API KEY
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 text-white transition-colors border border-white/30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Active Key Status Badge */}
          <div className="bg-[#F2F2F0] border border-[#141414] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-black" />
              <span className="text-xs font-bold uppercase">Status Key Aktif:</span>
            </div>
            {activeStoredKey ? (
              <span className="bg-green-700 text-white text-[10px] font-bold px-2.5 py-1 border border-[#141414] uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Custom Key Terpasang
              </span>
            ) : (
              <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 border border-[#141414] uppercase tracking-wider">
                System Default Key
              </span>
            )}
          </div>

          {/* Trigger Alert if error passed */}
          {errorMessage && (
            <div className="bg-red-100 border-2 border-red-700 p-3 text-red-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" /> Kendala API Key Terdeteksi:
              </p>
              <p className="text-[11px] font-sans leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Input API Key */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider block">
              Masukkan Gemini API Key Baru:
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Tempelkan API Key di sini (misal: AIzaSy...)"
                className="w-full bg-white border border-[#141414] p-3 text-xs font-mono outline-none pr-10 focus:bg-yellow-50"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-black/60 hover:text-black"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-black/60 font-sans">
              * API Key Anda akan disimpan secara lokal di browser Anda (localStorage) dan tidak akan dibagikan ke siapapun.
            </p>
          </div>

          {/* Test Status Feedback Box */}
          {isTesting && (
            <div className="bg-white border border-[#141414] p-3 text-xs flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span className="font-bold uppercase">[VERIFYING] Menguji Koneksi API Key ke Server Gemini...</span>
            </div>
          )}

          {testResult && !isTesting && (
            <div className={`p-3 border text-xs ${
              testResult.success 
                ? 'bg-green-100 border-green-800 text-green-900' 
                : 'bg-red-100 border-red-800 text-red-900'
            }`}>
              <div className="flex items-center gap-2 font-bold uppercase">
                {testResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                    <span>Uji Coba Sukses!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                    <span>Uji Coba Gagal!</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-[11px] font-sans leading-relaxed">{testResult.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#141414]/30 flex flex-col sm:flex-row gap-2 justify-between items-center">
            
            <button
              onClick={handleTestKey}
              disabled={isTesting}
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#D1D1CF] text-[#141414] font-bold text-xs uppercase tracking-wider border border-[#141414] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              ⚡ Uji Coba Key
            </button>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
              {activeStoredKey && (
                <button
                  onClick={handleResetToSystemKey}
                  className="px-3 py-2.5 bg-gray-200 hover:bg-gray-300 text-black font-bold text-xs uppercase border border-[#141414] transition-colors"
                >
                  Reset Default
                </button>
              )}

              <button
                onClick={handleSaveKey}
                className="px-5 py-2.5 bg-black hover:bg-black/80 text-white font-bold text-xs uppercase tracking-wider border border-[#141414] transition-colors flex items-center justify-center gap-2"
              >
                💾 Simpan & Gunakan Key
              </button>
            </div>

          </div>

        </div>

        {/* Footer info */}
        <div className="bg-[#D1D1CF] p-2.5 px-4 text-[10px] text-black/70 flex items-center justify-between border-t border-[#141414]">
          <span>KANG DAWANK GEMINI SUITE</span>
          <span>HTTP 200/401 KEY VERIFIER</span>
        </div>

      </div>
    </div>
  );
};
