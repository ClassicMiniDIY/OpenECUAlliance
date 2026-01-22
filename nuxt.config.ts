// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/fonts', '@nuxt/icon', '@nuxtjs/sitemap', '@nuxtjs/supabase'],

  // Supabase configuration
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',
      exclude: [
        '/',
        '/adapters',
        '/adapters/*',
        '/protocols',
        '/protocols/*',
        '/models',
        '/models/*',
        '/users/*',
        '/docs',
        '/docs/*',
        '/spec',
        '/ecosystem',
        '/contribute',
        '/api/adapters',
        '/api/adapters/*',
        '/api/protocols',
        '/api/protocols/*',
        '/api/specs',
        '/api/specs/*',
        '/api/assets',
        '/api/assets/*',
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: true,
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
  },

  // Site URL for sitemap and SEO
  site: {
    url: 'https://openecualliance.org',
    name: 'OpenECU Alliance',
  },

  // Sitemap configuration
  sitemap: {
    strictNuxtContentPaths: true,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      title: 'OpenECU Alliance - Open Source Motorsports Community',
      titleTemplate: '%s',
      meta: [
        // Primary Meta Tags
        {
          name: 'description',
          content: 'One community. Shared standards. Free resources for ECU enthusiasts, tuners, and developers.',
        },
        {
          name: 'keywords',
          content:
            'ECU, engine control unit, log viewer, data logging, automotive, tuning, Haltech, ECUMaster, AEM, Link ECU, MoTeC, Speeduino, rusEFI, open source',
        },
        { name: 'author', content: 'OpenECU Alliance' },
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },

        // Theme Color (dark mode only)
        {
          name: 'theme-color',
          content: '#0a0a0f',
        },

        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://openecualliance.org' },
        {
          property: 'og:title',
          content: 'OpenECU Alliance - Open Source Motorsports Community',
        },
        {
          property: 'og:description',
          content: 'One community. Shared standards. Free resources for ECU enthusiasts, tuners, and developers.',
        },
        {
          property: 'og:image',
          content: 'https://openecualliance.org/og-image.png',
        },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        {
          property: 'og:image:alt',
          content: 'OpenECU Alliance - The OpenECU Spec',
        },
        { property: 'og:site_name', content: 'OpenECU Alliance' },
        { property: 'og:locale', content: 'en_US' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://openecualliance.org' },
        {
          name: 'twitter:title',
          content: 'OpenECU Alliance - Open Source Motorsports Community',
        },
        {
          name: 'twitter:description',
          content: 'One community. Shared standards. Free resources for ECU enthusiasts, tuners, and developers.',
        },
        {
          name: 'twitter:image',
          content: 'https://openecualliance.org/og-image.png',
        },
        {
          name: 'twitter:image:alt',
          content: 'OpenECU Alliance - The OpenECU Spec',
        },

        // Additional SEO
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
        { name: 'apple-mobile-web-app-title', content: 'OpenECU Alliance' },
      ],
      link: [
        // Favicons
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        { rel: 'manifest', href: '/site.webmanifest' },

        // Canonical
        { rel: 'canonical', href: 'https://openecualliance.org' },

        // Preconnect for performance
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
      ],
    },
  },

  // Runtime configuration
  runtimeConfig: {
    // Private keys (server-only)
    // None currently used

    // Public keys (exposed to client)
    public: {
      adapterCacheTTL: 900, // 15 minutes in seconds (updated from 5 minutes)
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  // Experimental features for better performance
  experimental: {
    viewTransition: true,
  },

  // Route rules for caching and redirects
  routeRules: {
    // Static pages - cache for 1 hour
    '/': { prerender: true },
    '/spec': { prerender: true },
    '/docs/**': { prerender: true },
    '/ecosystem': { prerender: true },
    '/contribute': { prerender: true },

  },
});
