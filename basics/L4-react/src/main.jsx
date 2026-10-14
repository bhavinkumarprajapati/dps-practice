// Entry point: find <div id="root"> in index.html and render <App /> inside it.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode runs some code twice in development to reveal bugs (e.g. effects run twice).
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
