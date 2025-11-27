// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      // automatically update the service worker when a new build is available
      registerType: "autoUpdate",

      // copy these assets into the build output so the manifest can reference them
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"],

      // web app manifest (customize name/short_name/theme_color/icons as needed)
      manifest: {
        name: "Your App Name",
        short_name: "App",
        description: "My awesome PWA",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        icons: [
          { src: "icons/192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      // Workbox options for runtime caching (tweak routes/strategies as needed)
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"],
        runtimeCaching: [
          {
            // Network-first for navigation and JS/CSS so users get newest UI, fallback to cache
            urlPattern: ({ request }) =>
              request.destination === "document" ||
              request.destination === "script" ||
              request.destination === "style",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-js-css-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Cache-first for images
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
              },
            },
          },
        ],
      },
    }),
  ],
});
