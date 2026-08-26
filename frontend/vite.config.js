import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('exceljs') || id.includes('/xlsx/') || id.includes('xlsx-js-style')) {
            return 'vendor-excel'
          }

          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'vendor-pdf'
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts'
          }

          // Let Rollup place the remaining dependencies with their consumers.
          return undefined
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['PapeleriaMagicLogo_192x192.png'],

      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/\.pdf$/],
        globPatterns: ["**/*.{js,mjs,wasm,css,html,png,jpg,jpeg,webp,svg,ico,json,webmanifest}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },

      manifest: {
        name: 'Papeleria Magic',
        short_name: 'P-M',
        description: 'Aplicacion web de papeleria y varidades con vistas administrativas y catalogo.',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/PapeleriaMagicLogo_192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/PapeleriaMagicLogo_512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        // screenshots: [
        //   {
        //     src: '/pwa-1280-581.png', // (1280-581) / (640-480)
        //     sizes: '1280x581',
        //     type: 'image/png',
        //     form_factor: 'wide'
        //   }
        // ],
      }
    })
  ],
})
