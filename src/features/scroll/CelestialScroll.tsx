import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SunCalc from 'suncalc';
import {
  Bell, BellOff, Bookmark, ChevronLeft, ChevronRight,
  Feather, } from 'lucide-react';
import type { CelestialEvent } from '../../types';
import './CelestialScroll.css';

type Category =
  | 'meteor_shower'
  | 'eclipse'
  | 'moon_phase'
  | 'iss_pass'
  | 'rocket_launch';

type Origin = 'curated' | 'calculated' | 'launch-library-2' | 'n2yo';

type ScrollEvent = Omit<CelestialEvent, 'id' | 'type'> & {
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
};

type Launch = {
  id?: number | string;
  name?: string | null;
  net?: string | null;
  window_start?: string | null;
  window_end?: string | null;
  url?: string | null;
  mission?: { name?: string | null } | null;
  status?: { name?: string | null } | null;
  launch_service_provider?: { name?: string | null } | null;
  pad?: {
    name?: string | null;
    location?: { name?: string | null } | null;
  } | null;
};

type Pass = {
  startUTC: number;
  endUTC: number;
  maxUTC?: number;
  duration?: number;
  maxEl?: number;
  mag?: number;
  startAzCompass?: string;
  endAzCompass?: string;
};

type Observer = {
  latitude: number;
  longitude: number;
  altitude: number;
};

type Cache<T> = { savedAt: number; data: T };

const TZ = 'Asia/Kolkata'; 
const LAUNCH_API = 'https://ll.thespacedevs.com/2.3.0/launch/upcoming/?limit=30&ordering=net&mode=detailed';
const ISS_API = '/api/iss/visible-passes'; 
const LAUNCH_SOURCE = 'https://thespacedevs.com/';
const ISS_SOURCE = 'https://www.n2yo.com/api/';
const IMO_SOURCE = 'https://www.imo.net/calendar/';
const NASA_METEOR_SOURCE = 'https://science.nasa.gov/solar-system/meteors-meteorites/meteor-showers/';
const ECLIPSE_SOURCE = 'https://eclipse.gsfc.nasa.gov/OH/OH2027.html';
const SUNCALC_SOURCE = 'https://github.com/mourner/suncalc';

const WATCH_KEY = 'celestial-scroll:watchlist:v1'; 
const ALERT_KEY = 'celestial-scroll:alerts:v1'; 
const LOCATION_KEY = 'celestial-scroll:observer:v1'; 
const LAUNCH_CACHE = 'celestial-scroll:launch-cache:v1'; 
const LAUNCH_TTL = 6 * 60 * 60 * 1000; 
const ISS_TTL = 30 * 60 * 1000;

const CATEGORY_LABELS: Record<Category, string> = {
  meteor_shower: 'Meteor showers',
  eclipse: 'Solar & lunar eclipses',
  moon_phase: 'Moon phases',
  iss_pass: 'ISS visible passes',
  rocket_launch: 'Rocket launches',
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
    // Storage may be unavailable in private browsing.
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
    return { name: 'New Moon', japanese: '新月 · Shingetsu', css: 'new', lore: 'The Moon rests in shadow. A quiet night for patient observation.' };
  }
  if (phase < 0.22) {
    return { name: 'Waxing Crescent', japanese: '三日月 · Mikazuki', css: 'waxing-crescent', lore: 'A slender silver blade returns to the evening sky.' };
  }
  if (phase < 0.28) {
    return { name: 'First Quarter', japanese: '上弦の月 · Jōgen no Tsuki', css: 'first-quarter', lore: 'Half the lunar disk is illuminated as the Moon waxes.' };
  }
  if (phase < 0.47) {
    return { name: 'Waxing Gibbous', japanese: '十三夜 · Jūsanya', css: 'waxing-gibbous', lore: 'The brightening Moon approaches its full silver watch.' };
  }
  if (phase < 0.53) {
    return { name: 'Full Moon', japanese: '望月 · Mochizuki', css: 'full', lore: 'The full lunar disk shines over the night sky.' };
  }
  if (phase < 0.72) {
    return { name: 'Waning Gibbous', japanese: '十六夜 · Izayoi', css: 'waning-gibbous', lore: 'After fullness, the illuminated disk gradually retreats.' };
  }
  if (phase < 0.78) {
    return { name: 'Third Quarter', japanese: '下弦の月 · Kagen no Tsuki', css: 'third-quarter', lore: 'Half the lunar disk is illuminated on its waning path.' };
  }
  return { name: 'Waning Crescent', japanese: '有明の月 · Ariake no Tsuki', css: 'waning-crescent', lore: 'A pale crescent precedes the next new Moon.' };
}

function makeEvent(input: {
  id: string; title: string; japanese?: string; type: Category;
  date: string; timestamp?: string; start?: string; end?: string;
  description: string; timeLabel?: string; origin: Origin;
  sourceName: string; sourceUrl: string; phase?: number;
  lore?: string; significance?: string;
}): ScrollEvent {
  const timestamp = input.timestamp ?? dateAtNoonIST(input.date).toISOString();
  return {
    id: input.id,
    title: input.title,
    titleJapanese: input.japanese ?? '天文観測',
    type: input.type,
    timestamp,
    peakTime: input.timeLabel ?? 'Date shown in IST',
    magnitude: null,
    description: input.description,
    samuraiLore: input.lore ?? 'Observe carefully and verify local sky conditions.',
    significance: input.significance ?? input.origin,
    eventDate: input.date,
    startDate: input.start,
    endDate: input.end,
    origin: input.origin,
    sourceName: input.sourceName,
    sourceUrl: input.sourceUrl,
    timeLabel: input.timeLabel ?? formatDate(input.date),
    moonPhase: input.phase,
  } as unknown as ScrollEvent;
}

function curatedEvents(today: string): ScrollEvent[] {
  const showers = [
    { id: 'southern-taurids-2026', title: 'Southern Taurids', japanese: '牡牛座南流星群', start: '2026-09-20', end: '2026-11-20', peak: '2026-11-05', label: 'Peak night: 4–5 Nov 2026', description: 'An annual meteor shower known for slow meteors and occasional bright fireballs.', source: IMO_SOURCE, sourceName: 'International Meteor Organization' },
    { id: 'northern-taurids-2026', title: 'Northern Taurids', japanese: '牡牛座北流星群', start: '2026-10-20', end: '2026-12-10', peak: '2026-11-12', label: 'Peak night: 11–12 Nov 2026', description: 'A late-year shower that may contribute bright fireballs.', source: IMO_SOURCE, sourceName: 'International Meteor Organization' },
    { id: 'leonids-2026', title: 'Leonids', japanese: '獅子座流星群', start: '2026-11-06', end: '2026-11-30', peak: '2026-11-17', label: 'Peak night: 16–17 Nov 2026', description: 'Fast meteors associated with comet 55P/Tempel–Tuttle. A normal annual peak does not guarantee a meteor storm.', source: IMO_SOURCE, sourceName: 'International Meteor Organization' },
    { id: 'geminids-2026', title: 'Geminids', japanese: 'ふたご座流星群', start: '2026-12-04', end: '2026-12-17', peak: '2026-12-14', label: 'Peak night: 13–14 Dec 2026', description: 'Usually one of the strongest annual meteor showers, with its radiant in Gemini.', source: IMO_SOURCE, sourceName: 'International Meteor Organization' },
    { id: 'ursids-2026', title: 'Ursids', japanese: 'こぐま座流星群', start: '2026-12-17', end: '2026-12-26', peak: '2026-12-22', label: 'Peak night: 21–22 Dec 2026', description: 'A usually modest shower active around the December solstice.', source: NASA_METEOR_SOURCE, sourceName: 'NASA Meteor Showers' },
    { id: 'quadrantids-2027', title: 'Quadrantids', japanese: 'しぶんぎ座流星群', start: '2026-12-28', end: '2027-01-12', peak: '2027-01-04', label: 'Peak night: 3–4 Jan 2027', description: 'A strong shower with a relatively brief peak. Actual visibility depends on local observing conditions.', source: NASA_METEOR_SOURCE, sourceName: 'NASA Meteor Showers' },
    { id: 'lyrids-2027', title: 'Lyrids', japanese: 'こと座流星群', start: '2027-04-14', end: '2027-04-30', peak: '2027-04-23', label: 'Peak night: 22–23 Apr 2027', description: 'An annual April meteor shower.', source: NASA_METEOR_SOURCE, sourceName: 'NASA Meteor Showers' },
    { id: 'eta-aquariids-2027', title: 'Eta Aquariids', japanese: 'みずがめ座η流星群', start: '2027-04-19', end: '2027-05-28', peak: '2027-05-06', label: 'Peak night: 5–6 May 2027', description: 'An annual shower associated with debris from Halley’s Comet.', source: NASA_METEOR_SOURCE, sourceName: 'NASA Meteor Showers' },
  ];

  const eclipses = [
    { id: 'annular-solar-2027', title: 'Annular Solar Eclipse', japanese: '金環日食', date: '2027-02-06', time: 'Greatest eclipse: 6 Feb 2027, 21:30 IST', description: 'The annular phase is not visible from India. Consult a local eclipse map for regional visibility.' },
    { id: 'penumbral-lunar-2027-feb', title: 'Penumbral Lunar Eclipse', japanese: '半影月食', date: '2027-02-21', time: '21 Feb 2027, 02:42–06:43 IST (Peak: 04:43 IST)', description: 'The UTC catalogue date converts to early morning on 21 February in India. Penumbral shading can be subtle.' },
    { id: 'penumbral-lunar-2027-jul', title: 'Penumbral Lunar Eclipse', japanese: '半影月食', date: '2027-07-18', time: 'Greatest eclipse: 18 Jul 2027, 21:33 IST', description: 'An exceptionally shallow penumbral eclipse. Its shading is expected to be practically imperceptible.' },
    { id: 'total-solar-2027', title: 'Total Solar Eclipse', japanese: '皆既日食', date: '2027-08-02', time: 'Global maximum: 2 Aug 2027, 15:37 IST', description: 'Totality crosses parts of North Africa and the Middle East. India is outside the path of totality; check partial visibility for your local city.' },
    { id: 'penumbral-lunar-2027-aug', title: 'Penumbral Lunar Eclipse', japanese: '半影月食', date: '2027-08-17', time: 'Greatest eclipse: 17 Aug 2027, 12:44 IST', description: 'This event occurs during daytime in India and is not visible from India.' },
  ];

  const meteorEvents = showers
    .filter((s) => s.end >= today)
    .map((s) => makeEvent({
      id: s.id, title: s.title, japanese: s.japanese, type: 'meteor_shower',
      date: s.peak, start: s.start, end: s.end, timeLabel: s.label,
      description: `${s.description} Active window: ${formatDate(s.start)} – ${formatDate(s.end)} (IST dates).`,
      origin: 'curated', sourceName: s.sourceName, sourceUrl: s.source, significance: 'Curated schedule',
    }));

  const eclipseEvents = eclipses
    .filter((e) => e.date >= today)
    .map((e) => makeEvent({
      id: e.id, title: e.title, japanese: e.japanese, type: 'eclipse',
      date: e.date, start: e.date, end: e.date, timeLabel: e.time,
      description: e.description, origin: 'curated', sourceName: 'NASA Eclipse Catalogue',
      sourceUrl: ECLIPSE_SOURCE, significance: 'Curated schedule',
    }));

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
      id: `moon-${date}`, title: `Moon — ${phase.name}`, japanese: phase.japanese,
      type: 'moon_phase', date, timestamp: noon.toISOString(), phase: illumination.phase,
      timeLabel: `Calculated at 12:00 IST · ${formatDate(date)}`,
      description: `${phase.name}; ${(illumination.fraction * 100).toFixed(1)}% illuminated. Calculated locally with SunCalc for ${formatDate(date)}.`,
      lore: phase.lore, origin: 'calculated', sourceName: 'SunCalc', sourceUrl: SUNCALC_SOURCE, significance: 'Calculated locally',
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
    const timeLabel = net ? `NET: ${formatDateTime(net)}` : start && end ? `Window: ${formatDateTime(start)} – ${formatDateTime(end)}` : start ? `Window starts: ${formatDateTime(start)}` : `Window ends: ${formatDateTime(end!)}`;
    
    const details = [
      launch.mission?.name ? `Mission: ${launch.mission.name}` : '',
      launch.launch_service_provider?.name ? `Provider: ${launch.launch_service_provider.name}` : '',
      launch.pad?.name ? `Launch site: ${launch.pad.name}` : '',
      launch.pad?.location?.name ? `Location: ${launch.pad.location.name}` : '',
      launch.status?.name ? `Status: ${launch.status.name}` : '',
    ].filter(Boolean);

    return [makeEvent({
      id: `launch-${launch.id ?? date + launch.name}`, title: launch.name ?? launch.mission?.name ?? 'Rocket launch',
      japanese: 'ロケット打ち上げ', type: 'rocket_launch', date, timestamp: anchor.toISOString(),
      start: start ? dateKey(start) : date, end: end ? dateKey(end) : date, timeLabel,
      description: details.join(' · ') || 'Launch information supplied by Launch Library 2.',
      origin: 'launch-library-2', sourceName: 'The Space Devs · Launch Library 2', sourceUrl: launch.url ?? LAUNCH_SOURCE, significance: 'API data',
    })];
  });
}

function cacheIsFresh(cache: Cache<any> | null, ttl: number) { 
  return Boolean(cache && Date.now() - cache.savedAt < ttl); 
}

async function fetchLaunches(): Promise<{ events: ScrollEvent[]; stale: boolean }> { 
  const cached = readJSON<Cache<{ results?: Launch[] }> | null>(LAUNCH_CACHE, null);
  if (cacheIsFresh(cached, LAUNCH_TTL)) return { events: mapLaunches(cached!.data), stale: false };
  
  try {
    const response = await fetch(LAUNCH_API, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Launch API returned ${response.status}`);
    const data = (await response.json()) as { results?: Launch[] };
    writeJSON(LAUNCH_CACHE, { data, savedAt: Date.now() });
    return { events: mapLaunches(data), stale: false };
  } catch (error) {
    if (cached) return { events: mapLaunches(cached.data), stale: true };
    throw error;
  }
}

async function fetchISS(observer: Observer): Promise<{ events: ScrollEvent[]; stale: boolean }> {
  const key = `celestial-scroll:iss:${observer.latitude.toFixed(3)}:${observer.longitude.toFixed(3)}`;
  const cached = readJSON<Cache<Pass[]> | null>(key, null);
  if (cacheIsFresh(cached, ISS_TTL)) return { events: mapPasses(cached!.data), stale: false };
  
  const query = new URLSearchParams({ lat: String(observer.latitude), lng: String(observer.longitude), alt: String(observer.altitude), days: '5', minVisibility: '120' });
  try {
    const response = await fetch(`${ISS_API}?${query.toString()}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `ISS service returned ${response.status}`);
    }
    const payload = (await response.json()) as { passes?: Pass[]; predictions?: Pass[] };
    const passes = payload.passes ?? payload.predictions ?? [];
    writeJSON(key, { data: passes, savedAt: Date.now() });
    return { events: mapPasses(passes), stale: false };
  } catch (error) {
    if (cached) return { events: mapPasses(cached.data), stale: true };
    throw error;
  }
}

function mapPasses(passes: Pass[]): ScrollEvent[] {
  return passes.flatMap((pass, index) => {
    if (!Number.isFinite(pass.startUTC)) return [];
    const start = new Date(pass.startUTC * 1000);
    const end = new Date(pass.endUTC * 1000);
    const peak = pass.maxUTC ? new Date(pass.maxUTC * 1000) : null;
    const date = dateKey(start);
    return [makeEvent({
      id: `iss-${pass.startUTC}-${index}`, title: 'ISS Visible Pass', japanese: '国際宇宙ステーション',
      type: 'iss_pass', date, timestamp: start.toISOString(), start: date, end: date,
      timeLabel: `${formatDateTime(start)} – ${formatTime(end)}`,
      description: [
        peak ? `Peak: ${formatDateTime(peak)}.` : '',
        pass.maxEl != null ? `Maximum elevation: ${pass.maxEl}°.` : '',
        pass.startAzCompass ? `Starts: ${pass.startAzCompass}.` : '',
        pass.endAzCompass ? `Ends: ${pass.endAzCompass}.` : '',
        'Visibility depends on local weather, darkness, and the observer’s horizon.',
      ].filter(Boolean).join(' '),
      origin: 'n2yo', sourceName: 'N2YO visible-pass prediction', sourceUrl: ISS_SOURCE, significance: 'Predicted pass',
    })];
  });
}

function MoonArt({ phase }: { phase: number }) { 
  const info = phaseInfo(phase);
  const moonEmojis: Record<string, string> = {
    'new': '🌑',
    'waxing-crescent': '🌒',
    'first-quarter': '🌓',
    'waxing-gibbous': '🌔',
    'full': '🌕',
    'waning-gibbous': '🌖',
    'third-quarter': '🌗',
    'waning-crescent': '🌘',
  };

  return (
    <div
      className={`cs-moon cs-moon--${info.css}`}
      role="img"
      aria-label={`${info.name} Moon`}
      title={info.name}
      style={{
        fontSize: '4rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '1rem 0',
        textShadow: '0 0 15px rgba(255, 235, 150, 0.3)'
      }}
    >
      {moonEmojis[info.css]}
    </div>
  );
}

function EventCard({ event, watched, onWatch }: { event: ScrollEvent; watched: boolean; onWatch: (id: string) => void; }) {
  const phase = event.moonPhase ?? 0.5;
  const isMoon = event.type === 'moon_phase';
  return (
    <div className="cs-event-card">
      {isMoon && <MoonArt phase={phase} />}
      <h3>{event.title}</h3>
      <div className="cs-event-japanese">{event.titleJapanese}</div>
      <p>{event.description}</p>
      <p className="cs-samurai-lore">{event.samuraiLore}</p>
      <div className="cs-event-meta">
        <span>{CATEGORY_LABELS[event.type]}</span>
        <span>{formatDate(event.eventDate)}</span>
        <span>{event.origin.toUpperCase()}</span>
      </div>
      <div className="cs-event-source">
        Source: <a href={event.sourceUrl} target="_blank" rel="noreferrer">{event.sourceName}</a> ({event.significance})
      </div>
      <button type="button" className="cs-icon-button" onClick={() => onWatch(event.id)} aria-label={watched ? 'Remove' : 'Watch'} title={watched ? 'Remove' : 'Watch'}>
        {watched ? <Bookmark className="watched-icon" /> : <Feather className="unwatched-icon" />}
        <strong>{event.timeLabel}</strong>
      </button>
    </div>
  );
}

export const CelestialScroll: React.FC = () => {
  const today = dateKey(new Date());
  const [monthDate, setMonthDate] = useState(() => {
    const p = dateParts(new Date());
    return { year: p.year, month: p.month - 1 };
  });
  const [view, setView] = useState<'calendar' | 'list' | 'watchlist'>('calendar');
  const [selectedDate, setSelectedDate] = useState('');
  const [category, setCategory] = useState('all');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(addDays(today, 60));
  const [watchlist, setWatchlist] = useState<string[]>(() => readJSON(WATCH_KEY, []));
  const [alerts, setAlerts] = useState<boolean>(() => readJSON(ALERT_KEY, false));
  const [observer, setObserver] = useState<Observer | null>(() => readJSON(LOCATION_KEY, null));
  
  const [launchEvents, setLaunchEvents] = useState<ScrollEvent[]>([]);
  const [issEvents, setIssEvents] = useState<ScrollEvent[]>([]);
  const [launchLoading, setLaunchLoading] = useState(false);
  const [issLoading, setIssLoading] = useState(false);
  const [launchError, setLaunchError] = useState('');
  const [issError, setIssError] = useState('');
  const [launchStale, setLaunchStale] = useState(false);
  const [issStale, setIssStale] = useState(false);
  const [updatedAt, setUpdatedAt] = useState('');

  const [moonData, setMoonData] = useState(() => {
    const now = new Date();
    const illumination = SunCalc.getMoonIllumination(now);
    const phase = phaseInfo(illumination.phase);
    return {
      phase: illumination.phase,
      fraction: illumination.fraction,
      age: illumination.phase * 29.53059,
      name: phase.name,
      japanese: phase.japanese,
      lore: phase.lore,
    };
  });

  useEffect(() => {
    const updateMoon = () => {
      const illumination = SunCalc.getMoonIllumination(new Date());
      const phase = phaseInfo(illumination.phase);
      setMoonData({
        phase: illumination.phase, fraction: illumination.fraction,
        age: illumination.phase * 29.53059, name: phase.name,
        japanese: phase.japanese, lore: phase.lore,
      });
    };
    updateMoon();
    const timer = window.setInterval(updateMoon, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const loadLaunches = useCallback(async () => {
    setLaunchLoading(true); setLaunchError('');
    try {
      const result = await fetchLaunches();
      setLaunchEvents(result.events); setLaunchStale(result.stale); setUpdatedAt(formatTime(new Date()));
    } catch (error) {
      setLaunchError(error instanceof Error ? error.message : 'Unable to load launches.');
    } finally {
      setLaunchLoading(false);
    }
  }, []);

  const loadISS = useCallback(async () => {
    if (!observer) {
      setIssError('ISS predictions need your observer location. Select “Set observing location”.');
      return;
    }
    setIssLoading(true); setIssError('');
    try {
      const result = await fetchISS(observer);
      setIssEvents(result.events); setIssStale(result.stale);
    } catch (error) {
      setIssError(error instanceof Error ? error.message : 'ISS predictions are unavailable.');
    } finally {
      setIssLoading(false);
    }
  }, [observer]);

  useEffect(() => { void loadLaunches(); }, [loadLaunches]);
  useEffect(() => { if (observer) void loadISS(); }, [observer, loadISS]);

  const setLocation = () => {
    if (!navigator.geolocation) { setIssError('Location access unsupported.'); return; }
    setIssError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { latitude: position.coords.latitude, longitude: position.coords.longitude, altitude: Math.max(0, position.coords.altitude ?? 0) };
        setObserver(next); writeJSON(LOCATION_KEY, next);
      },
      () => setIssError('Location permission denied.'),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 30 * 60 * 1000 }
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
    if (!alerts && !('Notification' in window)) { (window as any).alert('Browser notifications unsupported.'); return; }
    if (!alerts && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
    }
    if (!alerts && Notification.permission !== 'granted') { (window as any).alert('Allow notifications in settings.'); return; }
    setAlerts((current) => { const next = !current; writeJSON(ALERT_KEY, next); return next; });
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
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.timestamp.localeCompare(b.timestamp));
  }, [baseEvents, category, fromDate, toDate, selectedDate, view, watchlist]);

  const calendarCells = useMemo(() => {
    const first = new Date(Date.UTC(monthDate.year, monthDate.month, 1, 6, 30));
    const count = new Date(Date.UTC(monthDate.year, monthDate.month + 1, 0)).getUTCDate();
    const mondayFirst = (first.getUTCDay() + 6) % 7;
    return [
      ...Array.from({ length: mondayFirst }, () => null),
      ...Array.from({ length: count }, (_, i) => `${monthDate.year}-${String(monthDate.month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`),
    ];
  }, [monthDate]);

  const monthEvents = useMemo(() => baseEvents.filter((event) => event.eventDate.startsWith(`${monthDate.year}-${String(monthDate.month + 1).padStart(2, '0')}`)), [baseEvents, monthDate]);

  const shiftMonth = (amount: number) => {
    const next = new Date(Date.UTC(monthDate.year, monthDate.month + amount, 15));
    setMonthDate({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
    setSelectedDate('');
  };

  const clearFilters = () => { setCategory('all'); setSelectedDate(''); setFromDate(today); setToDate(addDays(today, 60)); };

  return (
    <div className="cs-container">
      <header className="cs-header">
        <h1>Celestial Scroll</h1>
        <h2>LUNAR EPHEMERIS</h2>
        <p>A Japanese-inspired guide to the meteor showers, eclipses, spaceflight and the celestial events above you.</p>
        <p><strong>ALL TIMES IST · UTC+05:30</strong></p>
        <button onClick={toggleAlerts}>{alerts ? <Bell /> : <BellOff />} {alerts ? 'Alerts enabled' : 'Enable alerts'}</button>
      </header>

      <section className="cs-moon-summary">
        <h2>{moonData.name}</h2>
        <h3>{moonData.japanese}</h3>
        <p>Moon age: {moonData.age.toFixed(1)} days</p>
        <p>Illuminated <strong>{(moonData.fraction * 100).toFixed(1)}%</strong></p>
        <p>Phase fraction <strong>{moonData.phase.toFixed(3)}</strong></p>
        <div className="cs-samurai-directive">
          <h4>Samurai Night Directive</h4>
          <p>{moonData.lore}</p>
        </div>
      </section>

      <section className="cs-controls">
        <h2>Celestial Calendar</h2>
        <button onClick={() => void loadLaunches()}>Refresh launches</button>
        <button onClick={setLocation}>Set observing location</button>
        <button onClick={() => void loadISS()}>Refresh ISS</button>
        
        {launchLoading || issLoading ? <p>Loading remote astronomical data…</p> : null}
        {launchStale || issStale ? <p>A feed could not refresh. Cached data is being shown.</p> : null}
        {launchError && <p>Launch data: {launchError}</p>}
        {issError && <p>ISS data: {issError}</p>}
        {!observer && <p>ISS predictions remain unavailable until you set an observing location.</p>}
        {updatedAt && <p>Launch feed checked at {updatedAt}.</p>}
        
        <div className="cs-filters">
          <label>Event type
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {CATEGORIES.map((item) => <option key={item} value={item}>{CATEGORY_LABELS[item]}</option>)}
            </select>
          </label>
          <label>From (IST date) <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
          <label>To (IST date) <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
          <button onClick={clearFilters}>Clear filters</button>
        </div>
        
        <div className="cs-view-toggles">
          <button onClick={() => setView('calendar')}>Calendar</button>
          <button onClick={() => setView('list')}>List</button>
          <button onClick={() => setView('watchlist')}>Watchlist ({watchlist.length})</button>
        </div>
      </section>

      {view === 'calendar' && (
        <div className="cs-calendar-view">
          <div className="cs-calendar-header">
            <button onClick={() => shiftMonth(-1)}><ChevronLeft /></button>
            <h3>{formatMonth(monthDate.year, monthDate.month)}</h3>
            <button onClick={() => shiftMonth(1)}><ChevronRight /></button>
          </div>
          <div className="cs-calendar-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="cs-calendar-day-header">{day}</div>)}
            {calendarCells.map((date, index) => {
              const dayEvents = date ? monthEvents.filter((event) => event.eventDate === date && (category === 'all' || event.type === category)) : [];
              return (
                <button key={date ?? `blank-${index}`} disabled={!date} className={`cs-calendar-day ${date === today ? 'today' : ''} ${date === selectedDate ? 'selected' : ''} ${!date ? 'blank' : ''}`} onClick={() => setSelectedDate(date ?? '')}>
                  {date && <span>{Number(date.slice(-2))}</span>}
                  <div className="cs-day-indicators">
                    {dayEvents.slice(0, 3).map((event) => <span key={event.id} className={`cs-dot cs-dot--${event.type}`} title={event.title} />)}
                    {dayEvents.length > 3 && <span>+{dayEvents.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <p>Select a day to filter events. Daily Moon phases are calculated locally.</p>
        </div>
      )}

      <section className="cs-events-list">
        <h3>
          {view === 'watchlist' ? 'Watched events' : selectedDate ? `Events for ${formatDate(selectedDate)}` : 'Events matching your filters'}
        </h3>
        {filteredEvents.length === 0 ? (
          <p><strong>No events match these filters.</strong> Try another date range or category.</p>
        ) : (
          filteredEvents.map((event) => <EventCard key={event.id} event={event} watched={watchlist.includes(event.id)} onWatch={toggleWatch} />)
        )}
      </section>
      
      <footer className="cs-footer">
        <p>Astronomical schedules are predictions, not guarantees of visibility. Launch windows may change. ISS passes require your location and a configured N2YO key.</p>
      </footer>
    </div>
  );
};

export default CelestialScroll;