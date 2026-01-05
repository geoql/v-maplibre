<script setup lang="ts">
  const colorMode = useColorMode();

  function toggleColorMode() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  }
</script>

<template>
  <div class="min-h-dvh bg-background font-sans antialiased">
    <!-- Header -->
    <header
      class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <div class="container flex h-14 max-w-screen-2xl items-center">
        <div class="mr-4 flex">
          <NuxtLink to="/" class="mr-6 flex items-center space-x-2">
            <Icon name="lucide:map" class="h-6 w-6"></Icon>
            <span class="font-bold">mapcn-vue</span>
          </NuxtLink>
        </div>

        <nav class="flex items-center gap-6 text-sm">
          <NuxtLink
            to="/docs/introduction"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </NuxtLink>
          <NuxtLink
            to="/docs/components"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            Components
          </NuxtLink>
          <NuxtLink
            to="/examples"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            Examples
          </NuxtLink>
        </nav>

        <div class="flex flex-1 items-center justify-end space-x-2">
          <a
            href="https://github.com/geoql/v-maplibre"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="simple-icons:github" class="h-5 w-5"></Icon>
            <span class="sr-only">GitHub</span>
          </a>
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 hover:bg-accent hover:text-accent-foreground"
            @click="toggleColorMode"
          >
            <Icon
              :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'"
              class="h-5 w-5"
            ></Icon>
            <span class="sr-only">Toggle theme</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <slot></slot>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border py-6 md:py-0">
      <div
        class="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row"
      >
        <p class="text-sm text-muted-foreground">
          Built with
          <a
            href="https://github.com/geoql/v-maplibre"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium underline underline-offset-4"
          >
            @geoql/v-maplibre
          </a>
          . The source code is available on
          <a
            href="https://github.com/geoql/v-maplibre"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  </div>
</template>
