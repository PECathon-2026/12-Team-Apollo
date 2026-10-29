import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Compass, Radio, Satellite, RefreshCw, Orbit, MapPin } from 'lucide-react';
import { ISSLocation, ISSPassPrediction } from '../../types';

// Custom Japanese samurai celestial marker icon using L.divIcon
const issSamuraiIcon = L.divIcon({
  className: 'iss-custom-marker',
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid #e5b959; background: rgba(229, 185, 89, 0.25); animation: pulse 2s infinite ease-in-out;"></div>
      <div style="width: 14px; height: 14px; border-radius: 50%; background: #d63c3c; border: 2px solid #fff; box-shadow: 0 0 10px #ff5252;"></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export const Watchtower: React.FC = () => {
  const [issLocation, setIssLocation] = useState<ISSLocation>({
    latitude: 35.6762,
    longitude: 139.6503,
    altitudeKm: 420.5,
    velocityKmh: 27600,
    timestamp: Date.now(),
    visibility: 'visible',
    footprintRadiusKm: 2200,
    currentConstellation: 'Ursa Major (北斗七星)',
  });

  const [passes, setPasses] = useState<ISSPassPrediction[]>([
    {
      id: 'pass-01',
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
      id: 'pass-02',
      risetime: '23:18 JST (+1h 48m)',
      durationSeconds: 290,
      maxElevationDeg: 42,
      approachDirection: 'W (西)',
      departureDirection: 'NE (北東)',
      brightnessMagnitude: -2.1,
      visibleUnderSky: true,
      samuraiWatchpost: 'Mount Fuji Stargazing Ridge (富士山星見峠)',
    },
  ]);

  const [loading, setLoading] = useState<boolean>(false);

  const fetchISSData = async () => {
    setLoading(true);
    try {
      const [locRes, passRes] = await Promise.all([
        fetch('/api/iss/current'),
        fetch('/api/iss/passes'),
      ]);

      if (locRes.ok) {
        const data = await locRes.json();
        setIssLocation(data);
      }
      if (passRes.ok) {
        const passData = await passRes.json();
        setPasses(passData);
      }
    } catch {
      // Keep state if offline or during development
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchISSData();
    const interval = setInterval(fetchISSData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="sumi-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="hanko-seal">望楼</span>
              <span className="gold-badge">
                <Satellite size={12} />
                ORBITAL CITADEL TRACKER
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
              Watchtower <span style={{ color: 'var(--gold-moon)', fontWeight: 400 }}>| 天空の望楼</span>
            </h1>
            <p style={{ maxWidth: '720px', fontSize: '0.92rem' }}>
              Track the International Space Station as it glides silently like a phantom samurai across
              the nocturnal sphere. Observe real-time coordinates, altitude telemetry, and watchpost pass predictions.
            </p>
          </div>

          <button
            onClick={fetchISSData}
            disabled={loading}
            className="btn-samurai-outline"
          >
            <RefreshCw size={15} className={loading ? 'spin-animation' : ''} />
            Scan Horizon Telemetry
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="metric-pill">
          <span className="label">Latitude (緯度)</span>
          <span className="value">{issLocation.latitude.toFixed(4)}°</span>
        </div>
        <div className="metric-pill">
          <span className="label">Longitude (経度)</span>
          <span className="value">{issLocation.longitude.toFixed(4)}°</span>
        </div>
        <div className="metric-pill">
          <span className="label">Orbital Velocity</span>
          <span className="value">{issLocation.velocityKmh.toLocaleString()} km/h</span>
        </div>
        <div className="metric-pill">
          <span className="label">Altitude (高度)</span>
          <span className="value">{issLocation.altitudeKm.toFixed(1)} km</span>
        </div>
        <div className="metric-pill">
          <span className="label">Sky Realm</span>
          <span className="value" style={{ fontSize: '1rem', color: 'var(--washi-white)' }}>
            {issLocation.currentConstellation || 'Ursa Major'}
          </span>
        </div>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="sumi-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="var(--gold-moon)" />
            <h3 style={{ fontSize: '1.05rem' }}>Orbital Projection Canvas</h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--washi-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} color="#55f58c" /> Telemetry Active (Leaflet Projection)
          </span>
        </div>

        <div style={{ height: '440px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <MapContainer
            center={[issLocation.latitude, issLocation.longitude]}
            zoom={3}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            {/* Dark Ink-Wash TileLayer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Visual Footprint Circle */}
            <Circle
              center={[issLocation.latitude, issLocation.longitude]}
              radius={issLocation.footprintRadiusKm * 1000}
              pathOptions={{
                color: '#e5b959',
                fillColor: '#e5b959',
                fillOpacity: 0.08,
                weight: 1,
                dashArray: '4, 8',
              }}
            />
            {/* ISS Custom Samurai Marker */}
            <Marker
              position={[issLocation.latitude, issLocation.longitude]}
              icon={issSamuraiIcon}
            >
              <Popup>
                <div style={{ color: '#07080b', fontFamily: 'sans-serif' }}>
                  <strong>ISS Orbital Citadel (軌道城塞)</strong>
                  <br />
                  Alt: {issLocation.altitudeKm.toFixed(1)} km
                  <br />
                  Speed: {issLocation.velocityKmh.toLocaleString()} km/h
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* Flyover Predictions */}
      <div className="sumi-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Orbit size={18} color="var(--gold-moon)" />
          <h3 style={{ fontSize: '1.1rem' }}>Upcoming Samurai Watchpost Passes</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {passes.map((pass) => (
            <div
              key={pass.id}
              style={{
                background: 'rgba(13, 15, 21, 0.75)',
                border: '1px solid var(--border-delicate)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--gold-moon-bright)', fontFamily: 'var(--font-serif)' }}>
                  {pass.risetime}
                </span>
                <span className="gold-badge" style={{ fontSize: '0.7rem' }}>
                  Mag {pass.brightnessMagnitude} (Bright)
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--washi-silk)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--vermilion)" />
                {pass.samuraiWatchpost}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--washi-muted)' }}>
                <span>Trajectory: {pass.approachDirection} → {pass.departureDirection}</span>
                <span>Peak: {pass.maxElevationDeg}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
