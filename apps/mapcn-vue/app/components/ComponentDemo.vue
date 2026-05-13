<script setup lang="ts">
  import { useClipboard } from '@vueuse/core';
  import { cn } from '~/lib/utils';

  const props = withDefaults(
    defineProps<{
      class?: string;
      fullWidth?: boolean;
      code?: string;
      title?: string;
      description?: string;
      registry?: string;
    }>(),
    { class: '', fullWidth: false },
  );

  // Strip the common leading whitespace from a template-literal code block.
  // Example pages embed `codeExample` inside `<script setup>` template literals,
  // so the FIRST line typically starts at column 0 (immediately after the
  // opening backtick) while subsequent lines carry the surrounding source
  // file's indentation (often 16+ spaces). Standard min-indent dedent fails
  // because line 0 collapses minIndent to 0. We ignore line 0 when computing
  // the min indent — mirroring the `outdent`/`dedent-js` convention.
  function dedent(src: string | undefined): string {
    if (!src) return '';
    const lines = src.replace(/^\n+|\s+$/g, '').split('\n');
    let minIndent = Infinity;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.trim() === '') continue;
      const match = line.match(/^[ \t]*/);
      if (match) minIndent = Math.min(minIndent, match[0].length);
      if (minIndent === 0) break;
    }
    if (!Number.isFinite(minIndent) || minIndent === 0) return lines.join('\n');
    return lines.map((l, i) => (i === 0 ? l : l.slice(minIndent))).join('\n');
  }

  const dedentedCode = computed(() => dedent(props.code));
  const codeExpanded = ref(false);
  const { copy, copied } = useClipboard({ source: dedentedCode });

  const langRef = computed(() => 'vue');
  const { highlightedHtml } = useShiki(dedentedCode, langRef);
</script>

<template>
  <div class="flex h-dvh flex-col overflow-hidden lg:flex-row">
    <!-- Left panel: docs/code (desktop only — mobile uses MapInfoSheet) -->
    <div
      class="relative order-last hidden flex-1 flex-col lg:order-first lg:flex lg:w-1/3 lg:max-w-[33.333%]"
    >
      <!-- Scrollable content -->
      <div
        class="gradient-fade-both hide-scrollbar flex-1 overflow-y-auto p-4 lg:p-10 lg:pt-20"
      >
        <!-- Breadcrumb -->
        <NuxtLink
          to="/examples"
          class="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground lg:mb-6"
        >
          <Icon name="lucide:arrow-left" class="size-3" />
          Examples
        </NuxtLink>

        <!-- Title -->
        <h1
          v-if="title"
          class="mb-1.5 text-xl font-extrabold leading-tight tracking-tight text-foreground lg:mb-2 lg:text-3xl"
        >
          {{ title }}
        </h1>

        <!-- Description -->
        <p
          v-if="description"
          class="mb-4 text-sm/relaxed text-muted-foreground lg:mb-8"
        >
          {{ description }}
        </p>

        <!-- Code block -->
        <div v-if="code" class="not-prose">
          <button
            class="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            :aria-expanded="codeExpanded"
            aria-controls="code-panel"
            @click="codeExpanded = !codeExpanded"
          >
            <Icon name="lucide:code" class="size-3.5" />
            <span>{{ codeExpanded ? 'Hide code' : 'View code' }}</span>
            <Icon
              name="lucide:chevron-down"
              :class="[
                'size-3 transition-transform duration-200',
                codeExpanded ? 'rotate-180' : '',
              ]"
            />
          </button>

          <div
            v-show="codeExpanded"
            id="code-panel"
            role="region"
            aria-label="Source code"
            class="relative overflow-hidden rounded-xl border border-border/50"
          >
            <button
              class="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
              :class="copied ? 'text-foreground' : ''"
              :aria-label="copied ? 'Copied' : 'Copy code'"
              @click="copy(dedentedCode)"
            >
              <Icon
                :name="copied ? 'lucide:check' : 'lucide:copy'"
                class="size-3.5"
              />
            </button>

            <div
              class="shiki-wrapper max-h-[60vh] overflow-auto text-sm [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!bg-transparent [&_pre]:px-4 [&_pre]:py-4 [&_code]:!text-[13px] [&_code]:!leading-relaxed"
              v-html="highlightedHtml"
            ></div>
          </div>
        </div>

        <!-- Install command -->
        <PackageManagerTabs v-if="registry" :registry="registry" class="mt-8" />
      </div>

      <!-- Sticky footer -->
      <div class="shrink-0 px-6 pb-4 pt-2 lg:px-10">
        <ExampleNavigation />
      </div>
    </div>

    <!-- Right panel: live preview -->
    <div
      role="img"
      :aria-label="
        title ? `Interactive map demo: ${title}` : 'Interactive map demo'
      "
      :class="
        cn(
          'relative order-first flex h-dvh flex-col overflow-hidden bg-muted/30 dark:bg-background lg:order-last lg:h-dvh lg:w-2/3',
          props.class,
        )
      "
    >
      <!-- Map column: fills remaining vertical space above the peek-bar on mobile;
        on desktop fills full height since MapInfoSheet is md:hidden. -->
      <div class="relative min-h-0 flex-1 overflow-hidden">
        <slot></slot>
      </div>

      <!-- Mobile info peek-bar (Apple/Google Maps pattern). Hidden on desktop.
        Lives as a sibling of the map column so it doesn't overlay map controls. -->
      <MapInfoSheet :title="title">
        <NuxtLink
          to="/examples"
          class="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3" />
          Back to Examples
        </NuxtLink>

        <p
          v-if="description"
          class="mb-4 text-sm/relaxed text-muted-foreground"
        >
          {{ description }}
        </p>

        <div v-if="code" class="not-prose mb-4">
          <button
            class="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            :aria-expanded="codeExpanded"
            aria-controls="code-panel-mobile"
            @click="codeExpanded = !codeExpanded"
          >
            <Icon name="lucide:code" class="size-3.5" />
            <span>{{ codeExpanded ? 'Hide code' : 'View code' }}</span>
            <Icon
              name="lucide:chevron-down"
              :class="[
                'size-3 transition-transform duration-200',
                codeExpanded ? 'rotate-180' : '',
              ]"
            />
          </button>
          <div
            v-show="codeExpanded"
            id="code-panel-mobile"
            role="region"
            aria-label="Source code"
            class="relative overflow-hidden rounded-md border border-border"
          >
            <button
              class="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
              :class="copied ? 'text-foreground' : ''"
              :aria-label="copied ? 'Copied' : 'Copy code'"
              @click="copy(dedentedCode)"
            >
              <Icon
                :name="copied ? 'lucide:check' : 'lucide:copy'"
                class="size-3.5"
              />
            </button>
            <div
              class="shiki-wrapper max-h-[40vh] overflow-auto text-sm [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!bg-transparent [&_pre]:px-4 [&_pre]:py-4 [&_code]:!text-[13px] [&_code]:!leading-relaxed"
              v-html="highlightedHtml"
            ></div>
          </div>
        </div>

        <PackageManagerTabs v-if="registry" :registry="registry" />

        <div class="mt-6 border-t border-border pt-4">
          <ExampleNavigation />
        </div>
      </MapInfoSheet>
    </div>
  </div>
</template>
