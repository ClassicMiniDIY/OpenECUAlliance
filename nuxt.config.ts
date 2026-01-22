// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/fonts', '@nuxt/icon', '@nuxtjs/sitemap', '@nuxtjs/supabase'],

  // Icon configuration - only bundle icons that are actually used
  icon: {
    serverBundle: {
      collections: ['heroicons', 'lucide'],
      // Remote fetch for large collections (simple-icons, mdi) to avoid 4MB+ bundles
    },
    // Explicitly include the few simple-icons and mdi icons we use
    clientBundle: {
      icons: [
        'simple-icons:github',
        'simple-icons:bambulab',
        'simple-icons:printables',
        'simple-icons:thingiverse',
        'mdi:cube-outline',
      ],
      scan: true,
    },
  },

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
    // Exclude dynamic routes that require database queries during build
    exclude: ['/admin/**', '/profile/**', '/login', '/auth/**', '/models/**', '/users/**'],
    // Disable automatic route discovery to prevent hanging during build
    autoLastmod: false,
    discoverImages: false,
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

    // Rate limiting configuration
    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLED !== 'false', // Default: true
      listPerMinute: parseInt(process.env.RATE_LIMIT_LIST_PER_MINUTE || '30'),
      listPerHour: parseInt(process.env.RATE_LIMIT_LIST_PER_HOUR || '300'),
      detailPerMinute: parseInt(process.env.RATE_LIMIT_DETAIL_PER_MINUTE || '60'),
      detailPerHour: parseInt(process.env.RATE_LIMIT_DETAIL_PER_HOUR || '600'),
      downloadPerMinute: parseInt(process.env.RATE_LIMIT_DOWNLOAD_PER_MINUTE || '20'),
      downloadPerHour: parseInt(process.env.RATE_LIMIT_DOWNLOAD_PER_HOUR || '150'),
      assetPerMinute: parseInt(process.env.RATE_LIMIT_ASSET_PER_MINUTE || '100'),
      assetPerHour: parseInt(process.env.RATE_LIMIT_ASSET_PER_HOUR || '1000'),
      modelPerMinute: parseInt(process.env.RATE_LIMIT_MODEL_PER_MINUTE || '40'),
      modelPerHour: parseInt(process.env.RATE_LIMIT_MODEL_PER_HOUR || '400'),
      postPerMinute: parseInt(process.env.RATE_LIMIT_POST_PER_MINUTE || '10'),
      postPerHour: parseInt(process.env.RATE_LIMIT_POST_PER_HOUR || '50'),
      userPerMinute: parseInt(process.env.RATE_LIMIT_USER_PER_MINUTE || '30'),
      userPerHour: parseInt(process.env.RATE_LIMIT_USER_PER_HOUR || '300'),
      blockDuration: parseInt(process.env.RATE_LIMIT_BLOCK_DURATION || '900'), // 15 minutes
      whitelist: process.env.RATE_LIMIT_WHITELIST?.split(',').map((ip) => ip.trim()) || [],
    },

    // Security configuration
    security: {
      maxRequestSize: parseInt(process.env.SECURITY_MAX_REQUEST_SIZE || String(5 * 1024 * 1024)), // 5MB
      requestTimeout: parseInt(process.env.SECURITY_REQUEST_TIMEOUT || '30000'), // 30 seconds
      trustProxy: process.env.SECURITY_TRUST_PROXY !== 'false', // Default: true
      logViolations: process.env.SECURITY_LOG_VIOLATIONS !== 'false', // Default: true
      logSuspiciousPatterns: process.env.SECURITY_LOG_SUSPICIOUS !== 'false', // Default: true
    },

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

  // Vite configuration to suppress build warnings
  vite: {
    build: {
      // Suppress chunk size warnings (Nuxt UI, icons, and SSR bundles are large)
      chunkSizeWarningLimit: 1000,
      // Disable sourcemaps in production to avoid Tailwind plugin warnings
      sourcemap: false,
    },
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

  // Nitro configuration for build optimization
  nitro: {
    prerender: {
      // Disable route crawling to prevent infinite loops and hanging
      crawlLinks: false,
      // Don't fail build on prerender errors
      failOnError: false,
      // Only prerender explicitly defined routes
      routes: [
        '/',
        '/spec',
        '/ecosystem',
        '/contribute',
        '/docs',
        '/docs/getting-started',
        '/docs/creating-adapters',
        '/docs/creating-protocols',
        '/docs/creating-models',
        '/docs/project-charter',
        '/docs/compliance',
        '/docs/branding',
        '/docs/governance',
      ],
      // Ignore routes that require database
      ignore: [
        '/admin/**',
        '/profile/**',
        '/models/**',
        '/users/**',
        '/adapters/**',
        '/protocols/**',
        '/login',
        '/auth/**',
        '/api/**',
      ],
    },
  },
});
