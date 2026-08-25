export type ActiveTool = 'dashboard' | 'single-angle' | 'multi-angle' | 'host-creator' | 'video-engine';

export interface ProductAnalysisResult {
  productType: string;
  shapeAndSilhouette: string;
  colors: string;
  material: string;
  texture: string;
  patternAndGraphics: string;
  logoAndBranding: string;
  productDetails: string;
  distinctiveFeatures: string;
  visibleStructure: string;
  summaryText: string;
}

export interface SingleAngleConfig {
  concept: string;
  customConcept: string;
  angle: string;
  background: string;
  customBackground: string;
  lighting: string;
  composition: string;
  photoStyle: string;
}

export interface MultiAngleConfig {
  angleCount: string;
  selectedAngles: string[];
  composition: string;
  background: string;
  spacing: string;
}

export interface HostCreatorConfig {
  mode: 'ai-face' | 'upload-face';
  userFaceImage?: string;
  
  // Step 2: Identitas & Fisik
  gender: 'Pria' | 'Wanita';
  ageGroup: string;
  height: string;
  customHeight?: string;
  bodyType: string;
  bodyProportion: string;
  skinTone: string;

  // Step 3: Wajah & Rambut
  faceShape: string;
  eyeShape: string;
  eyeColor: string;
  noseShape: string;
  lipShape: string;
  jawline: string;
  eyebrows: string;
  hairColor: string;
  hairLength: string;
  hairStyle: string;
  beardMustache: string;
  distinctiveFeature: string[];
  customDistinctiveFeature?: string;

  // Step 4: Style & Pakaian
  clothingStyle: string;
  topOutfit: string;
  topColor: string;
  bottomOutfit: string;
  bottomColor: string;
  shoes: string;
  shoesColor: string;
  accessories: string[];
  materialOption: string;
  clothingFit: string;
  extraOutfitDetails?: string;

  // Step 5: Pose & Ekspresi
  mainPose: string;
  bodyPosition: string;
  facialExpression: string;
  handPosition: string;
  legPosition: string;
  cameraAngle: string;
  framing: string;
  characterPosition: string;

  // Step 6: Visual & Realisme
  visualStyle: string;
  cameraStyle: string;
  lens: string;
  depthOfField: string;
  lighting: string;
  skinRealism: string;
  imageQuality: string;
  backgroundStyle: string;
  cameraDistance: string;
  aspectRatio: string;
}

export interface VideoEngineConfig {
  // Step 1: Produk
  productImage?: string;
  productName: string;
  productDescription: string;
  autoAnalyzeProduct: boolean;

  // Step 2: Karakter
  characterType: 'upload-photo' | 'ai-character' | 'product-only';
  characterPhoto?: string;
  aiCharacterParams: {
    gender: 'Pria' | 'Wanita';
    age: string;
    physicalAppearance: string;
    hairStyle: string;
    outfit: string;
    vibe: string;
  };

  // Step 3: Gaya Video
  videoStyle: string;
  realismLevel: 'Ultra Realistic' | 'Realistic' | 'Stylized';
  mood: string;
  visualFeel: string;

  // Step 4: Script Generator
  openingHook: string;
  languageStyle: string;
  deliveryStyle: string;
  emotionTone: string;
  ctaType: string;
  duration: string;

  // Step 5: Final Output Target
  targetGenerator: 'Veo 3.1' | 'Seedance 2.5' | 'Kling' | 'Hailuo / MiniMax' | 'Sora 2 API' | 'Universal / Auto';
  outputType: 'VIDEO PROMPT' | 'AI AGENT PROMPT';
}

export interface VideoScene {
  sceneNumber: number;
  timeRange: string;
  visualDescription: string;
  voiceoverText: string;
  onScreenText: string;
  visualPrompt: string;
}

export interface GeneratedScriptResult {
  title: string;
  durationSeconds?: number;
  hookText?: string;
  hook: string;
  cta: string;
  recommendedMusic: string;
  scenes: VideoScene[];
  scriptSections?: {
    timestamp: string;
    visualDirection: string;
    narrationText: string;
    audioCue: string;
  }[];
  fullNarration?: string;
}
