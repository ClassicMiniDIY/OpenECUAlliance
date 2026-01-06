<script setup lang="ts">
import { codeToHtml } from "shiki";

const props = defineProps<{
  code: string;
  lang?: string;
}>();

const colorMode = useColorMode();
const language = computed(() => props.lang || "yaml");

// Select theme based on current color mode for WCAG AAA compliance
const currentTheme = computed(() =>
  colorMode.value === "dark"
    ? "github-dark-high-contrast"
    : "github-light-high-contrast",
);

// Use useAsyncData for SSR-compatible highlighting
const { data } = await useAsyncData(
  `code-${props.code.slice(0, 50)}-${currentTheme.value}`,
  async () => {
    return await codeToHtml(props.code.trim(), {
      lang: language.value,
      theme: currentTheme.value,
    });
  },
  { watch: [() => props.code, language, currentTheme] },
);

const highlightedCode = computed(() => data.value || "");
</script>

<template>
  <div class="code-block relative rounded-lg overflow-hidden">
    <!-- Language badge -->
    <div
      v-if="lang"
      class="lang-badge absolute top-2 right-2 text-xs uppercase font-mono px-2 py-0.5 rounded z-10"
    >
      {{ lang }}
    </div>
    <!-- Highlighted code -->
    <div
      v-if="highlightedCode"
      class="shiki-wrapper"
      v-html="highlightedCode"
    />
    <!-- Fallback for SSR hydration -->
    <pre
      v-else
      class="text-sm p-4 overflow-x-auto"
    ><code>{{ code }}</code></pre>
  </div>
</template>

<style>
.code-block .shiki {
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.6;
  border-radius: 0.5rem;
}

/* Let Shiki handle colors - just ensure proper padding */
.code-block .shiki code {
  display: block;
}

/* Base code block styling */
.code-block {
  border-radius: 0.5rem;
}

/* Dark mode styling */
html.dark .code-block {
  background-color: #0a0c10;
}

/* Light mode styling */
html:not(.dark) .code-block {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
}

/* Language badge - high contrast */
.code-block .lang-badge {
  color: #1f2328;
  background-color: #eaeef2;
  font-weight: 500;
}

html.dark .code-block .lang-badge {
  color: #f0f3f6;
  background-color: #272b33;
}
</style>
