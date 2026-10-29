// src/features/spirit-lens/objectDetection.ts
import { CelestialDetection } from '../../types';

export const detectCelestialObjects = async (_imageUrl: string): Promise<CelestialDetection[]> => {
  // Simulating the time it takes for a computer vision model to process the image
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: `det-${Date.now()}-1`,
          label: "Orion's Belt (Mitsuboshi)",
          japaneseLabel: '三つ星 (Mitsuboshi)',
          celestialClass: 'constellation',
          confidence: 0.98,
          bbox: { x: 0.42, y: 0.44, width: 0.22, height: 0.14 },
          colorHex: '#e5b959',
          distanceLightYears: 1200,
          astronomicalNotes: 'Alnitak, Alnilam, and Mintaka - supergiant stars illuminating Orion.',
          samuraiConstellationLore: 'Adopted as the samurai crest (Kamon) of the legendary Mōri clan, symbolizing unshakeable martial brotherhood.',
        },
        {
          id: `det-${Date.now()}-2`,
          label: 'Orion Nebula (M42)',
          japaneseLabel: 'オリオン大星雲',
          celestialClass: 'nebula',
          confidence: 0.94,
          bbox: { x: 0.46, y: 0.62, width: 0.16, height: 0.18 },
          colorHex: '#d63c3c',
          distanceLightYears: 1344,
          astronomicalNotes: 'Massive diffuse stellar nursery glowing with ionized hydrogen emission.',
          samuraiConstellationLore: 'Regarded in samurai lore as the scabbard jewel of the warrior god, glowing with ethereal fire.',
        }
      ]);
    }, 1500); // 1.5 second simulated AI processing delay
  });
};