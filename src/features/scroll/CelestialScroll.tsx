import React, { useMemo } from 'react';
import SunCalc from 'suncalc';
import { Moon, Calendar, Scroll, Sparkles, Feather, ShieldAlert, Star } from 'lucide-react';
import { CelestialEvent, MoonPhaseInfo } from '../../types';

export const CelestialScroll: React.FC = () => {
  // Calculate real-time moon phase using SunCalc
  const moonData: MoonPhaseInfo = useMemo(() => {
    const now = new Date();
    const illumination = SunCalc.getMoonIllumination(now);
    
    // Map phase (0.0 - 1.0) to Japanese classical lunar terms & samurai tactics
    const p = illumination.phase;
    let phaseName = 'New Moon';
    let phaseJapanese = '新月 (Shingetsu)';
    let samuraiGuardTactic = 'Total celestial obscurity. Prime conditions for silent night reconnaissance and covert shinobi infiltration.';

    if (p >= 0.03 && p < 0.22) {
      phaseName = 'Waxing Crescent';
      phaseJapanese = '三日月 (Mikazuki)';
      samuraiGuardTactic = 'The slender crescent blade reflects faint glimmer. Maintain keen watch on the western perimeter walls.';
    } else if (p >= 0.22 && p < 0.28) {
      phaseName = 'First Quarter';
      phaseJapanese = '上弦の月 (Jōgen no Tsuki)';
      samuraiGuardTactic = 'Half-light illumination. Archers positioned on upper pagoda balconies hold strategic range.';
    } else if (p >= 0.28 && p < 0.47) {
      phaseName = 'Waxing Gibbous';
      phaseJapanese = '十三夜 (Jūsanya)';
      samuraiGuardTactic = 'Brightening skies reveal castle moat approaches. Guard patrols double their vigilance.';
    } else if (p >= 0.47 && p < 0.53) {
      phaseName = 'Full Moon';
      phaseJapanese = '望月 (Mochizuki / 満月)';
      samuraiGuardTactic = 'The radiant eye of Tsukuyomi bathes the battlefield in silver. Stealth is impossible; open samurai honor prevails.';
    } else if (p >= 0.53 && p < 0.72) {
      phaseName = 'Waning Gibbous';
      phaseJapanese = '十六夜 (Izayoi)';
      samuraiGuardTactic = 'Luminescence begins its retreat. Sentinels must mind the deepening shadows in the forest trails.';
    } else if (p >= 0.72 && p < 0.78) {
      phaseName = 'Third Quarter';
      phaseJapanese = '下弦の月 (Kagen no Tsuki)';
      samuraiGuardTactic = 'Late rising moon leaves early night in pitch void. Ideal for moving supply caravans under darkness.';
    } else if (p >= 0.78 && p < 0.97) {
      phaseName = 'Waning Crescent';
      phaseJapanese = '有明の月 (Ariake no Tsuki)';
      samuraiGuardTactic = 'Dawn approaches with a pale blade in the eastern sky. Dawn-break sword katas commence.';
    }

    return {
      fraction: illumination.fraction,
      phase: illumination.phase,
      phaseName,
      phaseJapanese,
      ageDays: +(illumination.phase * 29.53).toFixed(1),
      angleRadians: illumination.angle,
      moonrise: '18:14 JST',
      moonset: '06:48 JST',
      samuraiGuardTactic,
    };
  }, []);

  const upcomingEvents: CelestialEvent[] = [
    {
      id: 'event-01',
      title: 'Taurus Meteor Stream (The Bull’s Arrow Shower)',
      titleJapanese: '牡牛座流星群',
      type: 'meteor_shower',
      timestamp: '2026-11-04T22:00:00Z',
      peakTime: '01:30 JST',
      magnitude: -2.0,
      description: 'Slow, luminous fireballs streaking through the Pleiades cluster.',
      samuraiLore: 'Legend holds that every fireball marks an arrow released by celestial samurai archers guarding the western heaven.',
      significance: 'auspicious',
    },
    {
      id: 'event-02',
      title: 'Moon & Jupiter Great Conjunction',
      titleJapanese: '月と木星の大合',
      type: 'conjunction',
      timestamp: '2026-11-12T19:30:00Z',
      peakTime: '20:15 JST',
      magnitude: -2.8,
      description: 'The crescent moon pairs within 2 degrees of brilliant Jupiter in the evening sky.',
      samuraiLore: 'Revered as the alignment of the Silver Sword and the Emperor’s Jade Banner, denoting good fortune in strategic plans.',
      significance: 'legendary',
    },
    {
      id: 'event-03',
      title: 'Leonid Fireball Zenith',
      titleJapanese: '獅子座流星群',
      type: 'meteor_shower',
      timestamp: '2026-11-17T23:00:00Z',
      peakTime: '03:00 JST',
      magnitude: -1.5,
      description: 'High-velocity green streaks radiating from the sickle of Leo.',
      samuraiLore: 'Ancient texts advise sharpening all katana blades under the Leonid shower to imbue steel with celestial heat.',
      significance: 'auspicious',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="sumi-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="hanko-seal">天巻</span>
              <span className="gold-badge">
                <Scroll size={12} />
                LUNAR EPHEMERIS & ANCIENT CHRONICLES
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
              Celestial Scroll <span style={{ color: 'var(--gold-moon)', fontWeight: 400 }}>| 天文巻物</span>
            </h1>
            <p style={{ maxWidth: '720px', fontSize: '0.92rem' }}>
              Consult the sacred ephemeris governed by Tsukuyomi-no-Mikoto, Kami of the Moon. Real-time
              mathematical calculation of lunar phase, illuminated fraction, and celestial chronicles.
            </p>
          </div>

          <div className="gold-badge" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <Calendar size={16} />
            <span>Ephemeris: 2026 Season</span>
          </div>
        </div>
      </div>

      {/* Main Lunar Card calculated with SunCalc */}
      <div className="sumi-card" style={{ border: '1px solid var(--gold-moon)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
          {/* Moon Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
            <div
              style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #ffd475 0%, #d4af37 60%, #1a1508 100%)',
                boxShadow: '0 0 40px rgba(229, 185, 89, 0.35), inset -10px -10px 30px rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(229, 185, 89, 0.6)',
              }}
            >
              <Moon size={48} color="#07080b" style={{ opacity: 0.25 }} />
            </div>

            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gold-moon-bright)' }}>
                {moonData.phaseJapanese}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--washi-silk)' }}>
                {moonData.phaseName} • Moon Age: {moonData.ageDays} days
              </div>
            </div>
          </div>

          {/* SunCalc Mathematical Telemetry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="metric-pill">
                <span className="label">Illumination Fraction</span>
                <span className="value">{(moonData.fraction * 100).toFixed(1)}%</span>
              </div>
              <div className="metric-pill">
                <span className="label">Phase Value (SunCalc)</span>
                <span className="value">{moonData.phase.toFixed(3)}</span>
              </div>
              <div className="metric-pill">
                <span className="label">Observed Moonrise</span>
                <span className="value" style={{ fontSize: '1rem' }}>{moonData.moonrise}</span>
              </div>
              <div className="metric-pill">
                <span className="label">Observed Moonset</span>
                <span className="value" style={{ fontSize: '1rem' }}>{moonData.moonset}</span>
              </div>
            </div>

            {/* Samurai Guard Tactic for the phase */}
            <div
              style={{
                background: 'rgba(7, 8, 11, 0.75)',
                border: '1px solid var(--border-delicate)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <ShieldAlert size={18} color="var(--vermilion)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--vermilion-bright)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Samurai Night Directive
                </strong>
                <p style={{ fontSize: '0.82rem', marginTop: '4px', color: 'var(--washi-silk)' }}>
                  {moonData.samuraiGuardTactic}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Celestial Events Scroll */}
      <div className="sumi-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Sparkles size={18} color="var(--gold-moon)" />
          <h3 style={{ fontSize: '1.1rem' }}>Upcoming Celestial Alignments & Lore</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              style={{
                background: 'rgba(13, 15, 21, 0.7)',
                border: '1px solid var(--border-ink)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <Star size={14} color="var(--gold-moon)" />
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--washi-white)', fontSize: '1rem' }}>
                    {event.title}
                  </span>
                  <span style={{ color: 'var(--gold-moon)', fontSize: '0.85rem' }}>{event.titleJapanese}</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--washi-silk)', marginBottom: '6px' }}>
                  {event.description}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--washi-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Feather size={12} color="var(--vermilion)" />
                  <span>{event.samuraiLore}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span className="hanko-seal" style={{ fontSize: '0.68rem' }}>
                  {event.significance}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gold-moon-bright)' }}>
                  Peak: {event.peakTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
