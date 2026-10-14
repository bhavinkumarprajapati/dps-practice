import { useEffect, useState } from "react";
import * as api from "./api.js";

export default function App() {
  const [counter, setCounter] = useState(null); // { value: number } once loaded
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getCounter()
      .then(setCounter)
      .catch((err) => setError(err.message));
  }, []);

  async function handleIncrement() {
    try {
      setCounter(await api.increment());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h1>Click Counter</h1>

      {error && <p className="error">⚠️ {error}</p>}

      {counter === null ? (
        <p>Loading…</p>
      ) : (
        <>
          <p className="value">{counter.value}</p>
          <div className="buttons">
            <button className="primary" onClick={handleIncrement}>
              +1
            </button>
          </div>
        </>
      )}
    </div>
  );
}
