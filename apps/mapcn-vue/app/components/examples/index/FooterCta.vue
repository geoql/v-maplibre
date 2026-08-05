<script setup lang="ts"></script>

<template>
  <div class="mt-20 border-t border-border pt-16">
    <div class="grid grid-cols-1 items-end gap-8 md:grid-cols-split-5-7">
      <div>
        <div
          class="mb-4 inline-flex items-center gap-2 font-mono text-caption tracking-caps text-primary uppercase"
        >
          <Icon name="lucide:code-2" class="size-3" />
          Ready to build
        </div>
        <h3
          class="text-2xl font-extrabold tracking-snug text-foreground md:text-3xl"
        >
          One command.<br />Zero config.
        </h3>
        <p class="mt-4 text-base text-muted-foreground">
          Add any component to your project via shadcn-vue CLI. Components land
          in your repo, typed end-to-end, owned by you.
        </p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/docs/introduction"
            class="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-filter hover:brightness-110"
          >
            Get started
            <Icon name="lucide:arrow-right" class="size-4" />
          </NuxtLink>
          <a
            href="https://github.com/geoql/v-maplibre"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-10 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Icon name="lucide:github" class="size-4" />
            View source
          </a>
        </div>
      </div>

      <div
        class="overflow-hidden rounded-md border border-border bg-card text-left"
      >
        <div
          class="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5"
        >
          <div
            class="size-2.5 rounded-full bg-destructive/70"
            aria-hidden="true"
          ></div>
          <div
            class="size-2.5 rounded-full bg-warning/70"
            aria-hidden="true"
          ></div>
          <div
            class="size-2.5 rounded-full bg-success/70"
            aria-hidden="true"
          ></div>
          <span
            class="ml-2 font-mono text-2xs tracking-caps-sm text-muted-foreground uppercase"
            >Terminal</span
          >
        </div>
        <div class="overflow-x-auto p-5">
          <code class="font-mono text-sm whitespace-nowrap text-foreground">
            <span class="text-primary">$</span> npx shadcn-vue@latest add
            https://mapcn-vue.geoql.in/r/map
          </code>
        </div>
      </div>
    </div>
  </div>
</template>
