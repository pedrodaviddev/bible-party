// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  future: {
    compatibilityVersion: 4,
  },

  modules: ['@vite-pwa/nuxt', '@pinia/nuxt'],
  pwa: {
    manifest: {
      name: 'Bible Party',
      short_name: 'Bible Party',
      description: 'Bible Party',
      theme_color: '#ffffff',
      icons: [
        { src: 'icons/icon64x64.png', sizes: '64x64', type: 'image/png' },
        { src: 'icons/icon144x144.png', sizes: '144x144', type: 'image/png' },
        { src: 'icons/icon192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/icon512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      navigateFallback: '/',
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },
})