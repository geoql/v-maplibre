<script setup lang="ts">
  import { useClipboard } from '@vueuse/core';
  import type { ExampleDocsSectionsProps } from '~/types/examples';
  import { slugAfter } from '~/utils/analytics-funnel';

  const props = withDefaults(defineProps<ExampleDocsSectionsProps>(), {
    size: 'lg',
  });

  const components = useExampleComponents(() => props.code);
  const { copy, copied } = useClipboard();
  const route = useRoute();
  const { track } = useAnalytics();

  function copyCode() {
    copy(props.code);
    track('example_code_copied', {
      slug: slugAfter(route.path, '/examples/') ?? route.path,
    });
  }

  // The v-maplibre API reference lives on the docs site.
  const DOCS_URL = 'https://v-maplibre.geoql.in';
</script>

<template>
  <div class="not-prose">
    <!-- Usage is what people open first, so it starts expanded. Native
      <details> keeps every section in the server-rendered HTML. -->
    <details open class="group border-t border-border">
      <summary
        class="-mx-2 flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-2 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <h2 class="text-sm font-bold tracking-tight text-foreground">Usage</h2>
        <Icon
          name="lucide:chevron-down"
          class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>

      <div
        role="region"
        aria-label="Example source code"
        class="relative mb-4 overflow-hidden rounded-lg border border-border"
      >
        <button
          type="button"
          class="absolute top-2 right-2 z-10 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          :aria-label="copied ? 'Copied' : 'Copy code'"
          @click="copyCode"
        >
          <Icon
            :name="copied ? 'lucide:check' : 'lucide:copy'"
            class="size-3.5"
          />
        </button>
        <div
          v-if="highlightedHtml"
          :class="[
            'shiki-wrapper shiki-flush overflow-auto text-sm',
            size === 'lg' ? 'max-h-code-lg' : 'max-h-code-sm',
          ]"
          v-html="highlightedHtml"
        ></div>
        <!-- Plain source until Shiki loads, and on the server for crawlers. -->
        <pre
          v-else
          :class="[
            'overflow-auto p-4 font-mono text-xs/relaxed text-foreground',
            size === 'lg' ? 'max-h-code-lg' : 'max-h-code-sm',
          ]"
        ><code>{{ code }}</code></pre>
      </div>
    </details>

    <details v-if="components.length" class="group border-t border-border">
      <summary
        class="-mx-2 flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-2 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <h2 class="text-sm font-bold tracking-tight text-foreground">
          Components
          <span
            class="ml-1 font-mono text-2xs font-medium tabular-nums text-muted-foreground"
          >
            {{ components.length }}
          </span>
        </h2>
        <Icon
          name="lucide:chevron-down"
          class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>

      <ul class="mb-4 divide-y divide-border rounded-lg border border-border">
        <li
          v-for="component in components"
          :key="component.name"
          class="flex items-baseline justify-between gap-3 px-3 py-2"
        >
          <code class="font-mono text-xs text-foreground">
            &lt;{{ component.name }} /&gt;
          </code>
          <span class="truncate font-mono text-2xs text-muted-foreground">
            {{ component.from }}
          </span>
        </li>
      </ul>
      <a
        :href="DOCS_URL"
        target="_blank"
        rel="noopener"
        class="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Props and events in the API reference
        <Icon name="lucide:arrow-up-right" class="size-3" />
      </a>
    </details>
  </div>
</template>

<style scoped>
  /* `list-none` hides the disclosure triangle everywhere except Safari, which
     draws it through this pseudo-element instead of `display: list-item`. */
  summary::-webkit-details-marker {
    display: none;
  }
</style>
