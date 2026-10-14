import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// The `!` tells TypeScript "trust me, this element exists" (getElementById can return null).
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
