import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
  },

  preview: {
    host: "0.0.0.0",
    port: 4173,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,

    /*
    |--------------------------------------------------------------------
    | Phase 4 production bundle split
    |--------------------------------------------------------------------
    | Route-level React.lazy chunks are complemented by stable vendor
    | chunks so map/socket libraries are cached independently.
    */
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "map-vendor": ["leaflet", "react-leaflet"],
          "network-vendor": ["axios", "socket.io-client"],
        },
      },
    },
  },
});
