<script setup lang="ts">
  import type { ClassContext, KoppenClassId } from '~/types/climate';
  import { KOPPEN_CLASSES, formatPct } from '~/composables/use-koppen-classes';

  const props = defineProps<{
    open: boolean;
    countryName: string;
    detailKlass: KoppenClassId | null;
    detailContext: ClassContext | null;
    html: string | null;
  }>();

  const emit = defineEmits<{
    close: [];
    shuffleOne: [klass: KoppenClassId];
  }>();

  function handleClose(): void {
    emit('close');
  }

  function handleShuffle(): void {
    if (props.detailKlass != null) {
      emit('shuffleOne', props.detailKlass);
    }
  }
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="fixed inset-0 z-30 md:hidden"
        @click.self="handleClose"
      >
        <div class="absolute inset-0 bg-black/20" />
        <div
          class="absolute bottom-0 left-0 right-0 max-h-bottom-sheet overflow-y-auto bg-background border-t border-border rounded-t-lg"
        >
          <div class="mx-auto mt-1.5 mb-2.5 h-1 w-9 rounded-full bg-border" />
          <button
            type="button"
            class="absolute top-2 right-2.5 size-7 rounded-md border border-border bg-muted/50 text-foreground cursor-pointer text-sm leading-none flex items-center justify-center hover:bg-muted"
            aria-label="Close"
            @click="handleClose"
          >
            <Icon name="lucide:x" class="size-4" />
          </button>

          <div class="px-4 pb-4">
            <template v-if="detailKlass != null && detailContext">
              <div class="flex items-center gap-2.5 py-1.5">
                <span
                  class="size-7 rounded shrink-0 border border-border/30"
                  :style="{ background: KOPPEN_CLASSES[detailKlass]?.color }"
                />
                <div class="text-sm">
                  <div class="font-mono font-bold tracking-tight">
                    {{ KOPPEN_CLASSES[detailKlass]?.symbol }}
                  </div>
                  <div class="text-muted-foreground text-xs">
                    {{ KOPPEN_CLASSES[detailKlass]?.name }}
                  </div>
                </div>
              </div>
              <div class="text-xs text-muted-foreground mt-2 mb-2">
                <span class="tabular-nums"
                  >{{ formatPct(detailContext.fraction) }}%</span
                >
                of {{ countryName }}
              </div>
              <div
                class="flex items-center gap-2.5 text-sm px-2.5 py-2 bg-muted/50 rounded-md"
              >
                <button
                  type="button"
                  class="flex items-center justify-center size-8 rounded-md border border-border bg-background hover:bg-muted cursor-pointer text-lg leading-none shrink-0"
                  @click="handleShuffle"
                >
                  ↺
                </button>
                <span>
                  Climate of <b>{{ detailContext.exemplar.name }}</b>
                </span>
              </div>
              <div
                v-if="detailContext.runnersUp.length"
                class="text-xs text-muted-foreground mt-2"
              >
                Also:
                {{ detailContext.runnersUp.map((e) => e.name).join(', ') }}
              </div>
            </template>

            <template v-else-if="html">
              <div v-html="html" class="text-xs leading-relaxed" />
            </template>

            <template v-else>
              <div class="text-xs text-muted-foreground text-center py-4">
                No data available.
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .sheet-enter-active,
  .sheet-leave-active {
    transition: opacity 0.2s ease;
  }
  .sheet-enter-from,
  .sheet-leave-to {
    opacity: 0;
  }
  .sheet-enter-active > :last-child,
  .sheet-leave-active > :last-child {
    transition: transform 0.2s ease-out;
  }
  .sheet-enter-from > :last-child {
    transform: translateY(100%);
  }
  .sheet-leave-to > :last-child {
    transform: translateY(100%);
  }
</style>
