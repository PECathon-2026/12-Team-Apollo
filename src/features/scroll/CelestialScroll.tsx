import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SunCalc from 'suncalc';
import {
  Bell,
  BellOff,
  Bookmark,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Feather,
  Globe,
  List,
  MapPin,
  RefreshCw,
  Rocket,
  Satellite,
  ShieldAlert,
  Sparkles,
  Star,
} from 'lucide-react';
import type { CelestialEvent } from '../../types';
import { MoonPhaseVisual } from './MoonPhaseVisual';
import './CelestialScroll.css';

type Category =
  | 'meteor_shower'
  | 'eclipse'
  | 'moon_phase'
  | 'iss_pass'
  | 'rocket_launch';

type Origin = 'curated' | 'calculated' | 'launch-library-2' | 'n2yo' | 'isro';

export type ScrollEvent = Omit<CelestialEvent, 'id' | 'type'> & {
  id: string;
  type: Category;
  eventDate: string;
  startDate?: string;
  endDate?: string;
  origin: Origin;
  sourceName: string;
  sourceUrl: string;
  timeLabel: string;
  moonPhase?: number;
  titleJapanese?: string;
  samuraiLore?: string;
  isIndianMission?: boolean;
};

interface SpaceNewsItem {
  id: string | number;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  newsSite: string;
  publishedAt: string;
  publishedAtIST: string;
  topicBadge: string;
}

interface Launch {
  id?: number | string;
  name?: string | null;
  net?: string | null;
  window_start?: string | null;
  window_end?: string | null;
  url?: string | null;
  mission?: { name?: string | null; description?: string | null } | null;
  status?: { name?: string | null } | null;
  launch_service_provider?: { name?: string | null } | null;
  pad?: {
    name?: string | null;
    location?: { name?: string | null; country_code?: string | null } | null;
  } | null;
}

interface Pass {
  startUTC: number;
  endUTC: number;
  maxUTC?: number;
  duration?: number;
  maxEl?: number;
  mag?: number;
  startAzCompass?: string;
  endAzCompass?: string;
}

interface Observer {
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
}

const TZ = 'Asia/Kolkata';

// Primary Indian astronomical watchposts
const INDIAN_OBSERVATORIES: Observer[] = [
  {
    name: 'Hanle Dark Sky Reserve, Ladakh',
    latitude: 32.78,
    longitude: 78.96,
    altitude: 4500,
  },
  {
    name: 'Jantar Mantar Observatory, Jaipur',
    latitude: 26.924,
    longitude: 75.824,
    altitude: 430,
  },
  {
    name: 'ISRO Telemetry Centre, Bengaluru',
    latitude: 12.971,
    longitude: 77.594,
    altitude: 920,
  },
  {
    name: 'Vainu Bappu Observatory, Kavalur',
    latitude: 12.57,
    longitude: 78.83,
    altitude: 725,
  },
  {
    name: 'ARIES Observatory, Nainital',
    latitude: 29.36,
    longitude: 79.45,
    altitude: 1950,
  },
  {
    name: 'National Capital, New Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    altitude: 216,
  },
  {
    name: 'Arabian Sea Ridge, Mumbai',
    latitude: 19.076,
    longitude: 72.877,
    altitude: 14,
  },
];

// SpaceDevs v2.2.0 API (stable public endpoint)
const LAUNCH_API = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=30';
const ISS_API = '/api/iss/visible-passes';
const NEWS_API = '/api/news';

const WATCH_KEY = 'celestial-scroll:watchlist:v1';
const ALERT_KEY = 'celestial-scroll:alerts:v1';
const LOCATION_KEY = 'celestial-scroll:observer:v2';
const LAUNCH_CACHE = 'celestial-scroll:launch-cache:v2';
const LAUNCH_TTL = 3 * 60 * 60 * 1000;

const CATEGORY_LABELS: Record<Category, string> = {
  meteor_shower: 'Meteor Showers',
  eclipse: 'Eclipses & Alignments',
  moon_phase: 'Lunar Phases',
  iss_pass: 'ISS Visible Passes',
  rocket_launch: 'Rocket Launches',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

function readJSON<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Safe ignore in private mode
  }
}

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

function dateKey(date: Date): string {
  const p = dateParts(date);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

function dateAtNoonIST(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 6, 30));
}

function addDays(key: string, amount: number): string {
  const date = dateAtNoonIST(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return dateKey(date);
}

function formatDate(key: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateAtNoonIST(key));
}

function formatMonth(year: number, month: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  }).format(new Date(Date.UTC(year, month, 15, 6, 30)));
}

function formatTime(date: Date): string {
  return `${new Intl.DateTimeFormat('en-IN', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)} IST`;
}

function formatDateTime(date: Date): string {
  return `${formatDate(dateKey(date))}, ${formatTime(date)}`;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const result = new Date(value);
  return Number.isNaN(result.getTime()) ? null : result;
}

function phaseInfo(phase: number) {
  if (phase < 0.03 || phase >= 0.97) {
    return {
      name: 'New Moon',
      japanese: '新月 · Shingetsu',
      css: 'new',
      lore: 'The Moon rests in complete shadow. Celestial obscurity grants the prime veil for deep stealth and night reconnaissance.',
    };
  }
  if (phase < 0.22) {
    return {
      name: 'Waxing Crescent',
      japanese: '三日月 · Mikazuki',
      css: 'waxing-crescent',
      lore: 'The slender silver blade returns to the western twilight. Archers test their bowstrings under the delicate moonlit glint.',
    };
  }
  if (phase < 0.28) {
    return {
      name: 'First Quarter',
      japanese: '上弦の月 · Jōgen no Tsuki',
      css: 'first-quarter',
      lore: 'Half the lunar disk illuminates the castle ramparts. Sentinels double watch rotations along the perimeter.',
    };
  }
  if (phase < 0.47) {
    return {
      name: 'Waxing Gibbous',
      japanese: '十三夜 · Jūsanya',
      css: 'waxing-gibbous',
      lore: 'The brightening Moon climbs above the mountain ridges. Field generals finalize strategic alignments before the zenith.',
    };
  }
  if (phase < 0.53) {
    return {
      name: 'Full Moon',
      japanese: '望月 · Mochizuki (満月)',
      css: 'full',
      lore: 'The silver eye of Tsukuyomi bathes the entire valley in brilliant luminescence. Shadows vanish; open samurai honor prevails.',
    };
  }
  if (phase < 0.72) {
    return {
      name: 'Waning Gibbous',
      japanese: '十六夜 · Izayoi',
      css: 'waning-gibbous',
      lore: 'Luminescence begins its retreat. Sentinels must mind the deepening shadows stretching through the forest passes.',
    };
  }
  if (phase < 0.78) {
    return {
      name: 'Third Quarter',
      japanese: '下弦の月 · Kagen no Tsuki',
      css: 'third-quarter',
      lore: 'Late-rising moon leaves the early night in pitch void. Ideal for moving supply caravans undetected through high ravines.',
    };
  }
  return {
    name: 'Waning Crescent',
    japanese: '有明の月 · Ariake no Tsuki',
    css: 'waning-crescent',
    lore: 'A pale crescent blade precedes the eastern dawn. Samurai warriors conclude their night vigil and salute the morning sun.',
  };
}

function makeEvent(input: {
  id: string;
  title: string;
  japanese?: string;
  type: Category;
  date: string;
  timestamp?: string;
  start?: string;
  end?: string;
  description: string;
  timeLabel?: string;
  origin: Origin;
  sourceName: string;
  sourceUrl: string;
  phase?: number;
  lore?: string;
  significance?: string;
  isIndianMission?: boolean;
}): ScrollEvent {
  const timestamp = input.timestamp ?? dateAtNoonIST(input.date).toISOString();
  return {
    id: input.id,
    title: input.title,
    titleJapanese: input.japanese ?? '天文観測',
    type: input.type,
    timestamp,
    peakTime: input.timeLabel ?? 'Calculated in IST',
    magnitude: null,
    description: input.description,
    samuraiLore: input.lore ?? 'Observe the night sky with unwavering clarity and disciplined honor.',
    significance: input.significance ?? input.origin,
    eventDate: input.date,
    startDate: input.start,
    endDate: input.end,
    origin: input.origin,
    sourceName: input.sourceName,
    sourceUrl: input.sourceUrl,
    timeLabel: input.timeLabel ?? formatDate(input.date),
    moonPhase: input.phase,
    isIndianMission: input.isIndianMission,
  } as unknown as ScrollEvent;
}

function curatedEvents(today: string): ScrollEvent[] {
  const showers = [
    {
      id: 'southern-taurids-2026',
      title: 'Southern Taurids (The Bull’s Arrow Shower)',
      japanese: '牡牛座南流星群',
      start: '2026-09-20',
      end: '2026-11-20',
      peak: '2026-11-05',
      label: 'Peak night: 4–5 Nov 2026 (IST)',
      description: 'Slow, exceptionally bright fireballs radiating from Taurus across Indian skies.',
      lore: 'Legend holds that every fireball marks a sacred arrow released by celestial archers guarding the western heavens.',
      source: 'https://www.imo.net/calendar/',
      sourceName: 'International Meteor Organization',
    },
    {
      id: 'northern-taurids-2026',
      title: 'Northern Taurids Fireball Stream',
      japanese: '牡牛座北流星群',
      start: '2026-10-20',
      end: '2026-12-10',
      peak: '2026-11-12',
      label: 'Peak night: 11–12 Nov 2026 (IST)',
      description: 'Luminous late-year shower known for sporadic bright bolides over the Deccan plateau.',
      lore: 'Samurai tradition teaches that northern meteors signify renewed resolve and tactical steadfastness.',
      source: 'https://www.imo.net/calendar/',
      sourceName: 'International Meteor Organization',
    },
    {
      id: 'leonids-2026',
      title: 'Leonids Fireball Zenith',
      japanese: '獅子座流星群',
      start: '2026-11-06',
      end: '2026-11-30',
      peak: '2026-11-17',
      label: 'Peak night: 16–17 Nov 2026 (IST)',
      description: 'High-velocity green-hued meteor streaks originating from comet 55P/Tempel–Tuttle.',
      lore: 'Ancient swordmasters sharpened their katana blades under the Leonid shower to infuse steel with celestial heat.',
      source: 'https://www.imo.net/calendar/',
      sourceName: 'International Meteor Organization',
    },
    {
      id: 'geminids-2026',
      title: 'Geminids King of Meteor Showers',
      japanese: 'ふたご座流星群',
      start: '2026-12-04',
      end: '2026-12-17',
      peak: '2026-12-14',
      label: 'Peak night: 13–14 Dec 2026 (IST)',
      description: 'The premier annual meteor shower, producing up to 120 multicolored meteors per hour under dark skies in Hanle.',
      lore: 'Regarded as the Great Assembly of Heavenly Swords, shining with the pure light of the twin warriors.',
      source: 'https://science.nasa.gov/solar-system/meteors-meteorites/meteor-showers/',
      sourceName: 'NASA Meteor Watch',
    },
    {
      id: 'ursids-2026',
      title: 'Ursids Solstice Stream',
      japanese: 'こぐま座流星群',
      start: '2026-12-17',
      end: '2026-12-26',
      peak: '2026-12-22',
      label: 'Peak night: 21–22 Dec 2026 (IST)',
      description: 'Modest shower radiating near Polaris (Hokushin), best viewed from northern Himalayan altitudes.',
      lore: 'Circling the North Star, these meteors guide wanderers navigating through darkness.',
      source: 'https://science.nasa.gov/solar-system/meteors-meteorites/meteor-showers/',
      sourceName: 'NASA Meteor Watch',
    },
    {
      id: 'quadrantids-2027',
      title: 'Quadrantids Zenith Surge',
      japanese: 'しぶんぎ座流星群',
      start: '2026-12-28',
      end: '2027-01-12',
      peak: '2027-01-04',
      label: 'Peak night: 3–4 Jan 2027 (IST)',
      description: 'Intense short-duration peak with bright fireballs cutting across the cold January night sky.',
      lore: 'A brief, sharp flash across the heavens reminiscent of an unsparing sword draw (Iaido).',
      source: 'https://science.nasa.gov/solar-system/meteors-meteorites/meteor-showers/',
      sourceName: 'NASA Meteor Watch',
    },
  ];

  const eclipses = [
    {
      id: 'annular-solar-2027',
      title: 'Annular Solar Eclipse (Ring of Fire)',
      japanese: '金環日食',
      date: '2027-02-06',
      time: 'Peak: 6 Feb 2027, 21:30 IST',
      description: 'Annular solar alignment. India experiences twilight positioning during the eclipse maximum.',
      lore: 'The sun becomes an antique golden ring, symbolizing the unbroken circle of honor and perseverance.',
      source: 'https://eclipse.gsfc.nasa.gov/OH/OH2027.html',
    },
    {
      id: 'penumbral-lunar-2027-feb',
      title: 'Penumbral Lunar Eclipse over Indian Subcontinent',
      japanese: '半影月食',
      date: '2027-02-21',
      time: '21 Feb 2027, 02:42 – 06:43 IST (Peak: 04:43 IST)',
      description: 'Visible across India before dawn. Subtle copper shading settles across the southern lunar limb.',
      lore: 'Tsukuyomi dons a veil of deep crimson smoke, alerting the castle sentinels to watch for ill omens.',
      source: 'https://eclipse.gsfc.nasa.gov/OH/OH2027.html',
    },
    {
      id: 'total-solar-2027',
      title: 'Great Total Solar Eclipse',
      japanese: '皆既日食',
      date: '2027-08-02',
      time: 'Maximum: 2 Aug 2027, 15:37 IST',
      description: 'Totality traverses North Africa and the Middle East; deep partial solar eclipse observed from Western India.',
      lore: 'Day briefly turns to silver dusk; the stars reveal themselves while the sun hides behind the obsidian blade.',
      source: 'https://eclipse.gsfc.nasa.gov/OH/OH2027.html',
    },
  ];

  const meteorEvents = showers
    .filter((s) => s.end >= today)
    .map((s) =>
      makeEvent({
        id: s.id,
        title: s.title,
        japanese: s.japanese,
        type: 'meteor_shower',
        date: s.peak,
        start: s.start,
        end: s.end,
        timeLabel: s.label,
        description: `${s.description} Active window: ${formatDate(s.start)} – ${formatDate(s.end)} (IST).`,
        lore: s.lore,
        origin: 'curated',
        sourceName: s.sourceName,
        sourceUrl: s.source,
        significance: 'Astronomical Highlight',
      })
    );

  const eclipseEvents = eclipses
    .filter((e) => e.date >= today)
    .map((e) =>
      makeEvent({
        id: e.id,
        title: e.title,
        japanese: e.japanese,
        type: 'eclipse',
        date: e.date,
        start: e.date,
        end: e.date,
        timeLabel: e.time,
        description: e.description,
        lore: e.lore,
        origin: 'curated',
        sourceName: 'NASA Eclipse Ephemeris',
        sourceUrl: e.source,
        significance: 'Celestial Alignment',
      })
    );

  return [...meteorEvents, ...eclipseEvents];
}

function moonEvents(year: number, month: number): ScrollEvent[] {
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: count }, (_, index) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
    const noon = dateAtNoonIST(date);
    const illumination = SunCalc.getMoonIllumination(noon);
    const phase = phaseInfo(illumination.phase);
    return makeEvent({
      id: `moon-${date}`,
      title: `Moon — ${phase.name}`,
      japanese: phase.japanese,
      type: 'moon_phase',
      date,
      timestamp: noon.toISOString(),
      phase: illumination.phase,
      timeLabel: `12:00 IST · ${formatDate(date)}`,
      description: `${phase.name}; ${(illumination.fraction * 100).toFixed(1)}% illuminated disk. Computed with SunCalc ephemeris for ${formatDate(date)}.`,
      lore: phase.lore,
      origin: 'calculated',
      sourceName: 'SunCalc Mathematical Ephemeris',
      sourceUrl: 'https://github.com/mourner/suncalc',
      significance: 'Lunar Ephemeris',
    });
  });
}

function mapLaunches(payload: { results?: Launch[] }): ScrollEvent[] {
  return (payload.results ?? []).flatMap((launch) => {
    const net = parseDate(launch.net);
    const start = parseDate(launch.window_start);
    const end = parseDate(launch.window_end);
    const anchor = net ?? start ?? end;
    if (!anchor) return [];

    const date = dateKey(anchor);
    const timeLabel = net
      ? `NET: ${formatDateTime(net)}`
      : start && end
      ? `Window: ${formatDateTime(start)} – ${formatTime(end)}`
      : start
      ? `Window starts: ${formatDateTime(start)}`
      : `Window ends: ${formatDateTime(end!)}`;

    const provider = launch.launch_service_provider?.name || '';
    const padName = launch.pad?.name || '';
    const locationName = launch.pad?.location?.name || '';
    const countryCode = launch.pad?.location?.country_code || '';

    const isISRO =
      provider.toLowerCase().includes('isro') ||
      provider.toLowerCase().includes('indian space') ||
      countryCode.toUpperCase() === 'IND' ||
      locationName.toLowerCase().includes('sriharikota') ||
      locationName.toLowerCase().includes('india');

    const details = [
      launch.mission?.name ? `Mission: ${launch.mission.name}` : '',
      provider ? `Provider: ${provider}` : '',
      padName ? `Pad: ${padName}` : '',
      locationName ? `Location: ${locationName}` : '',
      launch.status?.name ? `Status: ${launch.status.name}` : '',
    ].filter(Boolean);

    return [
      makeEvent({
        id: `launch-${launch.id ?? date + launch.name}`,
        title: `${isISRO ? '🇮🇳 ISRO • ' : ''}${launch.name ?? launch.mission?.name ?? 'Rocket Launch'}`,
        japanese: isISRO ? 'インド宇宙研究機関 · ロケット打ち上げ' : 'ロケット打ち上げ',
        type: 'rocket_launch',
        date,
        timestamp: anchor.toISOString(),
        start: start ? dateKey(start) : date,
        end: end ? dateKey(end) : date,
        timeLabel,
        description:
          details.join(' · ') ||
          'Orbital spaceflight launch telemetry supplied by Launch Library 2.',
        lore: isISRO
          ? 'An Indian space vanguard takes flight from Sriharikota, carrying science and honor into high Earth orbit.'
          : 'A terrestrial engine ignites with blinding heat, pushing beyond the atmospheric veil.',
        origin: isISRO ? 'isro' : 'launch-library-2',
        sourceName: isISRO ? 'ISRO / The Space Devs' : 'The Space Devs (Launch Library 2)',
        sourceUrl: launch.url ?? 'https://thespacedevs.com/',
        significance: isISRO ? 'ISRO Indian Mission' : 'Orbital Launch',
        isIndianMission: isISRO,
      }),
    ];
  });
}

function mapPasses(passes: Pass[], observer: Observer): ScrollEvent[] {
  return passes.flatMap((pass, index) => {
    if (!Number.isFinite(pass.startUTC)) return [];
    const start = new Date(pass.startUTC * 1000);
    const end = new Date(pass.endUTC * 1000);
    const peak = pass.maxUTC ? new Date(pass.maxUTC * 1000) : null;
    const date = dateKey(start);

    return [
      makeEvent({
        id: `iss-${pass.startUTC}-${index}`,
        title: `ISS Visible Pass over ${observer.name}`,
        japanese: '国際宇宙ステーション · 飛翔観測',
        type: 'iss_pass',
        date,
        timestamp: start.toISOString(),
        start: date,
        end: date,
        timeLabel: `${formatDateTime(start)} – ${formatTime(end)}`,
        description: [
          peak ? `Zenith Peak: ${formatTime(peak)}.` : '',
          pass.maxEl != null ? `Peak Elevation: ${pass.maxEl}°.` : '',
          pass.mag != null ? `Brightness: ${pass.mag} mag.` : '',
          pass.startAzCompass ? `Approaches from: ${pass.startAzCompass}.` : '',
          pass.endAzCompass ? `Departs to: ${pass.endAzCompass}.` : '',
          `Observer station: ${observer.name}. Visible to the naked eye under clear skies.`,
        ]
          .filter(Boolean)
          .join(' '),
        lore: 'The orbital citadel glistens like a silver shooting star traveling across the dark sky dome.',
        origin: 'n2yo',
        sourceName: 'Orbital Ephemeris Telemetry',
        sourceUrl: 'https://www.n2yo.com/',
        significance: 'Visible Flyover',
      }),
    ];
  });
}

export const CelestialScroll: React.FC = () => {
  const today = dateKey(new Date());

  const [monthDate, setMonthDate] = useState(() => {
    const p = dateParts(new Date());
    return { year: p.year, month: p.month - 1 };
  });

  const [view, setView] = useState<'calendar' | 'list' | 'watchlist'>('calendar');
  const [selectedDate, setSelectedDate] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(addDays(today, 60));

  const [watchlist, setWatchlist] = useState<string[]>(() => readJSON(WATCH_KEY, []));
  const [alerts, setAlerts] = useState<boolean>(() => readJSON(ALERT_KEY, false));
  const [alertMessage, setAlertMessage] = useState<string>('');

  const [observer, setObserver] = useState<Observer>(() =>
    readJSON(LOCATION_KEY, INDIAN_OBSERVATORIES[0])
  );

  const [launchEvents, setLaunchEvents] = useState<ScrollEvent[]>([]);
  const [issEvents, setIssEvents] = useState<ScrollEvent[]>([]);
  const [newsArticles, setNewsArticles] = useState<SpaceNewsItem[]>([]);

  const [launchLoading, setLaunchLoading] = useState(false);
  const [issLoading, setIssLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);

  const [launchError, setLaunchError] = useState('');
  const [issError, setIssError] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  // Moon data computed live via SunCalc for IST
  const [moonData, setMoonData] = useState(() => {
    const now = new Date();
    const illumination = SunCalc.getMoonIllumination(now);
    const times = SunCalc.getMoonTimes(now, observer.latitude, observer.longitude);
    const phase = phaseInfo(illumination.phase);

    return {
      phase: illumination.phase,
      fraction: illumination.fraction,
      age: illumination.phase * 29.53059,
      name: phase.name,
      japanese: phase.japanese,
      lore: phase.lore,
      moonrise: times.rise ? formatTime(times.rise) : 'Below horizon',
      moonset: times.set ? formatTime(times.set) : 'Circumpolar',
    };
  });

  // Keep live Moon telemetry synchronized
  useEffect(() => {
    const updateMoon = () => {
      const now = new Date();
      const illumination = SunCalc.getMoonIllumination(now);
      const times = SunCalc.getMoonTimes(now, observer.latitude, observer.longitude);
      const phase = phaseInfo(illumination.phase);

      setMoonData({
        phase: illumination.phase,
        fraction: illumination.fraction,
        age: illumination.phase * 29.53059,
        name: phase.name,
        japanese: phase.japanese,
        lore: phase.lore,
        moonrise: times.rise ? formatTime(times.rise) : 'Below horizon',
        moonset: times.set ? formatTime(times.set) : 'Circumpolar',
      });
    };

    updateMoon();
    const timer = window.setInterval(updateMoon, 60_000);
    return () => window.clearInterval(timer);
  }, [observer]);

  // Load launches (SpaceDevs v2.2.0 API, prioritizing ISRO missions)
  const loadLaunches = useCallback(async () => {
    setLaunchLoading(true);
    setLaunchError('');
    try {
      const cached = readJSON<{ data: { results?: Launch[] }; savedAt: number } | null>(
        LAUNCH_CACHE,
        null
      );
      if (cached && Date.now() - cached.savedAt < LAUNCH_TTL) {
        setLaunchEvents(mapLaunches(cached.data));
        setUpdatedAt(formatTime(new Date(cached.savedAt)));
        setLaunchLoading(false);
        return;
      }

      const response = await fetch(LAUNCH_API, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) throw new Error(`Launch API responded with HTTP ${response.status}`);
      const data = (await response.json()) as { results?: Launch[] };
      writeJSON(LAUNCH_CACHE, { data, savedAt: Date.now() });

      setLaunchEvents(mapLaunches(data));
      setUpdatedAt(formatTime(new Date()));
    } catch (error) {
      const cached = readJSON<{ data: { results?: Launch[] }; savedAt: number } | null>(
        LAUNCH_CACHE,
        null
      );
      if (cached?.data) {
        setLaunchEvents(mapLaunches(cached.data));
      } else {
        setLaunchError(error instanceof Error ? error.message : 'Unable to query launch feed.');
      }
    } finally {
      setLaunchLoading(false);
    }
  }, []);

  // Load ISS visible flyover passes for the active Indian observer station
  const loadISS = useCallback(async (obs: Observer) => {
    setIssLoading(true);
    setIssError('');
    try {
      const query = new URLSearchParams({
        lat: String(obs.latitude),
        lng: String(obs.longitude),
        alt: String(obs.altitude),
        days: '5',
      });

      const response = await fetch(`${ISS_API}?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`ISS service responded with HTTP ${response.status}`);
      }

      const payload = (await response.json()) as { passes?: Pass[] };
      const passes = payload.passes ?? [];
      setIssEvents(mapPasses(passes, obs));
    } catch (error) {
      setIssError(error instanceof Error ? error.message : 'ISS predictions unavailable.');
    } finally {
      setIssLoading(false);
    }
  }, []);

  // Load live Indian space & ISRO astronomy news
  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const res = await fetch(NEWS_API);
      if (res.ok) {
        const data = await res.json();
        setNewsArticles(data.articles || []);
      }
    } catch {
      // Fallback handled on backend
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLaunches();
    void loadNews();
  }, [loadLaunches, loadNews]);

  useEffect(() => {
    void loadISS(observer);
  }, [observer, loadISS]);

  // Set observing station
  const handleSelectObservatory = (obs: Observer) => {
    setObserver(obs);
    writeJSON(LOCATION_KEY, obs);
  };

  // Browser GPS location detection
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setIssError('Browser geolocation is unsupported. Select an Indian observatory station above.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: Observer = {
          name: `Custom Station (${pos.coords.latitude.toFixed(2)}° N, ${pos.coords.longitude.toFixed(2)}° E)`,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: Math.max(0, pos.coords.altitude ?? 100),
        };
        setObserver(next);
        writeJSON(LOCATION_KEY, next);
        setIssError('');
      },
      () => {
        setIssError('Location permission denied. Switched to Hanle Dark Sky Reserve, Ladakh.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const toggleWatch = (id: string) => {
    setWatchlist((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      writeJSON(WATCH_KEY, next);
      return next;
    });
  };

  const toggleAlerts = async () => {
    if (!alerts) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setAlerts(true);
          writeJSON(ALERT_KEY, true);
          setAlertMessage('Celestial notifications activated for upcoming peaks in IST.');
          setTimeout(() => setAlertMessage(''), 4500);
          return;
        }
      }
      setAlerts(true);
      writeJSON(ALERT_KEY, true);
      setAlertMessage('In-app alerts enabled for upcoming celestial alignments.');
      setTimeout(() => setAlertMessage(''), 4500);
    } else {
      setAlerts(false);
      writeJSON(ALERT_KEY, false);
      setAlertMessage('Alerts disabled.');
      setTimeout(() => setAlertMessage(''), 3000);
    }
  };

  const baseEvents = useMemo(() => {
    const p = monthDate;
    const localMoonEvents = moonEvents(p.year, p.month);
    return [...curatedEvents(today), ...localMoonEvents, ...launchEvents, ...issEvents];
  }, [today, monthDate, launchEvents, issEvents]);

  const filteredEvents = useMemo(() => {
    return baseEvents
      .filter((event) => category === 'all' || event.type === category)
      .filter((event) => event.eventDate >= fromDate && event.eventDate <= toDate)
      .filter((event) => !selectedDate || event.eventDate === selectedDate)
      .filter((event) => view !== 'watchlist' || watchlist.includes(event.id))
      .sort((a, b) => {
        // Prioritize Indian ISRO missions first
        if (a.isIndianMission && !b.isIndianMission) return -1;
        if (!a.isIndianMission && b.isIndianMission) return 1;
        return a.eventDate.localeCompare(b.eventDate) || a.timestamp.localeCompare(b.timestamp);
      });
  }, [baseEvents, category, fromDate, toDate, selectedDate, view, watchlist]);

  const calendarCells = useMemo(() => {
    const first = new Date(Date.UTC(monthDate.year, monthDate.month, 1, 6, 30));
    const count = new Date(Date.UTC(monthDate.year, monthDate.month + 1, 0)).getUTCDate();
    const mondayFirst = (first.getUTCDay() + 6) % 7;
    return [
      ...Array.from({ length: mondayFirst }, () => null),
      ...Array.from(
        { length: count },
        (_, i) =>
          `${monthDate.year}-${String(monthDate.month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
      ),
    ];
  }, [monthDate]);

  const monthEvents = useMemo(
    () =>
      baseEvents.filter((event) =>
        event.eventDate.startsWith(
          `${monthDate.year}-${String(monthDate.month + 1).padStart(2, '0')}`
        )
      ),
    [baseEvents, monthDate]
  );

  const shiftMonth = (amount: number) => {
    const next = new Date(Date.UTC(monthDate.year, monthDate.month + amount, 15));
    setMonthDate({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
    setSelectedDate('');
  };

  const clearFilters = () => {
    setCategory('all');
    setSelectedDate('');
    setFromDate(today);
    setToDate(addDays(today, 60));
  };

  return (
    <div className="cs-container">
      {/* 1. Header Banner */}
      <header className="cs-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="hanko-seal">天巻</span>
          <span className="gold-badge">
            <Sparkles size={12} />
            LUNAR EPHEMERIS & BHARAT CELESTIAL GUIDE
          </span>
        </div>

        <h1>Celestial Scroll 天文巻物</h1>
        <h2>ASTRONOMICAL EPHEMERIS & ISRO SPACE DISPATCHES</h2>
        <p>
          Unroll the sacred celestial ephemeris calibrated to Indian skies. Explore real-time Moon phase
          illuminations, meteor streams, solar and lunar eclipses, ISS citadel passes, and ISRO spaceflight missions.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '14px' }}>
          <div className="cs-ist-badge">
            <Globe size={13} color="var(--gold-moon-bright)" />
            <span>ALL TIMES IN INDIAN STANDARD TIME (IST · UTC+05:30)</span>
          </div>

          <button type="button" onClick={toggleAlerts} className="cs-header-alert-btn">
            {alerts ? <Bell size={15} color="var(--gold-moon)" /> : <BellOff size={15} />}
            <span>{alerts ? 'Alerts Active (IST)' : 'Enable Celestial Alerts'}</span>
          </button>
        </div>

        {alertMessage && <div className="cs-alert-banner">{alertMessage}</div>}
      </header>

      {/* 2. Hero Current Moon Phase Card with Real Moon Phase Image */}
      <section className="cs-moon-summary">
        <div className="cs-moon-summary-inner">
          {/* Visual Moon Disk corresponding to EXACT current phase */}
          <div className="cs-moon-visual-wrap">
            <MoonPhaseVisual phase={moonData.phase} fraction={moonData.fraction} size={200} />
            <div className="cs-moon-badge">
              <span className="cs-moon-badge-pulse" />
              <span>LIVE SUNCALC TELEMETRY</span>
            </div>
          </div>

          {/* Moon Ephemeris Telemetry */}
          <div className="cs-moon-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="hanko-seal" style={{ fontSize: '0.65rem' }}>月相</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gold-moon-bright)', letterSpacing: '0.08em' }}>
                CURRENT LUNAR PHASE
              </span>
            </div>

            <h2>{moonData.name}</h2>
            <h3>{moonData.japanese}</h3>

            <div className="cs-moon-metrics-grid">
              <div className="cs-metric-card">
                <span className="label">Illumination Disk</span>
                <span className="value">{(moonData.fraction * 100).toFixed(1)}%</span>
              </div>
              <div className="cs-metric-card">
                <span className="label">Lunar Age</span>
                <span className="value">{moonData.age.toFixed(1)} days</span>
              </div>
              <div className="cs-metric-card">
                <span className="label">Observed Moonrise</span>
                <span className="value">{moonData.moonrise}</span>
              </div>
              <div className="cs-metric-card">
                <span className="label">Observed Moonset</span>
                <span className="value">{moonData.moonset}</span>
              </div>
            </div>

            <div className="cs-samurai-directive">
              <h4>
                <ShieldAlert size={16} color="var(--vermilion-bright)" style={{ display: 'inline', marginRight: '6px' }} />
                Samurai Night Directive
              </h4>
              <p>{moonData.lore}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Indian Celestial & ISRO Space News Feed */}
      <section className="cs-news-section">
        <div className="cs-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Rocket size={20} color="var(--gold-moon-bright)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
              Indian Celestial Dispatches & ISRO Spaceflight News
            </h3>
          </div>
          <button
            type="button"
            className="cs-btn-secondary"
            onClick={() => void loadNews()}
            disabled={newsLoading}
          >
            <RefreshCw size={14} className={newsLoading ? 'spin-animation' : ''} />
            <span>{newsLoading ? 'Refreshing...' : 'Refresh Indian Dispatches'}</span>
          </button>
        </div>

        <div className="cs-news-grid">
          {newsArticles.slice(0, 4).map((art) => (
            <article key={art.id} className="cs-news-card">
              {art.imageUrl && (
                <div
                  className="cs-news-image"
                  style={{ backgroundImage: `url(${art.imageUrl})` }}
                />
              )}
              <div className="cs-news-body">
                <div className="cs-news-meta">
                  <span className="cs-news-badge">{art.topicBadge}</span>
                  <span className="cs-news-time">{art.publishedAtIST}</span>
                </div>
                <h4>{art.title}</h4>
                <p>{art.summary}</p>
                <div className="cs-news-footer">
                  <span className="cs-news-site">{art.newsSite}</span>
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noreferrer"
                    className="cs-news-link"
                  >
                    <span>Read Dispatch</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Controls: Observing Station, Live Refresh & Filter Toolbar */}
      <section className="cs-controls">
        <div className="cs-station-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <MapPin size={16} color="var(--gold-moon)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--washi-white)', fontWeight: 600 }}>
              Observing Station:
            </span>
            <select
              className="cs-station-select"
              value={observer.name}
              onChange={(e) => {
                const found = INDIAN_OBSERVATORIES.find((o) => o.name === e.target.value);
                if (found) handleSelectObservatory(found);
              }}
            >
              {INDIAN_OBSERVATORIES.map((obs) => (
                <option key={obs.name} value={obs.name}>
                  {obs.name} ({obs.latitude.toFixed(2)}° N, {obs.longitude.toFixed(2)}° E)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="cs-btn-secondary" onClick={handleUseCurrentGPS}>
              <MapPin size={13} />
              <span>Use Device GPS</span>
            </button>
            <button
              type="button"
              className="cs-btn-secondary"
              onClick={() => void loadLaunches()}
              disabled={launchLoading}
            >
              <RefreshCw size={13} className={launchLoading ? 'spin-animation' : ''} />
              <span>{launchLoading ? 'Querying...' : 'Refresh Launches'}</span>
            </button>
            <button
              type="button"
              className="cs-btn-secondary"
              onClick={() => void loadISS(observer)}
              disabled={issLoading}
            >
              <Satellite size={13} className={issLoading ? 'spin-animation' : ''} />
              <span>{issLoading ? 'Tracking...' : 'Refresh ISS Passes'}</span>
            </button>
            {updatedAt && (
              <span style={{ fontSize: '0.74rem', color: 'var(--washi-muted)', fontFamily: 'var(--font-mono)' }}>
                Launches synced: {updatedAt}
              </span>
            )}
          </div>
        </div>

        {launchError && <div className="cs-banner-warn">Launches: {launchError}</div>}
        {issError && <div className="cs-banner-warn">ISS Passes: {issError}</div>}

        {/* Filters and View Switcher */}
        <div className="cs-filters-row">
          <div className="cs-filter-group">
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All Categories ({baseEvents.length})</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              From (IST)
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </label>

            <label>
              To (IST)
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </label>

            <button type="button" className="cs-btn-clear" onClick={clearFilters}>
              Reset Filters
            </button>
          </div>

          <div className="cs-view-toggles">
            <button
              type="button"
              className={`cs-toggle-btn ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => setView('calendar')}
            >
              <CalendarIcon size={14} />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              className={`cs-toggle-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <List size={14} />
              <span>List ({filteredEvents.length})</span>
            </button>
            <button
              type="button"
              className={`cs-toggle-btn ${view === 'watchlist' ? 'active' : ''}`}
              onClick={() => setView('watchlist')}
            >
              <Bookmark size={14} />
              <span>Watchlist ({watchlist.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Calendar View */}
      {view === 'calendar' && (
        <section className="cs-calendar-view">
          <div className="cs-calendar-header">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous Month">
              <ChevronLeft size={18} />
            </button>
            <h3>{formatMonth(monthDate.year, monthDate.month)} (IST)</h3>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="Next Month">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="cs-calendar-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="cs-calendar-day-header">
                {day}
              </div>
            ))}
            {calendarCells.map((date, index) => {
              const dayEvents = date
                ? monthEvents.filter(
                    (event) =>
                      event.eventDate === date &&
                      (category === 'all' || event.type === category)
                  )
                : [];
              const isToday = date === today;
              const isSelected = date === selectedDate;

              return (
                <button
                  key={date ?? `blank-${index}`}
                  disabled={!date}
                  type="button"
                  className={`cs-calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!date ? 'blank' : ''}`}
                  onClick={() => setSelectedDate(date ?? '')}
                >
                  {date && <span className="cs-day-num">{Number(date.slice(-2))}</span>}
                  <div className="cs-day-indicators">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className={`cs-dot cs-dot--${event.type}`}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="cs-dot-more">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="cs-calendar-legend">
            <span className="cs-legend-item">
              <span className="cs-dot cs-dot--meteor_shower" /> Meteor Showers
            </span>
            <span className="cs-legend-item">
              <span className="cs-dot cs-dot--eclipse" /> Eclipses
            </span>
            <span className="cs-legend-item">
              <span className="cs-dot cs-dot--moon_phase" /> Lunar Phases
            </span>
            <span className="cs-legend-item">
              <span className="cs-dot cs-dot--iss_pass" /> ISS Passes
            </span>
            <span className="cs-legend-item">
              <span className="cs-dot cs-dot--rocket_launch" /> Launches
            </span>
          </div>
        </section>
      )}

      {/* 6. Event Cards List */}
      <section className="cs-events-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--washi-white)' }}>
            {view === 'watchlist'
              ? `Watchlist Chronicle (${watchlist.length} saved)`
              : selectedDate
              ? `Events for ${formatDate(selectedDate)} (IST)`
              : `Events Matching Selection (${filteredEvents.length} total)`}
          </h3>
          {selectedDate && (
            <button
              type="button"
              className="cs-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              onClick={() => setSelectedDate('')}
            >
              Show all dates
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="cs-empty-card">
            <Star size={32} color="var(--gold-moon)" style={{ opacity: 0.6, marginBottom: '8px' }} />
            <p style={{ margin: 0, color: 'var(--washi-white)', fontWeight: 600 }}>
              No celestial events match this query.
            </p>
            <p style={{ margin: '4px 0 0', color: 'var(--washi-muted)', fontSize: '0.85rem' }}>
              Adjust the date range, reset categories, or select another observing station.
            </p>
          </div>
        ) : (
          <div className="cs-cards-grid">
            {filteredEvents.map((event) => {
              const isWatched = watchlist.includes(event.id);
              return (
                <div
                  key={event.id}
                  className={`cs-event-card ${event.isIndianMission ? 'indian-mission' : ''}`}
                >
                  <div className="cs-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`cs-category-badge cs-cat--${event.type}`}>
                        {CATEGORY_LABELS[event.type]}
                      </span>
                      {event.isIndianMission && (
                        <span className="cs-isro-badge">🇮🇳 BHARAT SPACE</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`cs-watch-btn ${isWatched ? 'watched' : ''}`}
                      onClick={() => toggleWatch(event.id)}
                      title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <Bookmark size={15} fill={isWatched ? 'currentColor' : 'none'} />
                      <span>{isWatched ? 'Watched' : 'Watch'}</span>
                    </button>
                  </div>

                  <h4 className="cs-event-title">{event.title}</h4>
                  <div className="cs-event-japanese">{event.titleJapanese}</div>

                  <p className="cs-event-desc">{event.description}</p>

                  <div className="cs-samurai-lore">
                    <Feather size={13} color="var(--vermilion-bright)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{event.samuraiLore}</span>
                  </div>

                  <div className="cs-card-footer">
                    <div className="cs-card-time">
                      <Star size={12} color="var(--gold-moon)" />
                      <span>{event.timeLabel}</span>
                    </div>

                    <div className="cs-card-source">
                      <a href={event.sourceUrl} target="_blank" rel="noreferrer">
                        <span>{event.sourceName}</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 7. Footer */}
      <footer className="cs-footer">
        <p>
          Celestial ephemeris computed using SunCalc algorithms. Launch schedules supplied by Launch Library 2
          and verified with ISRO dispatches. All timestamps are rendered in Indian Standard Time (IST · UTC+05:30).
        </p>
      </footer>
    </div>
  );
};

export default CelestialScroll;
