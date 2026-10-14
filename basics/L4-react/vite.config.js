import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Every request starting with /api is forwarded to the Python backend on port 8000.
// So in React we write fetch("/api/books"), never "http://localhost:8000/api/books".
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
