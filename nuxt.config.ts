// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/fonts", "@nuxt/icon", "@nuxtjs/sitemap"],

  css: ["~/assets/css/main.css"],

  ui: {
    colorMode: true,
  },

  colorMode: {
    preference: "dark",
    fallback: "dark",
    classSuffix: "",
  },

  // Site URL for sitemap and SEO
  site: {
    url: "https://openecualliance.org",
    name: "OpenECU Alliance",
  },

  // Sitemap configuration
  sitemap: {
    strictNuxtContentPaths: true,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "OpenECU Alliance - Open ECU Log Data Specification",
      titleTemplate: "%s | OpenECU Alliance",
      meta: [
        // Primary Meta Tags
        {
          name: "description",
          content:
            "The OpenECU Alliance publishes the OpenECU Spec - an open specification for standardizing ECU log data formats. One spec, every manufacturer, any analysis tool.",
        },
        {
          name: "keywords",
          content:
            "ECU, engine control unit, log viewer, data logging, automotive, tuning, Haltech, ECUMaster, AEM, Link ECU, MoTeC, Speeduino, rusEFI, open source",
        },
        { name: "author", content: "OpenECU Alliance" },
        { name: "robots", content: "index, follow" },
        { name: "googlebot", content: "index, follow" },

        // Theme Color (dark mode only)
        {
          name: "theme-color",
          content: "#0a0a0f",
        },

        // Open Graph / Facebook
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://openecualliance.org" },
        {
          property: "og:title",
          content: "OpenECU Alliance - Open ECU Log Data Specification",
        },
        {
          property: "og:description",
          content:
            "The OpenECU Alliance publishes the OpenECU Spec - an open specification for standardizing ECU log data formats. One spec, every manufacturer, any analysis tool.",
        },
        {
          property: "og:image",
          content: "https://openecualliance.org/og-image.png",
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: "OpenECU Alliance - The OpenECU Spec",
        },
        { property: "og:site_name", content: "OpenECU Alliance" },
        { property: "og:locale", content: "en_US" },

        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: "https://openecualliance.org" },
        {
          name: "twitter:title",
          content: "OpenECU Alliance - Open ECU Log Data Specification",
        },
        {
          name: "twitter:description",
          content:
            "The OpenECU Alliance publishes the OpenECU Spec - an open specification for standardizing ECU log data formats. One spec, every manufacturer, any analysis tool.",
        },
        {
          name: "twitter:image",
          content: "https://openecualliance.org/og-image.png",
        },
        {
          name: "twitter:image:alt",
          content: "OpenECU Alliance - The OpenECU Spec",
        },

        // Additional SEO
        { name: "format-detection", content: "telephone=no" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "apple-mobile-web-app-title", content: "OpenECU Alliance" },
      ],
      link: [
        // Favicons
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },

        // Canonical
        { rel: "canonical", href: "https://openecualliance.org" },

        // Preconnect for performance
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
      ],
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  // Experimental features for better performance
  experimental: {
    viewTransition: true,
  },

  // Route rules for caching
  routeRules: {
    // Static pages - cache for 1 hour
    "/": { prerender: true },
    "/spec": { prerender: true },
    "/docs/**": { prerender: true },
    "/ecosystem": { prerender: true },
    "/contribute": { prerender: true },
  },
});
