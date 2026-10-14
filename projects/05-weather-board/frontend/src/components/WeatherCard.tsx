import { useEffect, useState } from "react";
import * as api from "../api";
import type { Weather } from "../types";

const ICONS: Record<string, string> = {
  Sunny: "☀️",
  Cloudy: "☁️",
  Rainy: "🌧",
  Windy: "💨",
  Foggy: "🌫",
};

type WeatherCardProps = {
  city: string;
};

// Each card loads its own data when it appears (and again if `city` changes).
export default function WeatherCard({ city }: WeatherCardProps) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .getWeather(city)
      .then(setWeather)
      .catch(() => setFailed(true));
  }, [city]);

  if (failed) return <div className="weather-card">Something went wrong.</div>;
  if (!weather) return <div className="weather-card">Loading…</div>;

  return (
    <div className="weather-card">
      <h3>{weather.city}</h3>
      <div className="icon">{ICONS[weather.condition] ?? "🌡"}</div>
      <div className="temp">{weather.temperature_c.toFixed(1)} °C</div>
      <div className="muted">{weather.condition}</div>
      <div className="muted">💨 {weather.wind_kph} km/h</div>
    </div>
  );
}
