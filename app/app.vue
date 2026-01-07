<script setup lang="ts">
// Add structured data for organization
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "OpenECU Alliance",
        url: "https://openecualliance.org",
        logo: "https://openecualliance.org/android-chrome-512x512.png",
        description:
          "The OpenECU Alliance publishes the OpenECU Spec - an open specification for standardizing ECU log data formats.",
        sameAs: ["https://github.com/ClassicMiniDIY/OpenECUAlliance"],
        foundingDate: "2024",
        keywords: [
          "ECU",
          "engine control unit",
          "data logging",
          "automotive",
          "open source",
          "specification",
        ],
      }),
    },
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "OpenECU Alliance",
        url: "https://openecualliance.org",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://openecualliance.org/?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
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
[role="button"]:focus-visible,
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
button:not([role="switch"]),
a,
[role="button"]:not([role="switch"]),
input[type="checkbox"],
input[type="radio"] {
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
