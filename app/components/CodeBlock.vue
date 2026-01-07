<script setup lang="ts">
  import { codeToHtml } from 'shiki';

  const props = defineProps<{
    code: string;
    lang?: string;
  }>();

  const language = computed(() => props.lang || 'yaml');

  // Use useAsyncData for SSR-compatible highlighting with dark high-contrast theme
  const { data } = await useAsyncData(
    `code-${props.code.slice(0, 50)}`,
    async () => {
      return await codeToHtml(props.code.trim(), {
        lang: language.value,
        theme: 'github-dark-high-contrast',
      });
    },
    { watch: [() => props.code, language] }
  );

  const highlightedCode = computed(() => data.value || '');
</script>

<template>
  <div class="code-block relative rounded-lg overflow-hidden">
    <!-- Language badge -->
    <div v-if="lang" class="lang-badge absolute top-2 right-2 text-xs uppercase font-mono px-2 py-0.5 rounded z-10">
      {{ lang }}
    </div>
    <!-- Highlighted code -->
    <div v-if="highlightedCode" class="shiki-wrapper" v-html="highlightedCode" />
    <!-- Fallback for SSR hydration -->
    <pre v-else class="text-sm p-4 overflow-x-auto bg-[#0a0c10] text-[#f0f3f6]"><code>{{ code }}</code></pre>
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

  .code-block .shiki code {
    display: block;
  }

  .code-block {
    border-radius: 0.5rem;
    background-color: #0a0c10;
  }

  .code-block .lang-badge {
    color: #f0f3f6;
    background-color: #272b33;
    font-weight: 500;
  }
</style>
