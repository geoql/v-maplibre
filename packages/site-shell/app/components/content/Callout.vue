<script setup lang="ts">
  /** `::callout{icon="i-lucide-book" to="/guide" target="_blank"}` in Markdown. */
  import { computed } from 'vue';
  import { iconifyName } from '#shell/utils/iconify-name';

  const props = withDefaults(
    defineProps<{ icon?: string; to?: string; target?: string }>(),
    { icon: 'lucide:info', to: undefined, target: undefined },
  );

  const iconName = computed(() => iconifyName(props.icon));
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :target="target"
    class="not-prose group my-6 flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground no-underline transition-colors hover:border-primary/50 hover:bg-muted/40"
  >
    <Icon :name="iconName" class="size-4 shrink-0 text-primary" />
    <span class="min-w-0 flex-1 [&_p]:m-0"><slot></slot></span>
    <Icon
      name="lucide:arrow-right"
      class="size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground"
    />
  </NuxtLink>
  <div
    v-else
    class="not-prose my-6 flex gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm/relaxed text-foreground"
  >
    <Icon :name="iconName" class="mt-0.5 size-4 shrink-0 text-primary" />
    <div class="min-w-0 [&_p]:m-0"><slot></slot></div>
  </div>
</template>
