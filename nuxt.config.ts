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
      link: [
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      ],
    },
  },

  future: {
    compatibilityVersion: 4,
  },
});
