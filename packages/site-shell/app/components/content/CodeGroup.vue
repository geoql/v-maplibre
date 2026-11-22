<script setup lang="ts">
  /**
   * `::code-group` in Markdown: one tab per code block, labelled with the
   * block's `[label]` (its filename) or language. The active tab's
   * underline slides between tabs (off under reduced motion).
   */
  import { motion } from 'motion-v';
  import { computed, provide, ref, useId, useSlots, type VNode } from 'vue';
  import { IN_CODE_GROUP } from '#shell/utils/code-group';

  provide(IN_CODE_GROUP, true);

  const slots = useSlots();
  const selected = ref(0);
  const groupId = useId();

  const blocks = computed<VNode[]>(() =>
    (slots.default?.() ?? []).filter((node) => typeof node.type !== 'symbol'),
  );

  const label = (node: VNode, index: number): string => {
    const props = (node.props ?? {}) as {
      filename?: string;
      language?: string;
    };
    return props.filename ?? props.language ?? `Tab ${index + 1}`;
  };
</script>

<template>
  <div class="not-prose my-6 overflow-hidden rounded-md border border-border">
    <div
      role="tablist"
      class="flex gap-1 border-b border-border bg-muted/40 px-2"
    >
      <button
        v-for="(node, index) in blocks"
        :key="index"
        role="tab"
        type="button"
        :aria-selected="selected === index ? 'true' : 'false'"
        class="relative px-3 py-2 font-mono text-caption tracking-caps uppercase transition-colors"
        :class="
          selected === index
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="selected = index"
      >
        {{ label(node, index) }}
        <motion.span
          v-if="selected === index"
          :layout-id="`code-group-${groupId}`"
          class="absolute inset-x-2 -bottom-px h-px bg-primary"
          :transition="{ duration: 0.18, ease: [0.2, 0, 0, 1] }"
        ></motion.span>
      </button>
    </div>
    <div role="tabpanel" class="[&_pre]:!my-0 [&>div]:!my-0">
      <component :is="blocks[selected]" />
    </div>
  </div>
</template>
