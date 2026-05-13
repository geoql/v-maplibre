<script setup lang="ts">
  /**
   * MapInfoSheet — mobile-only docs sheet for ComponentDemo pages.
   *
   * Pattern: Apple Maps / Google Maps peek-bar.
   *  - Hidden on desktop (`md:hidden`); the side rail keeps its job.
   *  - On mobile, shows a slim title-bar pinned at the bottom of the map
   *    container. Tap → opens a shadcn-vue Sheet with the rest of the info
   *    (description, code block, install command, prev/next nav).
   *  - Sheet uses `side="bottom"` so the map stays visible above it.
   */
  import { SidebarTrigger } from '~/components/ui/sidebar';
  import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from '~/components/ui/sheet';

  interface Props {
    title?: string;
  }

  defineProps<Props>();
</script>

<template>
  <div
    class="z-20 flex h-12 shrink-0 items-stretch border-t border-border bg-background shadow-sm md:hidden"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }"
  >
    <SidebarTrigger
      class="m-1.5 flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-muted"
      aria-label="Open navigation"
    />
    <Sheet>
      <SheetTrigger
        class="flex flex-1 items-center justify-between gap-3 px-3 text-left transition-colors hover:bg-muted"
        aria-label="Open example details"
      >
        <span
          class="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          Details
        </span>
        <span
          class="flex flex-1 items-center justify-end gap-2 overflow-hidden"
        >
          <span class="truncate text-sm font-medium text-foreground">{{
            title
          }}</span>
          <Icon name="lucide:chevron-up" class="size-4 text-muted-foreground" />
        </span>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        class="max-h-[85dvh] overflow-y-auto rounded-t-md border-t border-border bg-background p-0 md:hidden"
      >
        <SheetHeader class="border-b border-border px-4 py-3 text-left">
          <SheetTitle class="text-xl font-extrabold tracking-tight">{{
            title
          }}</SheetTitle>
          <SheetDescription class="sr-only"
            >Example details and source code</SheetDescription
          >
        </SheetHeader>
        <div class="px-4 pb-6 pt-4">
          <slot></slot>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
