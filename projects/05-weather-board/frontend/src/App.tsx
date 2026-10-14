import { useState } from "react";
import type { FormEvent } from "react";
import WeatherCard from "./components/WeatherCard";

export default function App() {
  const [cities, setCities] = useState<string[]>(["Munich", "Berlin", "Hamburg"]);
  const [newCity, setNewCity] = useState("");

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newCity.trim();
    if (!name) return;
    setCities([...cities, name]);
    setNewCity("");
  }

  return (
    <div className="container wide">
      <h1>🌤 Weather Board</h1>

      <form className="add-city" onSubmit={handleAdd}>
        <input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Add a city, e.g. Garching" />
        <button type="submit" className="primary">
          Add
        </button>
      </form>

      <div className="cards">
        {cities.map((city) => (
          <WeatherCard key={city} city={city} />
        ))}
      </div>
    </div>
  );
}
