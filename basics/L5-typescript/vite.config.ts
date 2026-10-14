import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Same proxy as L4: /api/... is forwarded to the Python backend on port 8000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
