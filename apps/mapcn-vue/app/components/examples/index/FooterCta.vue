<script setup lang="ts"></script>

<template>
  <div class="mt-20 border-t border-border/40 pt-16 text-center">
    <div class="mx-auto max-w-md space-y-4">
      <div
        class="mx-auto flex size-12 items-center justify-center rounded-xl border border-border/50 bg-muted/30"
      >
        <Icon name="lucide:code-2" class="size-6 text-primary" />
      </div>

      <h3
        class="gradient-text font-display text-2xl font-bold tracking-tighter"
      >
        Ready to build?
      </h3>
      <p class="text-sm text-muted-foreground">
        Add any component to your project with a single CLI command. Start
        building beautiful maps in minutes.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <NuxtLink
          to="/docs/introduction"
          class="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
        >
          Get Started
          <Icon name="lucide:arrow-right" class="size-4" />
        </NuxtLink>
        <a
          href="https://github.com/geoql/v-maplibre"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-10 items-center gap-2 rounded-lg border border-border/50 px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Icon name="lucide:github" class="size-4" />
          View Source
        </a>
      </div>

      <div
        class="mx-auto mt-4 w-fit rounded-lg border border-border/50 bg-muted/30 px-4 py-2 font-mono text-xs text-muted-foreground"
      >
        <span class="text-primary">npx</span> shadcn-vue add
        <span class="text-emerald-500">https://mapcn-vue.geoql.in/r/map</span>
      </div>
    </div>
  </div>
</template>
