<script setup lang="ts">
  // Per-page canonical + og:url/twitter:url, derived from the primary domain
  // (site.url) and the current route path. Replaces the old hardcoded
  // homepage canonical that leaked onto every page.
  const route = useRoute();
  const siteConfig = useSiteConfig();
  // Strip trailing slashes (except the root) so slash-variant requests
  // canonicalize to the no-slash URLs the sitemap declares.
  const canonicalUrl = computed(() => {
    const path = route.path.length > 1 ? route.path.replace(/\/+$/, '') : route.path;
    return new URL(path, siteConfig.url).href;
  });

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
    meta: [
      { property: 'og:url', content: canonicalUrl },
      { name: 'twitter:url', content: canonicalUrl },
    ],
  });

  // Add structured data for organization
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'OpenECU Alliance',
          url: 'https://oecua.org',
          logo: 'https://oecua.org/android-chrome-192x192.png',
          description:
            'The OpenECU Alliance publishes the OpenECU Spec - an open specification for standardizing ECU log data formats.',
          sameAs: ['https://github.com/ClassicMiniDIY/OpenECUAlliance'],
          foundingDate: '2024',
          keywords: ['ECU', 'engine control unit', 'data logging', 'automotive', 'open source', 'specification'],
        }),
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'OpenECU Alliance',
          url: 'https://oecua.org',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://oecua.org/?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        }),
      },
    ],
  });
</script>

<template>
  <UApp>
    <!-- Skip Link for Keyboard Navigation (WCAG AAA) -->
    <a
      href="#main-content"
      class="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      Skip to main content
    </a>

    <NuxtRouteAnnouncer />
    <AppHeader />
    <UMain id="main-content" role="main" tabindex="-1">
      <NuxtPage />
    </UMain>
    <AppFooter />
  </UApp>
</template>

<style>
  /* Enhanced Focus Styles for WCAG AAA Compliance */
  :focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* High contrast focus for buttons and interactive elements */
  button:focus-visible,
  a:focus-visible,
  [role='button']:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(0, 255, 255, 0.25);
  }

  /* Remove default focus outline when using focus-visible */
  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Skip link styles */
  .skip-link {
    transition: transform 0.2s ease-in-out;
  }

  .skip-link:focus {
    transform: translateY(0);
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    :root {
      --color-primary: #00ffff;
    }

    a,
    button {
      text-decoration: underline;
    }
  }

  /* Ensure minimum touch target size (WCAG AAA - 44x44px) */
  button:not([role='switch']),
  a,
  [role='button']:not([role='switch']),
  input[type='checkbox'],
  input[type='radio'] {
    min-height: 44px;
    min-width: 44px;
  }

  /* Exception for inline links */
  p a,
  li a,
  span a {
    min-height: auto;
    min-width: auto;
  }
</style>
