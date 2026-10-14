// Must match the backend's Pydantic response model `Weather` in backend/main.py
export interface Weather {
  city: string;
  temperature_c: number;
  condition: string;
  wind_kph: number;
}
