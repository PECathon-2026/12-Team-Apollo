
export interface WeatherInputs {
  cloudCover: number;
  visibilityKm: number;
  humidity: number;
  precipitationProbability: number;
}

/**
 * Approximate Night Honor Score from 0 to 100.
 *
 * Visibility is normalized against a 20 km clear-sky reference:
 * visibilityScore = min(visibilityKm / 20, 1) * 100.
 *
 * Weights:
 * Cloud cover: 55%
 * Visibility: 20%
 * Humidity: 10%
 * Precipitation probability: 15%
 *
 * This is a planning aid, not a scientific guarantee of observing conditions.
 */
export function calculateHonorScore(weather: WeatherInputs): number {
  const clamp = (value: number) => Math.max(0, Math.min(100, value));

  const cloudScore = 100 - clamp(weather.cloudCover);
  const visibilityScore = clamp((weather.visibilityKm / 20) * 100);
  const humidityScore = 100 - clamp(weather.humidity);
  const precipitationScore = 100 - clamp(weather.precipitationProbability);

  const score =
    cloudScore * 0.55 +
    visibilityScore * 0.20 +
    humidityScore * 0.10 +
    precipitationScore * 0.15;

  return Math.round(clamp(score));
}
