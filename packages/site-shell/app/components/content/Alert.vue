<script setup lang="ts">
  /** `::alert{type="warning"}` in Markdown. */
  import { computed } from 'vue';
  const props = withDefaults(
    defineProps<{ type?: 'info' | 'success' | 'warning' | 'danger' }>(),
    { type: 'info' },
  );

  const STYLES = {
    info: {
      tone: 'text-primary',
      frame: 'border-primary/40 bg-primary/5',
      icon: 'lucide:info',
    },
    success: {
      tone: 'text-success',
      frame: 'border-success/40 bg-success/5',
      icon: 'lucide:circle-check',
    },
    warning: {
      tone: 'text-warning',
      frame: 'border-warning/40 bg-warning/5',
      icon: 'lucide:triangle-alert',
    },
    danger: {
      tone: 'text-destructive',
      frame: 'border-destructive/40 bg-destructive/5',
      icon: 'lucide:octagon-alert',
    },
  } as const;

  const style = computed(() => STYLES[props.type]);
</script>

<template>
  <div
    role="note"
    class="not-prose my-6 flex gap-3 rounded-md border-l-2 px-4 py-3 text-sm/relaxed text-foreground"
    :class="style.frame"
  >
    <Icon
      :name="style.icon"
      class="mt-0.5 size-4 shrink-0"
      :class="style.tone"
    />
    <div class="min-w-0 [&_a]:underline [&_code]:font-mono [&_p]:m-0">
      <slot></slot>
    </div>
  </div>
</template>
