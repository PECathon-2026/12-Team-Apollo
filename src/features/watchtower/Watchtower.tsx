import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Compass,
  Search,
  MapPin,
  LocateFixed,
  RefreshCw,
  MoonStar,
  Cloud,
  Eye,
  Droplets,
  CloudRain,
  Satellite,
  Crosshair,
  Sparkles,
  Feather,
  Map,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./watchtower.css";

import {
  searchPlaces,
  getForecast,
  getNearbySpots,
  type Place,
  type WeatherForecast,
  type ObservingSpot,
} from "./weatherService";
import { calculateHonorScore } from "./honorScore";

// Default Anchor: Jaipur Jantar Mantar Meridian
const DEFAULT_PLACE: Place = {
  id: "jaipur-jantar-mantar",
  name: "Jaipur, Rajasthan",
  country: "India",
  admin1: "Rajasthan",
  latitude: 26.924,
  longitude: 75.824,
  timezone: "Asia/Kolkata",
};

// Popular Indian Astronomical Gateway Centers
const QUICK_OBSERVATORIES: Place[] = [
  {
    id: "jaipur-quick",
    name: "Jaipur (Jantar Mantar)",
    country: "India",
    admin1: "Rajasthan",
    latitude: 26.924,
    longitude: 75.824,
    timezone: "Asia/Kolkata",
  },
  {
    id: "hanle-quick",
    name: "Hanle Dark Sky Reserve",
    country: "India",
    admin1: "Ladakh",
    latitude: 32.78,
    longitude: 78.96,
    timezone: "Asia/Kolkata",
  },
  {
    id: "bengaluru-quick",
    name: "Bengaluru (ISRO Hub)",
    country: "India",
    admin1: "Karnataka",
    latitude: 12.971,
    longitude: 77.594,
    timezone: "Asia/Kolkata",
  },
  {
    id: "nainital-quick",
    name: "Nainital (Devasthal 3.6m)",
    country: "India",
    admin1: "Uttarakhand",
    latitude: 29.36,
    longitude: 79.45,
    timezone: "Asia/Kolkata",
  },
  {
    id: "delhi-quick",
    name: "New Delhi",
    country: "India",
    admin1: "Delhi",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: "Asia/Kolkata",
  },
  {
    id: "mumbai-quick",
    name: "Mumbai",
    country: "India",
    admin1: "Maharashtra",
    latitude: 19.076,
    longitude: 72.877,
    timezone: "Asia/Kolkata",
  },
];

// Custom Leaflet Icons for Samurai Stargazing Theme
const citadelMarkerIcon = L.divIcon({
  className: "iss-custom-marker",
<<<<<<< HEAD
  html: `
    <div style="width:22px;height:22px;border-radius:50%;
      background:#dc2626;border:3px solid #fff;
      box-shadow:0 0 14px #ef4444;">
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const spotIcon = L.divIcon({
  className: "iss-custom-marker",
  html: `
    <div style="width:14px;height:14px;border-radius:50%;
      background:#ef4444;border:2px solid #fff;box-shadow:0 0 8px rgba(220,38,38,0.7);">
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
=======
  html: `<div class="wt-citadel-pin" title="Base Citadel Stargazing Post"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13],
});

function getSpotMarkerIcon(bortleClass = 4) {
  const colorClass =
    bortleClass <= 2
      ? "bortle-dark"
      : bortleClass <= 4
      ? "bortle-rural"
      : "bortle-suburban";
>>>>>>> 9a4179007f2ea523a6195fdf9d3540215d4dd3c4

  return L.divIcon({
    className: "iss-custom-marker",
    html: `<div class="wt-spot-pin ${colorClass}" title="Observing Spot"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  });
}

// Recenter Map Helper
function RecenterMap({
  latitude,
  longitude,
  zoom = 11,
}: {
  latitude: number;
  longitude: number;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], zoom, { animate: true });
  }, [latitude, longitude, zoom, map]);

  return null;
}

function localHour(time: string): number {
  return Number(time.split("T")[1]?.slice(0, 2) ?? 0);
}

function formatLocalTime(time: string): string {
  return time.replace("T", " ");
}

function localNowKey(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function eveningHours(forecast: WeatherForecast) {
  return forecast.hourly.filter((hour) => {
    const h = localHour(hour.time);
    return h >= 18 && h <= 23;
  });
}

function defaultEveningHour(forecast: WeatherForecast) {
  const evening = eveningHours(forecast);
  const now = localNowKey(forecast.timezone);
  return evening.find((hour) => hour.time >= now) ?? evening[0] ?? null;
}

export const Watchtower: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place>(DEFAULT_PLACE);

  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [spots, setSpots] = useState<ObservingSpot[]>([]);

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: DEFAULT_PLACE.latitude,
    lng: DEFAULT_PLACE.longitude,
    zoom: 11,
  });

  const [tileMode, setTileMode] = useState<"dark" | "standard">("dark");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [searching, setSearching] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [weatherError, setWeatherError] = useState("");
  const [spotsError, setSpotsError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const mapScrollRef = useRef<HTMLDivElement>(null);
  const searchController = useRef<AbortController | null>(null);

  // Search for cities using Open-Meteo's geocoding API
  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      setSearchError("Enter a city or place name first.");
      return;
    }

    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;

    setSearching(true);
    setSearchError("");
    setResults([]);

    try {
      const places = await searchPlaces(query, controller.signal);
      setResults(places);

      if (places.length === 0) {
        setSearchError("No matching places found. Try another spelling.");
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setSearchError(
        error instanceof Error
          ? error.message
          : "City search failed. Please try again."
      );
    } finally {
      if (!controller.signal.aborted) {
        setSearching(false);
      }
    }
  }

  function choosePlace(place: Place) {
    searchController.current?.abort();
    setSelectedPlace(place);
    setQuery(`${place.name}${place.country ? `, ${place.country}` : ""}`);
    setResults([]);
    setSearchError("");
    setLocationMessage("");
    setWeatherError("");
    setSpotsError("");
    setForecast(null);
    setSpots([]);
    setSelectedTime("");
    setMapCenter({ lat: place.latitude, lng: place.longitude, zoom: 11 });
  }

  // Use device GPS location
  function useCurrentLocation() {
    setLocationMessage("");
    setSearchError("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Location access is not supported by this browser. Search for a city instead."
      );
      return;
    }

    setLocationMessage("Requesting device GPS coordinates…");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const place: Place = {
          id: "browser-current-location",
          name: "Current GPS Location",
          country: "India",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone: "Asia/Kolkata",
        };

        setQuery("Current GPS Location");
        choosePlace(place);
        setLocationMessage("Using your device GPS coordinates.");
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. You can choose from the celestial gateways or search manually."
            : "Could not determine your location. Please select a city or observatory.";
        setLocationMessage(message);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  // Load weather forecast and nearby observing spots
  useEffect(() => {
    if (!selectedPlace) return;
    const currentPlace = selectedPlace;
    const controller = new AbortController();

    async function loadData() {
      setWeatherLoading(true);
      setSpotsLoading(true);
      setWeatherError("");
      setSpotsError("");
      setForecast(null);
      setSpots([]);
      setSelectedTime("");

      // 1. Weather forecast
      const weatherPromise = getForecast(
        currentPlace.latitude,
        currentPlace.longitude,
        controller.signal
      );

      // 2. Intelligent nearby observing spots
      const spotsPromise = getNearbySpots(
        currentPlace.latitude,
        currentPlace.longitude,
        controller.signal,
        currentPlace.name.split(",")[0]
      );

      weatherPromise
        .then((data) => {
          if (controller.signal.aborted) return;
          setForecast(data);
          const initialHour = defaultEveningHour(data);
          setSelectedTime(initialHour?.time ?? "");
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setWeatherError(
            error instanceof Error
              ? error.message
              : "Weather forecast could not be loaded."
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) setWeatherLoading(false);
        });

      spotsPromise
        .then((data) => {
          if (!controller.signal.aborted) setSpots(data);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setSpotsError("Nearby observing spots could not be retrieved.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setSpotsLoading(false);
        });
    }

    void loadData();

    return () => controller.abort();
  }, [selectedPlace, retryCount]);

  const selectedWeather = useMemo(
    () =>
      forecast?.hourly.find((hour) => hour.time === selectedTime) ??
      (forecast ? defaultEveningHour(forecast) : null),
    [forecast, selectedTime]
  );

  const eveningForecast = useMemo(
    () => (forecast ? eveningHours(forecast).slice(0, 8) : []),
    [forecast]
  );

  const honorScore = selectedWeather
    ? calculateHonorScore({
        cloudCover: selectedWeather.cloudCover,
        visibilityKm: selectedWeather.visibilityKm,
        humidity: selectedWeather.humidity,
        precipitationProbability: selectedWeather.precipitationProbability,
      })
    : null;

  function retryWeather() {
    if (selectedPlace) {
      setRetryCount((count) => count + 1);
    }
  }

  // Filter spots by selected category
  const filteredSpots = useMemo(() => {
    if (selectedCategory === "all") return spots;
    return spots.filter((s) => {
      const typeLower = s.type.toLowerCase();
      if (selectedCategory === "observatory") return typeLower.includes("observatory");
      if (selectedCategory === "viewpoint") return typeLower.includes("viewpoint") || typeLower.includes("mountain");
      if (selectedCategory === "darksky") return typeLower.includes("dark sky") || typeLower.includes("reserve") || typeLower.includes("park");
      return true;
    });
  }, [spots, selectedCategory]);

  // Focus map onto a specific observing spot
  const handleFocusSpot = (spot: ObservingSpot) => {
    setMapCenter({
      lat: spot.latitude,
      lng: spot.longitude,
      zoom: 13,
    });
    // Smooth scroll up to the map scroll if out of viewport
    if (mapScrollRef.current) {
      mapScrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleRecenterBase = () => {
    setMapCenter({
      lat: selectedPlace.latitude,
      lng: selectedPlace.longitude,
      zoom: 11,
    });
  };

  return (
    <div className="watchtower">
      {/* 1. Header & City Search Card */}
      <section className="sumi-card">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span className="hanko-seal">CITADEL</span>
              <span className="gold-badge">
                <Satellite size={12} />
                NIGHT SKY CITADEL OBSERVATORY
              </span>
            </div>

            <h1 style={{ fontSize: "1.85rem", marginBottom: 6 }}>
              Watchtower{" "}
              <span
                style={{
                  color: "var(--gold-moon)",
                  fontWeight: 400,
                }}
              >
                | Night Sky Observatory
              </span>
            </h1>

            <p className="wt-muted">
              Inspect evening astronomical seeing, calculate Samurai Night Honor observing scores,
              unroll the celestial scroll map, and discover curated dark-sky sanctuaries.
            </p>
          </div>
        </div>

        {/* Quick Stargazing Observatories Selection */}
        <div className="wt-quick-bar">
          <span className="wt-quick-label">Celestial Gateways:</span>
          {QUICK_OBSERVATORIES.map((obs) => (
            <button
              key={obs.id}
              type="button"
              className={`wt-quick-pill ${selectedPlace.id === obs.id ? "active" : ""}`}
              onClick={() => choosePlace(obs)}
            >
              <Compass size={12} color="var(--gold-moon)" />
              <span>{obs.name}</span>
            </button>
          ))}
        </div>

        {/* Search City / Location Form */}
        <form className="wt-search-form" onSubmit={handleSearch}>
          <input
            className="wt-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search any city or region, e.g. Jaipur, Ladakh, Pune, Tokyo"
            aria-label="Search city or place"
          />

          <button
            type="submit"
            className="wt-button wt-button-primary"
            disabled={searching}
          >
            {searching ? <span className="wt-spinner" /> : <Search size={16} />}
            {searching ? "Searching…" : "Search City"}
          </button>

          <button
            type="button"
            className="wt-button"
            onClick={useCurrentLocation}
          >
            <LocateFixed size={16} />
            <span>Use My GPS</span>
          </button>
        </form>

        {searchError && <p className="wt-error">{searchError}</p>}
        {locationMessage && <p className="wt-notice" role="status">{locationMessage}</p>}

        {results.length > 0 && (
          <div className="wt-place-results">
            <p className="wt-muted">Select your target territory:</p>
            {results.map((place) => (
              <button
                type="button"
                key={place.id}
                className="wt-place-option"
                onClick={() => choosePlace(place)}
              >
                <MapPin
                  size={15}
                  style={{ display: "inline", marginRight: 8, color: "var(--gold-moon)" }}
                />
                <strong>{place.name}</strong>
                <span className="wt-muted">
                  {" "}
                  {[place.admin1, place.country].filter(Boolean).join(", ")}
                </span>
              </button>
            ))}
          </div>
        )}

        {selectedPlace && (
          <p className="wt-muted" style={{ marginTop: 12 }}>
            Active Station: <strong>{selectedPlace.name}</strong>
            {" · "}
            {selectedPlace.latitude.toFixed(3)}° N, {selectedPlace.longitude.toFixed(3)}° E
          </p>
        )}
      </section>

      {/* 2. Night Honor Score Card */}
      <section className="sumi-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <MoonStar size={20} color="var(--gold-moon)" />
          <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
            Atmospheric Seeing &amp; Night Honor Score
          </h2>
        </div>

        {weatherLoading && !forecast && (
          <p className="wt-muted" role="status">
            <span className="wt-spinner" /> Loading evening forecast…
          </p>
        )}

        {weatherError && (
          <div className="wt-error" role="alert">
            <p>{weatherError}</p>
            <button
              type="button"
              className="wt-button"
              onClick={retryWeather}
              style={{ marginTop: 10 }}
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {forecast && selectedWeather && honorScore !== null && (
          <>
            <div className="wt-score-layout">
              {/* Perfectly Formatted Circular Score Display */}
              <div className="wt-score-circle">
                <div className="wt-score-inner">
                  <div className="wt-score-number">{honorScore}</div>
                  <div className="wt-score-caption">OUT OF 100</div>
                </div>
              </div>

              {/* Explanatory Assessment with Authentic Kanji Seal */}
              <div className="wt-score-details">
                <div className="wt-score-grade-row">
                  <span className="hanko-seal">
                    {honorScore >= 75 ? "極上" : honorScore >= 50 ? "上等" : "警戒"}
                  </span>
                  <h3 className="wt-score-title">
                    {honorScore >= 75
                      ? "Promising Observing Conditions"
                      : honorScore >= 50
                        ? "Mixed Observing Conditions"
                        : "Challenging Observing Conditions"}
                  </h3>
                </div>

                <p className="wt-muted" style={{ margin: "4px 0" }}>
                  Approximate planning score for {formatLocalTime(selectedWeather.time)} ({forecast.timezone || "IST"}).
                </p>

                <p className="wt-muted" style={{ margin: "2px 0 0", fontSize: "0.82rem" }}>
                  Sky Clearness: {100 - selectedWeather.cloudCover}% · Atmospheric Transparency: {selectedWeather.visibilityKm.toFixed(1)} km
                </p>

                <p className="wt-muted" style={{ margin: "4px 0 0", fontSize: "0.78rem" }}>
                  Source: Open-Meteo · Live Astronomical Telemetry
                </p>
              </div>
            </div>

            <p className="wt-notice" style={{ marginTop: 16 }}>
              This samurai honor score weights inverse cloud cover at 55%, visibility at 20%,
              inverse humidity at 10%, and inverse precipitation probability at 15%. Visibility is
              normalized against a 20 km reference. It serves as an astronomical planning aid,
              not a scientific guarantee.
            </p>
          </>
        )}
      </section>

      {/* 3. Evening Weather Conditions Metrics */}
      {selectedWeather && (
        <section className="sumi-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.15rem", margin: 0 }}>
                Evening Weather Conditions
              </h2>
              <p className="wt-muted" style={{ margin: "4px 0 0" }}>
                Active Hour: <strong>{formatLocalTime(selectedWeather.time)}</strong>
              </p>
            </div>

            {forecast && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  id="wt-evening-hour"
                  className="wt-hour-select"
                  value={selectedWeather.time}
                  onChange={(event) => setSelectedTime(event.target.value)}
                  aria-label="Select evening hour"
                >
                  {eveningForecast.map((hour) => (
                    <option key={hour.time} value={hour.time}>
                      {hour.time.slice(11, 16)} IST · Cloud {hour.cloudCover}% · Rain {hour.precipitationProbability}%
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="wt-button"
                  onClick={retryWeather}
                  title="Refresh Telemetry"
                  style={{ padding: "8px 12px" }}
                >
                  <RefreshCw size={14} className={weatherLoading ? "wt-spinner" : ""} />
                </button>
              </div>
            )}
          </div>

          <div className="wt-metrics">
            <div className="metric-pill wt-metric">
              <Cloud size={20} color="var(--gold-moon)" />
              <span className="wt-metric-label">Cloud Cover</span>
              <span className="wt-metric-value">{selectedWeather.cloudCover}%</span>
            </div>

            <div className="metric-pill wt-metric">
              <Eye size={20} color="var(--gold-moon)" />
              <span className="wt-metric-label">Atmospheric Visibility</span>
              <span className="wt-metric-value">{selectedWeather.visibilityKm.toFixed(1)} km</span>
            </div>

            <div className="metric-pill wt-metric">
              <Droplets size={20} color="var(--gold-moon)" />
              <span className="wt-metric-label">Relative Humidity</span>
              <span className="wt-metric-value">{selectedWeather.humidity}%</span>
            </div>

            <div className="metric-pill wt-metric">
              <CloudRain size={20} color="var(--gold-moon)" />
              <span className="wt-metric-label">Precipitation Chance</span>
              <span className="wt-metric-value">{selectedWeather.precipitationProbability}%</span>
            </div>
          </div>
        </section>
      )}

      {/* 4. Hourly Evening Forecast Progression */}
      {forecast && (
        <section className="sumi-card">
          <h2 style={{ fontSize: "1.15rem", marginBottom: 14 }}>
            Hourly Evening Seeing Progression (IST)
          </h2>

          <div className="wt-hourly-grid">
            {eveningForecast.map((hour) => (
              <button
                type="button"
                key={hour.time}
                className={`wt-hour-card ${hour.time === selectedWeather?.time ? "wt-hour-card-selected" : ""}`}
                onClick={() => setSelectedTime(hour.time)}
                style={{
                  color: "var(--washi-white)",
                  textAlign: "left",
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                <strong style={{ color: "var(--gold-moon-bright)", fontSize: "0.95rem" }}>
                  {hour.time.slice(11, 16)} IST
                </strong>
                <span className="wt-muted">Cloud: {hour.cloudCover}%</span>
                <span className="wt-muted">Visibility: {hour.visibilityKm.toFixed(1)} km</span>
                <span className="wt-muted">Rain: {hour.precipitationProbability}%</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 5. JAPANESE MAKIMONO SCROLL GUI FOR OBSERVING MAP */}
      <section className="wt-scroll-wrapper" ref={mapScrollRef}>
        {/* Top Scroll Wooden Spindle Rod (Jiku 軸) with Brass Caps */}
        <div className="wt-scroll-rod top">
          <div className="wt-scroll-cap left" title="Lacquered Golden Finial (軸先)" />
          <div className="wt-scroll-rod-core">
            <div className="wt-scroll-cord-ring" />
          </div>
          <div className="wt-scroll-cap right" title="Lacquered Golden Finial (軸先)" />
        </div>

        {/* Top Silk Brocade Header (Ichimonji 一文字) */}
        <div className="wt-scroll-brocade top">
          <div className="wt-scroll-title-wrap">
            <span className="hanko-seal">星図</span>
            <div>
              <h3 className="wt-scroll-title">
                星図絵巻 · Celestial Starmap Scroll
              </h3>
              <span className="wt-scroll-subtitle">
                CITADEL STATION: {selectedPlace.name.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="wt-scroll-tools">
            <button
              type="button"
              className="wt-scroll-btn"
              onClick={() => setTileMode((m) => (m === "dark" ? "standard" : "dark"))}
              title="Toggle Sumi-e Dark Ink / Standard Cartography"
            >
              {tileMode === "dark" ? <MoonStar size={13} color="var(--gold-moon)" /> : <Map size={13} />}
              <span>{tileMode === "dark" ? "Sumi-e Dark (Night)" : "Standard Map (Day)"}</span>
            </button>

            <button
              type="button"
              className="wt-scroll-btn"
              onClick={handleRecenterBase}
              title="Recenter to Base Watchpost"
            >
              <Crosshair size={13} color="var(--vermilion-bright)" />
              <span>Base Station</span>
            </button>
          </div>
        </div>

        {/* The Silk Canvas Window (Interactive Map Body) */}
        <div className={`wt-scroll-canvas ${tileMode === "dark" ? "dark-starmap" : ""}`}>
          <div className="wt-map">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={mapCenter.zoom}
              scrollWheelZoom
              style={{ height: "100%", width: "100%", background: "#090a0f" }}
            >
              <RecenterMap
                latitude={mapCenter.lat}
                longitude={mapCenter.lng}
                zoom={mapCenter.zoom}
              />

              {/* 100% Free, OpenStreetMap Tiles with Zero API Key and Zero Watermarks! */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Red Samurai Seal Pin: Selected Citadel Station */}
              <Marker
                position={[selectedPlace.latitude, selectedPlace.longitude]}
                icon={citadelMarkerIcon}
              >
                <Popup>
                  <div style={{ padding: "4px 2px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span className="hanko-seal" style={{ fontSize: "0.6rem" }}>本陣</span>
                      <strong style={{ color: "var(--gold-moon-bright)" }}>
                        {selectedPlace.name}
                      </strong>
                    </div>
                    <div style={{ color: "var(--washi-silk)", fontSize: "0.78rem" }}>
                      Active Stargazing Citadel
                    </div>
                    <div style={{ color: "var(--washi-muted)", fontSize: "0.74rem", marginTop: 4 }}>
                      Coords: {selectedPlace.latitude.toFixed(4)}° N, {selectedPlace.longitude.toFixed(4)}° E
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Nearby Astronomical Observing Spots */}
              {filteredSpots.map((spot) => (
                <Marker
                  key={spot.id}
                  position={[spot.latitude, spot.longitude]}
                  icon={getSpotMarkerIcon(spot.bortleClass)}
                >
                  <Popup>
                    <div style={{ padding: "4px 2px", maxWidth: "260px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                        <strong style={{ color: "var(--gold-moon-bright)", fontSize: "0.9rem" }}>
                          {spot.name}
                        </strong>
                      </div>

                      <div style={{ display: "flex", gap: 6, alignItems: "center", margin: "4px 0" }}>
                        <span className={`wt-bortle-badge ${spot.bortleClass && spot.bortleClass <= 2 ? "dark" : spot.bortleClass && spot.bortleClass <= 4 ? "rural" : "suburban"}`}>
                          {spot.bortleDesc ? spot.bortleDesc.split("·")[0].trim() : `Bortle ${spot.bortleClass}`}
                        </span>
                        <span className="wt-spot-type-tag">{spot.type}</span>
                      </div>

                      <p style={{ fontSize: "0.76rem", color: "var(--washi-silk)", margin: "6px 0", lineHeight: 1.45 }}>
                        {spot.stargazingTip}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.74rem", color: "var(--washi-muted)", borderTop: "1px solid var(--border-ink)", paddingTop: 6 }}>
                        <span>
                          {spot.distanceKm.toFixed(1)} km ({spot.cardinalDirection})
                        </span>
                        {spot.elevationMeters && <span>Alt: {spot.elevationMeters}m</span>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Lower Silk Brocade Margin (Chi-Brocade 地文字) */}
        <div className="wt-scroll-brocade bottom">
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span>
              LAT: <strong>{selectedPlace.latitude.toFixed(4)}° N</strong> · LON: <strong>{selectedPlace.longitude.toFixed(4)}° E</strong>
            </span>
            <span>
              TIMEZONE: <strong>{selectedPlace.timezone || "Asia/Kolkata (IST)"}</strong>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={12} color="var(--gold-moon)" />
            <span>
              MAPPED SITES: <strong>{filteredSpots.length} SANCTUARIES</strong>
            </span>
          </div>
        </div>

        {/* Bottom Scroll Wooden Spindle Rod (Jiku 軸) with Brass Caps */}
        <div className="wt-scroll-rod bottom">
          <div className="wt-scroll-cap left" title="Lacquered Golden Finial (軸先)" />
          <div className="wt-scroll-rod-core" />
          <div className="wt-scroll-cap right" title="Lacquered Golden Finial (軸先)" />
        </div>
      </section>

      {/* 6. NEARBY OBSERVING SUGGESTIONS OVERHAUL */}
      <section className="wt-suggestions-section sumi-card">
        <div className="wt-suggestions-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Compass size={20} color="var(--gold-moon)" />
            <div>
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                Nearby Astronomical Observing Sanctuaries
              </h2>
              <p className="wt-muted" style={{ margin: "2px 0 0" }}>
                Curated viewpoints, high-altitude ridges, and dark-sky reserves within stargazing proximity.
              </p>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="wt-suggestions-filter-bar">
            {[
              { id: "all", label: `All Sanctuaries (${spots.length})` },
              { id: "observatory", label: "Observatories" },
              { id: "viewpoint", label: "Mountain Viewpoints" },
              { id: "darksky", label: "Dark Sky Reserves" },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={`wt-spot-filter-chip ${selectedCategory === chip.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {spotsLoading && (
          <p className="wt-muted" role="status">
            <span className="wt-spinner" /> Evaluating regional dark sky locations and topography…
          </p>
        )}

        {spotsError && <p className="wt-notice" role="status">{spotsError}</p>}

        {!spotsLoading && filteredSpots.length === 0 && (
          <p className="wt-muted">
            No observing spots match the selected category. Choose &quot;All Sanctuaries&quot; to review available sites.
          </p>
        )}

        {/* Spot Cards Grid */}
        <div className="wt-spots-cards-grid">
          {filteredSpots.map((spot) => (
            <div key={spot.id} className="wt-spot-card">
              <div className="wt-spot-card-top">
                <div style={{ flex: 1 }}>
                  <h3 className="wt-spot-title">{spot.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span className="wt-spot-type-tag">{spot.type}</span>
                    <span
                      className={`wt-bortle-badge ${
                        spot.bortleClass && spot.bortleClass <= 2
                          ? "dark"
                          : spot.bortleClass && spot.bortleClass <= 4
                          ? "rural"
                          : "suburban"
                      }`}
                    >
                      {spot.bortleDesc ? spot.bortleDesc.split("·")[0].trim() : `Bortle ${spot.bortleClass}`}
                    </span>
                  </div>
                </div>

                {spot.honorRating && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span style={{ fontSize: "0.68rem", color: "var(--washi-muted)" }}>HONOR</span>
                    <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--gold-moon-bright)" }}>
                      {spot.honorRating}
                    </span>
                  </div>
                )}
              </div>

              {/* Telemetry Row */}
              <div className="wt-spot-telemetry-row">
                <span>
                  📍 <strong>{spot.distanceKm.toFixed(1)} km</strong> ({spot.cardinalDirection})
                </span>
                {spot.elevationMeters && (
                  <span>
                    ⛰️ <strong>{spot.elevationMeters}m</strong> elevation
                  </span>
                )}
                {spot.bortleDesc && (
                  <span style={{ color: "var(--washi-muted)", fontSize: "0.72rem" }}>
                    {spot.bortleDesc.split("·")[1]?.trim() || ""}
                  </span>
                )}
              </div>

              {/* Samurai Stargazing Tip */}
              {spot.stargazingTip && (
                <div className="wt-spot-tip">
                  <Feather size={12} color="var(--gold-moon)" style={{ display: "inline", marginRight: 6 }} />
                  <span>{spot.stargazingTip}</span>
                </div>
              )}

              {/* Card Footer: Action Buttons */}
              <div className="wt-spot-footer">
                <button
                  type="button"
                  className="wt-spot-locate-btn"
                  onClick={() => handleFocusSpot(spot)}
                >
                  <Crosshair size={12} />
                  <span>Inspect on Scroll</span>
                </button>

                <a
                  href={`https://www.openstreetmap.org/?mlat=${spot.latitude}&mlon=${spot.longitude}#map=15/${spot.latitude}/${spot.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: "0.74rem",
                    color: "var(--washi-muted)",
                    textDecoration: "underline",
                  }}
                >
                  OpenStreetMap
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="wt-muted" style={{ marginTop: 14, fontSize: "0.78rem" }}>
          Observing sanctuary suitability metrics are computed using distance from city luminance cores, elevation
          advantage, and open horizon parameters. Always verify local night access and safety before journeying after dusk.
        </p>
      </section>
    </div>
  );
};

export default Watchtower;
