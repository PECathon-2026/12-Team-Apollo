/**
 * Tsukuyomi Watch - Shared TypeScript Definitions
 * Celestial Guide & Samurai Astrophotography Suite
 */

// ==========================================
// 1. Navigation & App Shell Types
// ==========================================

export type NavSectionId = 'dashboard' | 'watchtower' | 'scroll' | 'spirit-lens' | 'dojo';

export interface NavSectionItem {
  id: NavSectionId;
  label: string;
  labelJapanese: string;
  romaji: string;
  subtitle: string;
  description: string;
  iconName: string;
  badge?: string;
}

// ==========================================
// 2. Celestial Events & Telemetry Types
// ==========================================

export type CelestialEventType =
  | 'iss_pass'
  | 'lunar_phase'
  | 'meteor_shower'
  | 'eclipse'
  | 'conjunction'
  | 'planetary_alignment';

export interface CelestialCoordinates {
  latitude: number;
  longitude: number;
  altitudeKm?: number;
}

export interface CelestialEvent {
  id: string;
  title: string;
  titleJapanese: string;
  type: CelestialEventType;
  timestamp: string;
  peakTime?: string;
  azimuthDeg?: number;
  elevationDeg?: number;
  magnitude?: number;
  description: string;
  samuraiLore: string;
  significance: 'auspicious' | 'neutral' | 'ominous' | 'legendary';
}

export interface ISSLocation {
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKmh: number;
  timestamp: number;
  visibility: 'daylight' | 'visible' | 'eclipsed';
  footprintRadiusKm: number;
  currentConstellation?: string;
}

export interface ISSPassPrediction {
  id: string;
  risetime: string;
  durationSeconds: number;
  maxElevationDeg: number;
  approachDirection: string;
  departureDirection: string;
  brightnessMagnitude: number;
  visibleUnderSky: boolean;
  samuraiWatchpost: string;
}

export interface MoonPhaseInfo {
  fraction: number; // 0.0 to 1.0 (illumination)
  phase: number;    // 0.0 = New Moon, 0.25 = First Quarter, 0.5 = Full Moon, 0.75 = Last Quarter
  phaseName: string;
  phaseJapanese: string;
  ageDays: number;
  angleRadians: number;
  moonrise: string | null;
  moonset: string | null;
  samuraiGuardTactic: string;
}

// ==========================================
// 3. Spirit Lens (Detection & Vision) Types
// ==========================================

export type CelestialClass =
  | 'moon'
  | 'nebula'
  | 'galaxy'
  | 'constellation'
  | 'planet'
  | 'satellite'
  | 'meteor'
  | 'star_cluster';

export interface BoundingBox {
  x: number;      // 0.0 to 1.0 normalized
  y: number;      // 0.0 to 1.0 normalized
  width: number;  // 0.0 to 1.0 normalized
  height: number; // 0.0 to 1.0 normalized
}

export interface CelestialDetection {
  id: string;
  label: string;
  japaneseLabel: string;
  celestialClass: CelestialClass;
  confidence: number; // 0.0 to 1.0
  bbox: BoundingBox;
  colorHex: string;
  distanceLightYears?: number;
  astronomicalNotes: string;
  samuraiConstellationLore: string;
}

export interface SpiritLensResult {
  imageId: string;
  filename: string;
  detectedAt: string;
  imageDimensions: {
    width: number;
    height: number;
  };
  detections: CelestialDetection[];
  totalDetections: number;
  skySector: string;
  zenInsight: string;
}

// ==========================================
// 4. Restoration Dojo (Image Enhancement) Types
// ==========================================

export type RestorationPreset =
  | 'samurai_clarity'
  | 'ink_denoise'
  | 'nebula_deep_ink'
  | 'lunar_sharp'
  | 'solar_veil';

export interface RestorationParameters {
  preset: RestorationPreset;
  noiseReductionLevel: number;    // 0 - 100
  contrastBoost: number;          // 0 - 100
  sharpness: number;              // 0 - 100
  starDehalo: boolean;
  backgroundBlackLevel: number;   // 0 - 100
  colorSaturation: number;        // 0 - 100
}

export interface RestorationMetrics {
  snrImprovementDb: number;
  starsRecoveredCount: number;
  backgroundNoiseReducedPercent: number;
  processingTimeMs: number;
  entropyScore: number;
}

export interface RestorationResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalImageUrl: string;
  restoredImageUrl: string;
  parameters: RestorationParameters;
  metrics: RestorationMetrics;
  completedAt: string;
  alchemistNotes: string;
}

export interface BeforeAfterComparison {
  beforeUrl: string;
  afterUrl: string;
  labelBefore: string;
  labelAfter: string;
  initialSliderPositionPercent: number;
}
