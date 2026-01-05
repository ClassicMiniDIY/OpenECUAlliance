// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/icon',
  ],

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: true,
  },

  app: {
    head: {
      title: 'OpenECU Alliance',
      meta: [
        { name: 'description', content: 'Open specification for standardizing ECU log data formats' },
      ],
    },
  },

  future: {
    compatibilityVersion: 4,
  },
})
