import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: [vite.svg],

    //   workbox: {
    //     clientsClaim: true,
    //     skipWaiting: true,
    //     navigateFallback: "/index.html",
    //     globPatterns: ["**,*.js,jsx,css,html,png,jpg,jpeg,webp,svg"],
    //   },

    //   manifest: {
    //     name: 'Papeleria Magic',
    //     short_name: 'P-M',
    //     description: 'Aplicacion web de papeleria y varidades con vistas administrativas y catalogo.',
    //     theme_color: '#ffffff',
    //     icons: [
    //       {
    //         src: '\src\assets\PapeleriaMagicLogo.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '\src\assets\PapeleriaMagicLogo.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       }
    //     ],
    //     screenshots: [
    //       {
    //         src: '/pwa-1280-581 / (640-480)',
    //         sizes: '1280-581 / (640-480)',
    //         type: 'image/png',
    //         form_factor: 'wide / narrow'
    //       }
    //     ],
    //   }
    // })
  ],
})
