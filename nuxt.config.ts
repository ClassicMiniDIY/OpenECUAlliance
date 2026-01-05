// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/fonts", "@nuxt/icon"],

  css: ["~/assets/css/main.css"],

  ui: {
    colorMode: true,
  },

  colorMode: {
    preference: "dark",
  },

  app: {
    head: {
      title: "OpenECU Alliance",
      meta: [
        {
          name: "description",
          content: "Open specification for standardizing ECU log data formats",
        },
        {
          name: "theme-color",
          content: "#0a0a0f",
          media: "(prefers-color-scheme: dark)",
        },
        {
          name: "theme-color",
          content: "#00ffff",
          media: "(prefers-color-scheme: light)",
        },
      ],
    },
  },

  future: {
    compatibilityVersion: 4,
  },
});
