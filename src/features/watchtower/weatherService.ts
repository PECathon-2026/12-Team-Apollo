
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export interface Place {
  id: string;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface HourlyWeather {
  time: string;
  cloudCover: number;
  humidity: number;
  visibilityKm: number;
  precipitationProbability: number;
}

export interface WeatherForecast {
  hourly: HourlyWeather[];
  timezone: string;
  source: "Open-Meteo";
}

export interface ObservingSpot {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<any> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}). Please try again.`);
  }

  return response.json();
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<Place[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const params = new URLSearchParams({
    name: trimmed,
    count: "8",
    language: "en",
    format: "json",
  });

  const data = await fetchJson(`${GEOCODING_URL}?${params}`, signal);

  return (data.results ?? []).map((item: any) => ({
    id: String(item.id),
    name: item.name,
    country: item.country,
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone,
  }));
}

export async function getForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly:
      "cloud_cover,relative_humidity_2m,visibility,precipitation_probability",
    forecast_days: "3",
    timezone: "auto",
  });

  const data = await fetchJson(`${FORECAST_URL}?${params}`, signal);

  if (
    !data.hourly?.time ||
    !data.hourly?.cloud_cover ||
    !data.hourly?.relative_humidity_2m ||
    !data.hourly?.visibility ||
    !data.hourly?.precipitation_probability
  ) {
    throw new Error("The weather service returned incomplete forecast data.");
  }

  const hourly: HourlyWeather[] = data.hourly.time.map(
    (time: string, index: number) => ({
      time,
      cloudCover: data.hourly.cloud_cover[index],
      humidity: data.hourly.relative_humidity_2m[index],
      visibilityKm: data.hourly.visibility[index] / 1000,
      precipitationProbability:
        data.hourly.precipitation_probability[index],
    })
  );

  return {
    hourly,
    timezone: data.timezone ?? "auto",
    source: "Open-Meteo",
  };
}

function distanceBetweenKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

export async function getNearbySpots(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<ObservingSpot[]> {
  // Search for mapped parks, viewpoints, and observatories
  // within 15 km. These are candidate places, not guarantees
  // of dark skies or legal access after dark.
  const query = `
    [out:json][timeout:20];
    (
      nwr(around:15000,${latitude},${longitude})["leisure"="park"];
      nwr(around:15000,${latitude},${longitude})["tourism"="viewpoint"];
      nwr(around:15000,${latitude},${longitude})["observatory"="yes"];
      nwr(around:15000,${latitude},${longitude})["man_made"="observatory"];
    );
    out center tags;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams({ data: query }),
    signal,
  });

  if (!response.ok) {
    throw new Error("Nearby places could not be loaded.");
  }

  const data = await response.json();

  const spots: ObservingSpot[] = (data.elements ?? [])
    .map((item: any) => {
      const lat = item.lat ?? item.center?.lat;
      const lon = item.lon ?? item.center?.lon;

      if (
        typeof lat !== "number" ||
        typeof lon !== "number"
      ) {
        return null;
      }

      const tags = item.tags ?? {};
      const type =
        tags.tourism === "viewpoint"
          ? "Viewpoint"
          : tags.observatory === "yes" ||
              tags.man_made === "observatory"
            ? "Observatory"
            : "Park";

      return {
        id: `${item.type}-${item.id}`,
        name: tags.name || `${type} (unnamed on OpenStreetMap)`,
        type,
        latitude: lat,
        longitude: lon,
        distanceKm: distanceBetweenKm(latitude, longitude, lat, lon),
      };
    })
    .filter((spot: ObservingSpot | null): spot is ObservingSpot => spot !== null)
    .sort(
      (a: ObservingSpot, b: ObservingSpot) =>
        a.distanceKm - b.distanceKm
    );

  return spots.slice(0, 15);
}
