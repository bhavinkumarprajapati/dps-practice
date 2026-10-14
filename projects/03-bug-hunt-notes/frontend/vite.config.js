import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// NOTE: this project does NOT use the Vite proxy.
// The frontend calls the backend directly at http://localhost:8000 (see src/api.js),
// so the backend must allow this origin via CORS.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
