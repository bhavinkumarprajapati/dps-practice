import type { Weather } from "./types";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : `Request failed (${response.status})`);
  }
  return response.json();
}

export function getCities(): Promise<string[]> {
  return request<string[]>("/cities");
}

export function getWeather(city: string): Promise<Weather> {
  // encodeURIComponent: city names could contain spaces or special characters
  return request<Weather>(`/weather/${encodeURIComponent(city)}`);
}
