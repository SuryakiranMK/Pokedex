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
          {
            urlPattern: /^https:\/\/pokeapi\.co\/api\/v2\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokeapi-cache',
              expiration: { maxEntries: 500, maxAgeSeconds: 86400 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-images-cache',
              expiration: { maxEntries: 1000, maxAgeSeconds: 86400 * 30 },
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
