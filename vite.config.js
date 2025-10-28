import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
  },
  server: {
    // allowedHosts: ["16022e44d49d.ngrok-free.app"],
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
