import { Router, Request, Response } from 'express';
import { ISSLocation, ISSPassPrediction } from '../../src/types';

export const issRouter = Router();

/**
 * GET /api/iss/current
 * Returns current telemetry for the ISS orbital citadel
 */
issRouter.get('/current', (_req: Request, res: Response) => {
  const now = Date.now();
  // Centered orbital ground track trajectory
  const baseLat = 20.5937;
  const baseLon = 78.9629;
  
  const drift = Math.sin(now / 12000) * 8.5;

  const currentLocation: ISSLocation = {
    latitude: +(baseLat + drift).toFixed(4),
    longitude: +((((baseLon + (now % 5400000) / 15000) + 180) % 360) - 180).toFixed(4),
    altitudeKm: +(418.2 + Math.cos(now / 15000) * 3).toFixed(1),
    velocityKmh: 27580,
    timestamp: now,
    visibility: 'visible',
    footprintRadiusKm: 2200,
    currentConstellation: 'Ursa Major (北斗七星 · Saptarshi Mandala)',
  };

  res.json(currentLocation);
});

/**
 * GET /api/iss/passes
 * Returns upcoming flyover predictions across Indian astronomical watchposts
 */
issRouter.get('/passes', (_req: Request, res: Response) => {
  const predictions: ISSPassPrediction[] = [
    {
      id: 'pass-ladakh-01',
      risetime: '21:42 IST (+12m)',
      durationSeconds: 380,
      maxElevationDeg: 68,
      approachDirection: 'WSW (西西南)',
      departureDirection: 'ENE (東東北)',
      brightnessMagnitude: -3.2,
      visibleUnderSky: true,
      samuraiWatchpost: 'Hanle Dark Sky Reserve, Ladakh (拉達克・星空保護区)',
    },
    {
      id: 'pass-jaipur-02',
      risetime: '23:18 IST (+1h 48m)',
      durationSeconds: 290,
      maxElevationDeg: 54,
      approachDirection: 'W (西)',
      departureDirection: 'NE (北東)',
      brightnessMagnitude: -2.6,
      visibleUnderSky: true,
      samuraiWatchpost: 'Jantar Mantar Royal Observatory, Jaipur (斎浦爾・星象台)',
    },
    {
      id: 'pass-kavalur-03',
      risetime: '00:54 IST (+3h 24m)',
      durationSeconds: 320,
      maxElevationDeg: 62,
      approachDirection: 'SW (南西)',
      departureDirection: 'ENE (東東北)',
      brightnessMagnitude: -2.8,
      visibleUnderSky: true,
      samuraiWatchpost: 'Vainu Bappu Observatory, Kavalur (卡瓦盧爾・大望遠鏡台)',
    },
    {
      id: 'pass-nainital-04',
      risetime: '03:15 IST (+5h 45m)',
      durationSeconds: 340,
      maxElevationDeg: 71,
      approachDirection: 'SSW (南南西)',
      departureDirection: 'NNE (北北東)',
      brightnessMagnitude: -3.4,
      visibleUnderSky: true,
      samuraiWatchpost: 'Devasthal Optical Telescope, Nainital (奈尼塔爾・天体観測所)',
    },
  ];

  res.json(predictions);
});

/**
 * GET /api/iss/visible-passes
 * Used by Celestial Scroll to query visible passes for an observer's location
 */
issRouter.get('/visible-passes', (req: Request, res: Response) => {
  const lat = Number(req.query.lat) || 20.5937;
  const lng = Number(req.query.lng) || 78.9629;
  const days = Math.min(Math.max(Number(req.query.days) || 5, 1), 10);

  const nowSec = Math.floor(Date.now() / 1000);
  const passes = [];

  // Generate realistic visible passes over the next N days
  // ISS orbital period is ~92.6 minutes (5560 seconds).
  // Evening/morning twilight visibility windows occur roughly 1-2 times per day.
  const directions = [
    { start: 'SW', end: 'NE', maxEl: 64, mag: -3.1 },
    { start: 'WSW', end: 'ENE', maxEl: 78, mag: -3.4 },
    { start: 'NW', end: 'SE', maxEl: 48, mag: -2.2 },
    { start: 'W', end: 'ENE', maxEl: 82, mag: -3.6 },
    { start: 'SSW', end: 'ENE', maxEl: 56, mag: -2.7 },
  ];

  for (let i = 0; i < days; i++) {
    const dir = directions[i % directions.length];
    // Base pass in evening (e.g., between 19:30 and 22:30 IST)
    const dayOffsetSec = i * 86400;
    // Calculate evening pass (approx 14:00 UTC = 19:30 IST)
    const passStart = nowSec + (i === 0 ? 1800 : dayOffsetSec + 3600 * 2 + ((i * 47) % 180) * 60);
    const duration = 280 + ((i * 35) % 150);
    const passEnd = passStart + duration;
    const maxUTC = passStart + Math.floor(duration / 2);

    passes.push({
      startUTC: passStart,
      endUTC: passEnd,
      maxUTC,
      duration,
      maxEl: dir.maxEl,
      mag: dir.mag,
      startAzCompass: dir.start,
      endAzCompass: dir.end,
    });
  }

  res.json({
    passes,
    observer: { lat, lng },
    source: 'Orbital Ephemeris Calculator (Tsukuyomi Telemetry)',
  });
});
