import { Router, Request, Response } from 'express';
import multer from 'multer';
import { RestorationPreset, RestorationParameters, RestorationResult } from '../../src/types';
import {
  performScientificRestoration,
  performPretrainedAiRestoration,
} from '../utils/scientificRestorer';
import { isFitsFile, parseAndConvertFits } from '../utils/fitsParser';

export const restoreRouter = Router();

// Configure multer memory storage with 30MB max limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB
  },
  fileFilter: (_req, file, cb) => {
    // Accept standard images and astronomical FITS files
    if (
      file.mimetype.startsWith('image/') ||
      /\.(fits|fit|fts|png|jpe?g|webp)$/i.test(file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload JPEG, PNG, WebP, or astronomical FITS.'));
    }
  },
});

/**
 * GET /api/restore/presets
 * Returns available samurai image restoration presets
 */
restoreRouter.get('/presets', (_req: Request, res: Response) => {
  res.json([
    {
      id: 'samurai_clarity',
      name: 'Samurai Clarity (侍の明瞭)',
      description: 'Balanced stellar sharpening and contrast honing.',
      defaultParameters: {
        preset: 'samurai_clarity',
        noiseReductionLevel: 75,
        contrastBoost: 60,
        sharpness: 85,
        starDehalo: true,
        backgroundBlackLevel: 45,
        colorSaturation: 65,
      },
    },
    {
      id: 'ink_denoise',
      name: 'Sumi-e Deep Denoise (墨流し)',
      description: 'Atmospheric grain and sensor read-noise reduction modeled after smooth ink wash.',
      defaultParameters: {
        preset: 'ink_denoise',
        noiseReductionLevel: 90,
        contrastBoost: 50,
        sharpness: 65,
        starDehalo: true,
        backgroundBlackLevel: 50,
        colorSaturation: 60,
      },
    },
    {
      id: 'nebula_deep_ink',
      name: 'Nebula Veil (星雲の衣)',
      description: 'Optimized for faint emission dust lanes, hydrogen-alpha, and diffuse reflection nebulosity.',
      defaultParameters: {
        preset: 'nebula_deep_ink',
        noiseReductionLevel: 70,
        contrastBoost: 80,
        sharpness: 75,
        starDehalo: false,
        backgroundBlackLevel: 40,
        colorSaturation: 75,
      },
    },
    {
      id: 'lunar_sharp',
      name: 'Lunar Edge (月面研磨)',
      description: 'High-frequency deconvolution for lunar maria, crater rims, and planetary detail.',
      defaultParameters: {
        preset: 'lunar_sharp',
        noiseReductionLevel: 50,
        contrastBoost: 70,
        sharpness: 95,
        starDehalo: true,
        backgroundBlackLevel: 35,
        colorSaturation: 50,
      },
    },
    {
      id: 'solar_veil',
      name: 'Solar Void (黒点抽出)',
      description: 'Dynamic range balancing for solar granulation, prominence veils, and sunspot cores.',
      defaultParameters: {
        preset: 'solar_veil',
        noiseReductionLevel: 65,
        contrastBoost: 65,
        sharpness: 80,
        starDehalo: true,
        backgroundBlackLevel: 55,
        colorSaturation: 60,
      },
    },
  ]);
});

/**
 * POST /api/restore
 * Handles astronomical image restoration via Scientific Engine, AI Model, or Demo Mode
 */
restoreRouter.post('/', upload.single('imageFile'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const bodyPreset: RestorationPreset = req.body.preset || 'samurai_clarity';
    const bodyMode = req.body.mode || 'scientific'; // 'scientific' | 'ai' | 'demo'

    // Parse parameters
    let parsedParameters: RestorationParameters;
    if (req.body.parameters) {
      try {
        parsedParameters =
          typeof req.body.parameters === 'string'
            ? JSON.parse(req.body.parameters)
            : req.body.parameters;
      } catch {
        parsedParameters = {
          preset: bodyPreset,
          noiseReductionLevel: Number(req.body.noiseReductionLevel) || 75,
          contrastBoost: Number(req.body.contrastBoost) || 60,
          sharpness: Number(req.body.sharpness) || 85,
          starDehalo: req.body.starDehalo === 'true' || req.body.starDehalo === true,
          backgroundBlackLevel: Number(req.body.backgroundBlackLevel) || 45,
          colorSaturation: Number(req.body.colorSaturation) || 65,
        };
      }
    } else {
      parsedParameters = {
        preset: bodyPreset,
        noiseReductionLevel: Number(req.body.noiseReductionLevel) || 75,
        contrastBoost: Number(req.body.contrastBoost) || 60,
        sharpness: Number(req.body.sharpness) || 85,
        starDehalo: req.body.starDehalo === 'true' || req.body.starDehalo === true,
        backgroundBlackLevel: Number(req.body.backgroundBlackLevel) || 45,
        colorSaturation: Number(req.body.colorSaturation) || 65,
      };
    }

    // 1. Handle Demonstration Mode requested or when no file is uploaded but demo mode requested
    if (bodyMode === 'demo' || req.body.isDemo === 'true') {
      const demoResult: RestorationResult = {
        id: `dojo-demo-${Date.now()}`,
        status: 'completed',
        originalImageUrl:
          req.body.imageUrl ||
          'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=40',
        restoredImageUrl:
          req.body.imageUrl ||
          'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=90',
        parameters: parsedParameters,
        metrics: {
          snrImprovementDb: +(15 + (parsedParameters.noiseReductionLevel / 100) * 5).toFixed(1),
          starsRecoveredCount: Math.floor(1200 + (parsedParameters.sharpness / 100) * 400),
          backgroundNoiseReducedPercent: Math.floor(78 + (parsedParameters.noiseReductionLevel / 100) * 16),
          processingTimeMs: Math.floor(260 + Math.random() * 120),
          entropyScore: 0.95,
        },
        completedAt: new Date().toISOString(),
        alchemistNotes:
          '[DEMONSTRATION MODE] This is a development simulation for interface testing. No genuine AI model was executed for this run.',
        candidateDetections: [
          {
            id: 'demo-det-1',
            type: 'candidate_star',
            label: 'Candidate Stellar Core (Mitsuboshi Alpha)',
            japaneseLabel: '恒星候補 (三つ星α)',
            xPercent: 48.5,
            yPercent: 44.2,
            radiusPixels: 8,
            peakBrightness: 245,
            confidence: 0.98,
            notes: 'Demonstration overlay: compact stellar centroid.',
          },
          {
            id: 'demo-det-2',
            type: 'candidate_nebula',
            label: 'Candidate Ionized Emission (M42 Region)',
            japaneseLabel: '星雲候補 (M42領域)',
            xPercent: 54.2,
            yPercent: 68.1,
            radiusPixels: 16,
            peakBrightness: 210,
            confidence: 0.93,
            notes: 'Demonstration overlay: extended hydrogen-alpha emission.',
          },
        ],
        metadata: {
          originalDimensions: { width: 1200, height: 800 },
          restoredDimensions: { width: 1200, height: 800 },
          originalFileSizeKb: 420,
          restoredFileSizeKb: 512,
          format: 'JPEG (Demo Sample)',
          method: 'demonstration_mode',
          methodLabel: 'Demonstration Mode (Development Simulation)',
          processingTimeMs: 310,
          algorithmSummary:
            'Development demonstration simulation. Metrics and images are synthesized for frontend layout verification.',
          metricsExplanation:
            'Simulated values for testing purposes only. Switch to Scientific Engine for genuine mathematical image restoration.',
          isDemonstration: true,
        },
      };

      return res.status(200).json(demoResult);
    }

    // 2. Validate file presence
    if (!file) {
      return res.status(400).json({
        error: 'No image file uploaded. Please select a valid JPEG, PNG, WebP, or FITS file.',
        code: 'NO_FILE',
      });
    }

    let processingBuffer = file.buffer;
    let isFits = false;

    // 3. FITS Astronomical Format Handling
    if (isFitsFile(file.buffer, file.originalname)) {
      console.log(`[RESTORATION-DOJO] Astronomical FITS file detected: ${file.originalname}`);
      try {
        const fitsResult = await parseAndConvertFits(file.buffer);
        processingBuffer = fitsResult.imageBuffer;
        isFits = true;
      } catch (fitsErr: any) {
        console.error('[RESTORATION-DOJO] FITS parsing error:', fitsErr);
        return res.status(422).json({
          error: `Astronomical FITS parsing failed: ${fitsErr.message || 'Invalid HDU block structure'}`,
          code: 'FITS_PARSE_ERROR',
        });
      }
    }

    // 4. Execute Selected Restoration Mode
    if (bodyMode === 'ai') {
      try {
        const aiResult = await performPretrainedAiRestoration(processingBuffer, {
          parameters: parsedParameters,
          filename: file.originalname,
          isFits,
        });
        return res.status(200).json(aiResult);
      } catch (aiErr: any) {
        console.warn('[RESTORATION-DOJO] AI Model request failed or not configured, falling back to Scientific Engine:', aiErr.message);
        // Fall back to Scientific Engine so user gets genuine restoration even if cloud API is offline
        const scientificFallback = await performScientificRestoration(processingBuffer, {
          parameters: parsedParameters,
          filename: file.originalname,
          isFits,
        });
        scientificFallback.alchemistNotes += ` (Notice: Cloud AI endpoint unavailable [${aiErr.message}]. Successfully processed with built-in Scientific PSF Engine).`;
        return res.status(200).json(scientificFallback);
      }
    } else {
      // Default & Primary: Genuine Scientific Astronomical Image Engine
      const restorationResult = await performScientificRestoration(processingBuffer, {
        parameters: parsedParameters,
        filename: file.originalname,
        isFits,
      });

      return res.status(200).json(restorationResult);
    }
  } catch (error: any) {
    console.error('[RESTORATION-DOJO] Internal Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process celestial image restoration.',
      code: 'RESTORATION_ERROR',
    });
  }
});
