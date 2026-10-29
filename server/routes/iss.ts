import { Router, Request, Response } from 'express';
import { ISSLocation, ISSPassPrediction } from '../../src/types';

export const issRouter = Router();

/**
 * GET /api/iss/current
 * Returns current telemetry for the ISS orbital citadel
 */
issRouter.get('/current', (_req: Request, res: Response) => {
  // Simulated orbital movement based on timestamp
  const now = Date.now();
  const baseLat = 35.6762;
  const baseLon = 139.6503;
  
  // Slight orbital drift for live testing
  const drift = (Math.sin(now / 10000) * 2.5);

  const currentLocation: ISSLocation = {
    latitude: +(baseLat + drift).toFixed(4),
    longitude: +(baseLon + (now % 360000) / 1000).toFixed(4),
    altitudeKm: +(418.2 + Math.cos(now / 15000) * 3).toFixed(1),
    velocityKmh: 27580,
    timestamp: now,
    visibility: 'visible',
    footprintRadiusKm: 2200,
    currentConstellation: 'Ursa Major (北斗七星 - Hokuto Shichisei)',
  };

  res.json(currentLocation);
});

/**
 * GET /api/iss/passes
 * Returns upcoming flyover predictions across samurai watchposts
 */
issRouter.get('/passes', (_req: Request, res: Response) => {
  const predictions: ISSPassPrediction[] = [
    {
      id: 'pass-edo-01',
      risetime: '21:42 JST (+12m)',
      durationSeconds: 380,
      maxElevationDeg: 68,
      approachDirection: 'WSW (西西南)',
      departureDirection: 'ENE (東東北)',
      brightnessMagnitude: -3.2,
      visibleUnderSky: true,
      samuraiWatchpost: 'Edo Castle Watchtower (江戸城天守台)',
    },
    {
      id: 'pass-fuji-02',
      risetime: '23:18 JST (+1h 48m)',
      durationSeconds: 290,
      maxElevationDeg: 42,
      approachDirection: 'W (西)',
      departureDirection: 'NE (北東)',
      brightnessMagnitude: -2.1,
      visibleUnderSky: true,
      samuraiWatchpost: 'Mount Fuji Stargazing Ridge (富士山星見峠)',
    },
    {
      id: 'pass-kyoto-03',
      risetime: '00:54 JST (+3h 24m)',
      durationSeconds: 320,
      maxElevationDeg: 55,
      approachDirection: 'SW (南西)',
      departureDirection: 'ENE (東東北)',
      brightnessMagnitude: -2.7,
      visibleUnderSky: true,
      samuraiWatchpost: 'Kyoto Heian Imperial Citadel (京都平安楼)',
    },
  ];

  res.json(predictions);
});
