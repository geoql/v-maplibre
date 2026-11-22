<script setup lang="ts">
  /**
   * ⌘K / Ctrl+K search over docs sections. The page passes the sections in
   * (loaded on first open) and handles `select` (the section id is a path
   * with an optional #hash). Open/close scales and fades in 150 ms; the
   * reduced-motion rule turns that off.
   */
  import {
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
  } from 'reka-ui';
  import { rankSections, type SearchSection } from '#shell/utils/rank-sections';

  const props = defineProps<{ sections: SearchSection[] }>();
  const open = defineModel<boolean>('open', { default: false });
  const emit = defineEmits<{ select: [id: string] }>();

  const query = ref('');
  const highlighted = ref(0);
  const results = computed(() => rankSections(props.sections, query.value));

  watch(query, () => (highlighted.value = 0));
  watch(open, (isOpen) => {
    if (!isOpen) query.value = '';
  });

  function choose(section: SearchSection | undefined): void {
    if (!section) return;
    open.value = false;
    emit('select', section.id);
  }

  function onKeydown(event: KeyboardEvent): void {
    const count = results.value.length;
    if (event.key === 'ArrowDown' && count > 0) {
      event.preventDefault();
      highlighted.value = (highlighted.value + 1) % count;
    } else if (event.key === 'ArrowUp' && count > 0) {
      event.preventDefault();
      highlighted.value = (highlighted.value - 1 + count) % count;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(results.value[highlighted.value]);
    }
  }

  function onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      open.value = !open.value;
    }
  }

  onMounted(() => window.addEventListener('keydown', onGlobalKeydown));
  onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKeydown));
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed top-24 left-1/2 z-50 w-full max-w-viewport-padded -translate-x-1/2 sm:max-w-2xl overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        @keydown="onKeydown"
      >
        <DialogTitle class="sr-only">Search the docs</DialogTitle>
        <DialogDescription class="sr-only">
          Type to search; use the arrow keys and Enter to open a result.
        </DialogDescription>
        <div class="flex items-center gap-3 border-b border-border px-4">
          <Icon name="lucide:search" class="size-4 text-muted-foreground" />
          <input
            v-model="query"
            data-search-input
            type="search"
            placeholder="Search the docs"
            aria-label="Search the docs"
            class="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd
            class="rounded-sm border border-border px-1.5 py-0.5 font-mono text-2xs text-muted-foreground"
            >Esc</kbd
          >
        </div>
        <ul
          v-if="results.length > 0"
          role="listbox"
          class="max-h-96 overflow-y-auto p-2"
        >
          <li
            v-for="(section, index) in results"
            :key="section.id"
            role="option"
            :aria-selected="index === highlighted"
          >
            <button
              type="button"
              class="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors"
              :class="index === highlighted ? 'bg-muted' : 'hover:bg-muted/50'"
              @mouseenter="highlighted = index"
              @click="choose(section)"
            >
              <span
                v-if="section.titles.length > 0"
                class="font-mono text-2xs tracking-caps-xs text-muted-foreground uppercase"
                >{{ section.titles.join(' › ') }}</span
              >
              <span class="text-sm font-medium text-foreground">{{
                section.title
              }}</span>
            </button>
          </li>
        </ul>
        <p
          v-else
          class="px-4 py-8 text-center font-mono text-caption tracking-caps text-muted-foreground uppercase"
        >
          {{ query ? 'No results' : 'Type to search' }}
        </p>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
