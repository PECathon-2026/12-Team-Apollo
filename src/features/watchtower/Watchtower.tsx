
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

const selectedLocationIcon = L.divIcon({
  className: "iss-custom-marker",
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

// React-Leaflet does not automatically recenter the map
// when the selected coordinates change.
function RecenterMap({ latitude, longitude }: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 11, { animate: true });
  }, [latitude, longitude, map]);

  return null;
}

function localHour(time: string): number {
  return Number(time.split("T")[1]?.slice(0, 2) ?? 0);
}

// Open-Meteo returns local timestamps for the requested
// timezone, so compare them with the location's local time.
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

function formatLocalTime(time: string) {
  // Keep the timestamp as returned by Open-Meteo.
  // Parsing it with new Date(time) would use the browser's
  // timezone, which may differ from the selected location.
  return time.replace("T", " ");
}

export const Watchtower: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [spots, setSpots] = useState<ObservingSpot[]>([]);

  const [searching, setSearching] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [weatherError, setWeatherError] = useState("");
  const [spotsError, setSpotsError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const searchController = useRef<AbortController | null>(null);

  // Search for cities using Open-Meteo's geocoding API.
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
  }

  // Ask for browser location only after the user clicks.
  function useCurrentLocation() {
    setLocationMessage("");
    setSearchError("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Location access is not supported by this browser. Search for a city instead."
      );
      return;
    }

    setLocationMessage("Requesting location permission…");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const place: Place = {
          id: "browser-current-location",
          name: "Current location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone: undefined,
        };

        setQuery("Current location");
        choosePlace(place);
        setLocationMessage(
          "Using your device coordinates. No city name was needed."
        );
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. You can still search for a city manually."
            : error.code === error.TIMEOUT
              ? "Location lookup timed out. Please try again or search manually."
              : "Could not determine your location. Please search manually.";

        setLocationMessage(message);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  }

  // Load weather and nearby places when the selected coordinates change.
  // A failed nearby-place query does not prevent weather from displaying.
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

      const weatherPromise = getForecast(
        currentPlace.latitude,
        currentPlace.longitude,
        controller.signal
      );

      const spotsPromise = getNearbySpots(
        currentPlace.latitude,
        currentPlace.longitude,
        controller.signal
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
              : "Weather could not be loaded."
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
            setSpotsError(
              "Nearby places could not be loaded. The selected-location map is still available."
            );
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
        precipitationProbability:
          selectedWeather.precipitationProbability,
      })
    : null;

  function retryWeather() {
    if (selectedPlace) {
      setRetryCount((count) => count + 1);
    }
  }

  return (
    <div className="watchtower">
      {/* Header and city search */}
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
                NIGHT SKY OBSERVATORY
              </span>
            </div>

            <h1 style={{ fontSize: "1.8rem", marginBottom: 6 }}>
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
              Find your observing conditions, explore the evening forecast,
              and discover mapped places near you.
            </p>
          </div>
        </div>

        <form className="wt-search-form" onSubmit={handleSearch}>
          <input
            className="wt-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a city, e.g. Jaipur"
            aria-label="Search city or place"
          />

          <button
            type="submit"
            className="wt-button wt-button-primary"
            disabled={searching}
          >
            {searching ? (
              <span className="wt-spinner" />
            ) : (
              <Search size={16} />
            )}
            {searching ? "Searching…" : "Search"}
          </button>

          <button
            type="button"
            className="wt-button"
            onClick={useCurrentLocation}
          >
            <LocateFixed size={16} />
            Use my location
          </button>
        </form>

        {searchError && <p className="wt-error">{searchError}</p>}

        {locationMessage && (
          <p className="wt-notice" role="status">
            {locationMessage}
          </p>
        )}

        {results.length > 0 && (
          <div className="wt-place-results">
            <p className="wt-muted">Choose the correct location:</p>

            {results.map((place) => (
              <button
                type="button"
                key={place.id}
                className="wt-place-option"
                onClick={() => choosePlace(place)}
              >
                <MapPin
                  size={15}
                  style={{
                    display: "inline",
                    marginRight: 8,
                    color: "var(--gold-moon)",
                  }}
                />
                <strong>{place.name}</strong>
                <span className="wt-muted">
                  {" "}
                  {[place.admin1, place.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </button>
            ))}
          </div>
        )}

        {selectedPlace && (
          <p className="wt-muted" style={{ marginTop: 12 }}>
            Selected: <strong>{selectedPlace.name}</strong>
            {" · "}
            {selectedPlace.latitude.toFixed(3)}°,{" "}
            {selectedPlace.longitude.toFixed(3)}°
          </p>
        )}
      </section>

      {!selectedPlace && (
        <section className="sumi-card">
          <h3>Begin your observation</h3>
          <p className="wt-muted">
            Search for a city or choose “Use my location” to load real weather
            data and the map. Your browser will ask for permission if you
            request your current location.
          </p>
        </section>
      )}

      {selectedPlace && (
        <>
          {/* Night Honor Score */}
          <section className="sumi-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <MoonStar size={20} color="var(--gold-moon)" />
              <h2 style={{ fontSize: "1.15rem" }}>Night Honor Score</h2>
            </div>

            {weatherLoading && !forecast && (
              <p className="wt-muted" role="status">
                <span className="wt-spinner" /> Loading the evening forecast…
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
                  <RefreshCw size={15} />
                  Retry
                </button>
              </div>
            )}

            {forecast && selectedWeather && (
              <>
                <div className="wt-score-layout">
                  <div className="wt-score-circle">
                    <div>
                      <div className="wt-score-number">{honorScore}</div>
                      <div className="wt-score-caption">OUT OF 100</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 180 }}>
                    <h3 style={{ marginBottom: 8 }}>
                      {honorScore! >= 75
                        ? "Promising conditions"
                        : honorScore! >= 50
                          ? "Mixed conditions"
                          : "Challenging conditions"}
                    </h3>
                    <p className="wt-muted">
                      Approximate planning score for{" "}
                      {formatLocalTime(selectedWeather.time)} in{" "}
                      {forecast.timezone}.
                    </p>
                    <p className="wt-muted">
                      Source: Open-Meteo · Live API forecast
                    </p>
                  </div>
                </div>

                <p className="wt-notice" style={{ marginTop: 16 }}>
                  This approximate score weights inverse cloud cover at 55%,
                  visibility at 20%, inverse humidity at 10%, and inverse
                  precipitation probability at 15%. Visibility is normalized
                  against a 20 km reference. It is not a scientific guarantee
                  of observing conditions.
                </p>
              </>
            )}
          </section>

          {/* Weather metrics */}
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
              <h2 style={{ fontSize: "1.15rem" }}>
                Evening Weather Conditions
              </h2>

              {forecast && (
                <span className="gold-badge">REAL API DATA</span>
              )}
            </div>

            {selectedWeather && (
              <>
                <label
                  htmlFor="wt-evening-hour"
                  className="wt-muted"
                  style={{ display: "block", marginBottom: 8 }}
                >
                  Select an evening forecast time ({forecast?.timezone})
                </label>

                <select
                  id="wt-evening-hour"
                  className="wt-hour-select"
                  value={selectedWeather.time}
                  onChange={(event) => setSelectedTime(event.target.value)}
                >
                  {eveningForecast.map((hour) => (
                    <option key={hour.time} value={hour.time}>
                      {formatLocalTime(hour.time)}
                    </option>
                  ))}
                </select>

                <div className="wt-metrics" style={{ marginTop: 20 }}>
                  <div className="metric-pill wt-metric">
                    <Cloud size={20} color="var(--gold-moon)" />
                    <span className="wt-metric-label">Cloud cover</span>
                    <span className="wt-metric-value">
                      {selectedWeather.cloudCover}%
                    </span>
                  </div>

                  <div className="metric-pill wt-metric">
                    <Eye size={20} color="var(--gold-moon)" />
                    <span className="wt-metric-label">Visibility</span>
                    <span className="wt-metric-value">
                      {selectedWeather.visibilityKm.toFixed(1)} km
                    </span>
                  </div>

                  <div className="metric-pill wt-metric">
                    <Droplets size={20} color="var(--gold-moon)" />
                    <span className="wt-metric-label">Relative humidity</span>
                    <span className="wt-metric-value">
                      {selectedWeather.humidity}%
                    </span>
                  </div>

                  <div className="metric-pill wt-metric">
                    <CloudRain size={20} color="var(--gold-moon)" />
                    <span className="wt-metric-label">
                      Precipitation probability
                    </span>
                    <span className="wt-metric-value">
                      {selectedWeather.precipitationProbability}%
                    </span>
                  </div>
                </div>
              </>
            )}

            {forecast && !selectedWeather && (
              <p className="wt-muted">
                No evening-hour forecast is available in this response.
              </p>
            )}

            {!forecast && !weatherLoading && !weatherError && (
              <p className="wt-muted">
                Weather conditions will appear here after the forecast loads.
              </p>
            )}
          </section>

          {/* Hourly forecast cards */}
          {forecast && (
            <section className="sumi-card">
              <h2 style={{ fontSize: "1.15rem", marginBottom: 16 }}>
                Hourly Evening Forecast
              </h2>

              <div className="wt-hourly-grid">
                {eveningForecast.map((hour) => (
                  <button
                    type="button"
                    key={hour.time}
                    className={`wt-hour-card ${
                      hour.time === selectedWeather?.time
                        ? "wt-hour-card-selected"
                        : ""
                    }`}
                    onClick={() => setSelectedTime(hour.time)}
                    style={{
                      color: "var(--washi-white)",
                      textAlign: "left",
                      cursor: "pointer",
                      font: "inherit",
                    }}
                  >
                    <strong>{hour.time.slice(11, 16)}</strong>
                    <span className="wt-muted">
                      Clouds: {hour.cloudCover}%
                    </span>
                    <span className="wt-muted">
                      Visibility: {hour.visibilityKm.toFixed(1)} km
                    </span>
                    <span className="wt-muted">
                      Rain chance: {hour.precipitationProbability}%
                    </span>
                  </button>
                ))}
              </div>

              <p className="wt-muted" style={{ marginTop: 12 }}>
                Forecast times are local to the selected location.
              </p>
            </section>
          )}

          {/* Interactive map */}
          <section className="sumi-card" style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Compass size={19} color="var(--gold-moon)" />
              <h2 style={{ fontSize: "1.15rem" }}>
                Observing Map
              </h2>
            </div>

            <p className="wt-muted" style={{ marginBottom: 12 }}>
              Red marker: selected location. Green markers: places mapped on
              OpenStreetMap that may be worth investigating.
            </p>

            <div className="wt-map">
              <MapContainer
                center={[
                  selectedPlace.latitude,
                  selectedPlace.longitude,
                ]}
                zoom={11}
                scrollWheelZoom
                style={{ height: "100%", width: "100%" }}
              >
                <RecenterMap
                  latitude={selectedPlace.latitude}
                  longitude={selectedPlace.longitude}
                />

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={[
                    selectedPlace.latitude,
                    selectedPlace.longitude,
                  ]}
                  icon={selectedLocationIcon}
                >
                  <Popup>
                    <strong>{selectedPlace.name}</strong>
                    <br />
                    Selected location
                  </Popup>
                </Marker>

                {spots.map((spot) => (
                  <Marker
                    key={spot.id}
                    position={[spot.latitude, spot.longitude]}
                    icon={spotIcon}
                  >
                    <Popup>
                      <strong>{spot.name}</strong>
                      <br />
                      {spot.type}
                      <br />
                      {spot.distanceKm.toFixed(1)} km away
                      <br />
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${spot.latitude}&mlon=${spot.longitude}#map=16/${spot.latitude}/${spot.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on OpenStreetMap
                      </a>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 8 }}>
                Nearby Observing Suggestions
              </h3>

              {spotsLoading && (
                <p className="wt-muted" role="status">
                  <span className="wt-spinner" /> Searching mapped places…
                </p>
              )}

              {spotsError && (
                <p className="wt-notice" role="status">
                  {spotsError}
                </p>
              )}

              {!spotsLoading && !spotsError && spots.length === 0 && (
                <p className="wt-muted">
                  No matching mapped places were found nearby. You can still
                  use the selected-location map.
                </p>
              )}

              {spots.length > 0 && (
                <div className="wt-spot-list">
                  {spots.map((spot) => (
                    <div key={spot.id} className="wt-spot">
                      <strong>{spot.name}</strong>
                      <p className="wt-muted">
                        {spot.type} · {spot.distanceKm.toFixed(1)} km away
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <p className="wt-muted" style={{ marginTop: 12 }}>
                Nearby-place data comes from OpenStreetMap. Mapped places
                are suggestions only; check access, opening hours, safety,
                and local light pollution before visiting.
              </p>

              <p className="wt-muted" style={{ marginTop: 8 }}>
                Map tiles © OpenStreetMap contributors.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
