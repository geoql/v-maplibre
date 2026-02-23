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

  const codeExpanded = ref(false);
  const { copy, copied } = useClipboard({ source: () => props.code ?? '' });

  const codeRef = computed(() => props.code);
  const langRef = computed(() => 'vue');
  const { highlightedHtml } = useShiki(codeRef, langRef);
</script>

<template>
  <div class="flex min-h-dvh flex-col lg:h-dvh lg:flex-row lg:overflow-hidden">
    <!-- Left panel: docs/code -->
    <div
      class="relative order-last flex flex-1 flex-col lg:order-first lg:w-1/3 lg:max-w-[33.333%]"
    >
      <!-- Scrollable content -->
      <div
        class="gradient-fade-both hide-scrollbar flex-1 overflow-y-auto p-6 lg:p-10 lg:pt-20"
      >
        <!-- Breadcrumb -->
        <NuxtLink
          to="/examples"
          class="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3" />
          Examples
        </NuxtLink>

        <!-- Title -->
        <h1
          v-if="title"
          class="gradient-text mb-2 font-display text-2xl font-bold leading-normal tracking-tighter lg:text-3xl"
        >
          {{ title }}
        </h1>

        <!-- Description -->
        <p
          v-if="description"
          class="mb-8 text-sm/relaxed text-muted-foreground"
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
              @click="copy(code!)"
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
          'relative order-first min-h-[50dvh] overflow-hidden bg-muted/30 dark:bg-background lg:order-last lg:h-dvh lg:w-2/3',
          props.class,
        )
      "
    >
      <slot></slot>
    </div>
  </div>
</template>
