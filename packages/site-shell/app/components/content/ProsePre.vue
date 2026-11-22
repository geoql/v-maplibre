<script setup lang="ts">
  /**
   * Code blocks from Markdown, with a copy button. Inside `::code-group`
   * the group's tabs carry the file name, so the block hides its own.
   */
  import { inject, onBeforeUnmount, ref } from 'vue';
  import { IN_CODE_GROUP } from '#shell/utils/code-group';

  const props = withDefaults(
    defineProps<{
      code?: string;
      language?: string | null;
      filename?: string | null;
      highlights?: number[];
      meta?: string | null;
      class?: string | null;
    }>(),
    {
      code: '',
      language: null,
      filename: null,
      highlights: () => [],
      meta: null,
      class: null,
    },
  );

  const inGroup = inject(IN_CODE_GROUP, false);
  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(): Promise<void> {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied.value = false), 1500);
  }

  onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="group/code relative my-6">
    <div
      v-if="filename && !inGroup"
      class="rounded-t-md border border-b-0 border-border bg-muted/40 px-4 py-2 font-mono text-caption tracking-caps text-muted-foreground uppercase"
    >
      {{ filename }}
    </div>
    <pre
      :class="[
        props.class,
        filename && !inGroup ? '!mt-0 !rounded-t-none' : '',
      ]"
    ><slot></slot></pre>
    <button
      data-copy
      type="button"
      :aria-label="copied ? 'Copied' : 'Copy code'"
      class="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-[opacity,color] duration-150 group-hover/code:opacity-100 hover:text-foreground focus-visible:opacity-100"
      :class="[
        copied ? 'text-success opacity-100' : '',
        filename && !inGroup ? 'top-11' : '',
      ]"
      @click="copy"
    >
      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <Icon v-if="copied" key="done" name="lucide:check" class="size-3.5" />
        <Icon v-else key="copy" name="lucide:copy" class="size-3.5" />
      </Transition>
    </button>
  </div>
</template>
