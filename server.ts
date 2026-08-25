import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Helper to get initialized GenAI instance
function getGenAIClient(req?: express.Request) {
  const customKey = (req?.headers["x-api-key"] as string) || req?.body?.customApiKey;
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: GEMINI_API_KEY environment variable or custom API key is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function checkIsApiKeyError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  const status = err.status || err.statusCode;
  return (
    status === 401 ||
    status === 403 ||
    msg.includes("api_key") ||
    msg.includes("api key") ||
    msg.includes("unauthenticated") ||
    msg.includes("unauthorized") ||
    msg.includes("invalid key") ||
    msg.includes("permission_denied") ||
    msg.includes("quota")
  );
}

// Helper to handle transient 503 / high demand errors with retries & fallback models
async function generateContentWithRetry(ai: GoogleGenAI, params: any, retries = 2) {
  const primaryModel = params.model || "gemini-3.7-flash";
  const modelsToTry = Array.from(new Set([primaryModel, "gemini-3.7-flash", "gemini-2.5-flash"]));

  let lastError: any = null;

  for (const modelCandidate of modelsToTry) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await ai.models.generateContent({
          ...params,
          model: modelCandidate,
        });
      } catch (err: any) {
        lastError = err;
        const msg = (err.message || "").toLowerCase();
        const status = err.status || err.statusCode;
        const isTransient =
          status === 503 ||
          status === 429 ||
          msg.includes("503") ||
          msg.includes("high demand") ||
          msg.includes("unavailable") ||
          msg.includes("resource_exhausted") ||
          msg.includes("overloaded");

        if (isTransient && attempt < retries) {
          console.warn(`[Gemini API] Transient error on ${modelCandidate} (Attempt ${attempt + 1}/${retries}), retrying...`);
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

// Endpoint: Test and verify API Key
app.post("/api/verify-key", async (req, res) => {
  try {
    const { apiKey } = req.body;
    const testKey = apiKey || (req.headers["x-api-key"] as string) || process.env.GEMINI_API_KEY;
    if (!testKey) {
      return res.status(400).json({
        success: false,
        isApiKeyError: true,
        error: "API Key tidak boleh kosong.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: testKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Run a lightweight call to test key validity
    await generateContentWithRetry(ai, {
      model: "gemini-3.7-flash",
      contents: "Test API Key",
    });

    return res.json({
      success: true,
      message: "API Key valid & siap digunakan!",
    });
  } catch (err: any) {
    console.error("Error in /api/verify-key:", err);
    return res.status(401).json({
      success: false,
      isApiKeyError: true,
      error: err.message || "API Key tidak valid atau tidak memiliki akses.",
    });
  }
});

// 1. API: Analyze Product Image
app.post("/api/analyze-product", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 parameter." });
    }

    const ai = getGenAIClient(req);
    
    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const prompt = `Analisis gambar produk affiliate ini secara sangat detail untuk mengunci identitas visualnya (Product Identity Lock).
Berikan analisis teknis mendalam dalam bahasa Indonesia dengan struktur JSON berikut:
1. productType: Jenis produk secara spesifik (misal: "Portable Mini Blender 350ml", "Sepatu Sneakers Running Casual", "Kaos Cotton Combed 30s")
2. shapeAndSilhouette: Bentuk geometri, siluet, dan proporsi produk
3. colors: Warna utama, warna sekunder, dan aksen warna
4. material: Jenis material fisik yang terlihat (plastik matte, kaca, stainless steel, kulit sintetis, kain rajut, dll)
5. texture: Tekstur permukaan (halus, bermotif, ribbed, glossy, matte, dll)
6. patternAndGraphics: Pola visual, grafis, striping, atau cetakan
7. logoAndBranding: Merek, logo, teks, atau penanda identitas yang terlihat
8. productDetails: Detail kecil seperti tombol, jahitan, penutup, sleting, tali, indikator LED, port USB, dll
9. distinctiveFeatures: Keunikan khas produk yang paling menonjol
10. visibleStructure: Struktur keseluruhan produk yang harus dipertahankan secara absolut saat membuat variasi gambar baru
11. summaryText: Ringkasan 2 kalimat tentang identitas produk yang dikunci.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productType: { type: Type.STRING },
            shapeAndSilhouette: { type: Type.STRING },
            colors: { type: Type.STRING },
            material: { type: Type.STRING },
            texture: { type: Type.STRING },
            patternAndGraphics: { type: Type.STRING },
            logoAndBranding: { type: Type.STRING },
            productDetails: { type: Type.STRING },
            distinctiveFeatures: { type: Type.STRING },
            visibleStructure: { type: Type.STRING },
            summaryText: { type: Type.STRING },
          },
          required: [
            "productType",
            "shapeAndSilhouette",
            "colors",
            "material",
            "texture",
            "patternAndGraphics",
            "logoAndBranding",
            "productDetails",
            "distinctiveFeatures",
            "visibleStructure",
            "summaryText",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json({ success: true, analysis: result });
  } catch (err: any) {
    console.error("Error in /api/analyze-product:", err);
    if (checkIsApiKeyError(err)) {
      return res.status(401).json({
        success: false,
        isApiKeyError: true,
        error: `Problem with API Key: ${err.message}`,
      });
    }
    return res.status(500).json({
      error: err.message || "Failed to analyze product image.",
      fallbackAnalysis: {
        productType: "Identifikasi Produk Otomatis",
        shapeAndSilhouette: "Bentuk & Proporsi Asli",
        colors: "Warna Utama & Sekunder",
        material: "Karakteristik Material Asli",
        texture: "Tekstur Permukaan",
        patternAndGraphics: "Elemen Grafis Visible",
        logoAndBranding: "Branding & Markings",
        productDetails: "Detail Jahitan, Tombol, & Aksesoris",
        distinctiveFeatures: "Fitur Unik Khas Produk",
        visibleStructure: "Struktur Geometri Produk",
        summaryText: "Identitas visual produk berhasil dikunci untuk menjaga konsistensi.",
      },
    });
  }
});

// 2. API: Generate Video Script
app.post("/api/generate-script", async (req, res) => {
  try {
    const {
      productName,
      productDescription,
      productAnalysis,
      concept,
      videoStyle,
      platform,
      targetAudience,
      openingHook,
      languageStyle,
      language,
      deliveryStyle,
      emotionTone,
      ctaType,
      duration,
    } = req.body;

    const ai = getGenAIClient(req);

    const prodInfo = productName 
      ? `Produk: ${productName}. ${productDescription || ''}`
      : productAnalysis 
        ? `Produk: ${productAnalysis.productType || 'Produk'}. Material: ${productAnalysis.material || ''}, Warna: ${productAnalysis.colors || ''}, Ciri Unik: ${productAnalysis.distinctiveFeatures || ''}`
        : "Produk berkualitas tinggi dengan keunggulan menarik.";

    const styleInfo = concept || videoStyle || "Problem Solution & Soft Selling";
    const platformInfo = platform || "TikTok / Instagram Reels";
    const durationInfo = duration || "30 detik";

    const prompt = `Kamu adalah seorang Copywriter & Content Creator Affiliate TikTok / Reels profesional dengan conversion rate tinggi.
Buatkan SCRIPT KONTEN VIDEO AFFILIATE lengkap untuk produk berikut:
- Informasi Produk: ${prodInfo}
- Konsep / Gaya Video: ${styleInfo}
- Platform: ${platformInfo}
- Target Audiens: ${targetAudience || "Gen Z & Milenial"}
- Gaya Bahasa: ${language || languageStyle || "Santai & Alami Bahasa Indonesia"}
- Durasi Target: ${durationInfo}

Hasilkan JSON terstruktur wajib dalam format persis ini:
{
  "title": "Judul Script Kreatif & Menarik",
  "durationSeconds": 30,
  "hook": "Teks Hook pembuka 3 detik pertama yang terbukti menghentikan scroll",
  "hookText": "Teks Hook pembuka 3 detik pertama",
  "cta": "Call to action penutup untuk mendorong pembelian di keranjang/link",
  "recommendedMusic": "Nama/Gaya musik BGM yang disarankan (misal: Upbeat Trending TikTok)",
  "scenes": [
    {
      "sceneNumber": 1,
      "timeRange": "00:00 - 00:03",
      "visualDescription": "Instruksi aksi visual atau gerakan kamera",
      "voiceoverText": "Narasi lisan dubbing dalam Bahasa Indonesia yang sangat alami",
      "onScreenText": "Teks singkat yang muncul di layar",
      "visualPrompt": "Prompt bahasa inggris detail untuk AI Image Generator (photorealistic 8k, product focus)"
    }
  ],
  "fullNarration": "Teks narasi utuh tanpa timestamp untuk dubbing/voiceover"
}`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            durationSeconds: { type: Type.NUMBER },
            hook: { type: Type.STRING },
            hookText: { type: Type.STRING },
            cta: { type: Type.STRING },
            recommendedMusic: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.NUMBER },
                  timeRange: { type: Type.STRING },
                  visualDescription: { type: Type.STRING },
                  voiceoverText: { type: Type.STRING },
                  onScreenText: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                },
                required: ["sceneNumber", "timeRange", "visualDescription", "voiceoverText", "onScreenText", "visualPrompt"],
              },
            },
            fullNarration: { type: Type.STRING },
          },
          required: ["title", "hook", "cta", "recommendedMusic", "scenes", "fullNarration"],
        },
      },
    });

    const scriptData = JSON.parse(response.text || "{}");
    return res.json({ success: true, script: scriptData });
  } catch (err: any) {
    console.error("Error in /api/generate-script:", err);
    if (checkIsApiKeyError(err)) {
      return res.status(401).json({
        success: false,
        isApiKeyError: true,
        error: `Problem with API Key: ${err.message}`,
      });
    }
    return res.status(500).json({
      error: err.message || "Failed to generate video script.",
    });
  }
});

// 3. API: Generate AI Image Preview
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, referenceImageBase64, aspectRatio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt parameter." });
    }

    const ai = getGenAIClient(req);

    const parts: any[] = [];

    if (referenceImageBase64) {
      const base64Data = referenceImageBase64.replace(/^data:image\/\w+;base64,/, "");
      const mimeMatch = referenceImageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType,
        },
      });
    }

    parts.push({
      text: prompt,
    });

    // Map requested aspect ratio to supported Gemini Image API format
    let targetAspectRatio = "1:1";
    if (aspectRatio === "9:16") targetAspectRatio = "9:16";
    else if (aspectRatio === "16:9") targetAspectRatio = "16:9";
    else if (aspectRatio === "4:3" || aspectRatio === "4:5") targetAspectRatio = "3:4";

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts,
      },
      config: {
        imageConfig: {
          aspectRatio: targetAspectRatio as any,
        },
      },
    });

    let imageUrl = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "No image generated by Gemini API." });
    }

    return res.json({ success: true, imageUrl });
  } catch (err: any) {
    console.error("Error in /api/generate-image:", err);
    if (checkIsApiKeyError(err)) {
      return res.status(401).json({
        success: false,
        isApiKeyError: true,
        error: `Problem with API Key: ${err.message}`,
      });
    }
    return res.status(500).json({
      error: err.message || "Failed to generate image.",
    });
  }
});

// Start Express Server with Vite
async function startServer() {
  // Vite dev middleware for dev, static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
