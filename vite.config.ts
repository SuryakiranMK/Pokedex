import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'PokéDex',
        short_name: 'PokéDex',
        description: 'Next-generation Pokédex experience',
        theme_color: '#0f0f1a',
        background_color: '#0f0f1a',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          // ── PokeAPI JSON data ──────────────────────────────────────────────
          // StaleWhileRevalidate: serve instantly from cache, silently refresh
          // in the background so data never goes stale.
          {
            urlPattern: /^https:\/\/pokeapi\.co\/api\/v2\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pokeapi-data-cache',
              expiration: {
                maxEntries: 600,
                maxAgeSeconds: 86400 * 7,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Official artwork (high-res, ~130 kB each) ─────────────────────
          // CacheFirst: once downloaded, serve locally forever (30 days).
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/master\/sprites\/pokemon\/other\/official-artwork\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-artwork-cache',
              expiration: {
                maxEntries: 1500,
                maxAgeSeconds: 86400 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Default front sprites (~2 kB each) ────────────────────────────
          // CacheFirst: tiny, frequently used in dropdowns. Cache aggressively.
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/master\/sprites\/pokemon\/\d+\.png.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-sprite-cache',
              expiration: {
                maxEntries: 1500,
                maxAgeSeconds: 86400 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Home sprites & shiny artwork ──────────────────────────────────
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/master\/sprites\/pokemon\/other\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-other-sprites-cache',
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: 86400 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: { alias: { '@': '/src' } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const parts = id.split('node_modules/')
            const pathParts = parts[parts.length - 1].split('/')
            const pkgName = pathParts[0].startsWith('@') ? `${pathParts[0]}/${pathParts[1]}` : pathParts[0]

            if (pkgName === 'react' || pkgName === 'react-dom' || pkgName === 'scheduler' || pkgName === 'react-is') {
              return 'vendor-react'
            }
            if (pkgName.startsWith('@tanstack/react-query')) {
              return 'vendor-query'
            }
            if (pkgName === 'framer-motion') {
              return 'vendor-framer'
            }
            if (pkgName === 'recharts' || pkgName.startsWith('d3')) {
              return 'vendor-recharts'
            }
            return 'vendor-others'
          }
        },
      },
    },
  },
})
