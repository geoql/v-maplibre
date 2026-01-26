<script setup lang="ts">
  import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from '~/components/ui/sheet';

  const colorMode = useColorMode();
  const route = useRoute();
  const mobileNavOpen = ref(false);

  function toggleColorMode() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  }

  // Navigation items with icons
  const navItems = [
    { label: 'Introduction', icon: 'lucide:home', to: '/docs/introduction' },
    {
      label: 'Installation',
      icon: 'lucide:download',
      to: '/docs/installation',
    },
    { label: 'Components', icon: 'lucide:component', to: '/docs/components' },
    { label: 'Examples', icon: 'lucide:play', to: '/examples' },
  ];

  // Close mobile nav when route changes
  watch(
    () => route.path,
    () => {
      mobileNavOpen.value = false;
    },
  );
</script>

<template>
  <div
    class="flex min-h-dvh flex-col overflow-x-clip bg-background font-sans antialiased"
  >
    <header
      class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60"
    >
      <div class="container flex h-14 max-w-screen-2xl items-center">
        <div class="mr-4 flex">
          <NuxtLink to="/" class="mr-6 flex items-center space-x-2">
            <Icon name="lucide:map" class="size-6" />
            <span class="font-bold">mapcn-vue</span>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden items-center gap-6 text-sm md:flex">
          <NuxtLink
            to="/docs/introduction"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </NuxtLink>
          <NuxtLink
            to="/docs/installation"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            Installation
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
            class="inline-flex size-9 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="simple-icons:github" class="size-5" />
            <span class="sr-only">GitHub</span>
          </a>
          <button
            class="inline-flex size-9 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            @click="toggleColorMode"
          >
            <Icon
              :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'"
              class="size-5"
            />
            <span class="sr-only">Toggle theme</span>
          </button>

          <!-- Mobile Navigation -->
          <Sheet v-model:open="mobileNavOpen">
            <SheetTrigger as-child>
              <button
                class="inline-flex size-9 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground md:hidden"
                aria-label="Open navigation menu"
              >
                <Icon name="lucide:menu" class="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" class="w-70 p-0">
              <SheetHeader class="border-b border-border px-6 py-4">
                <SheetTitle class="flex items-center gap-2 text-left">
                  <Icon name="lucide:map" class="size-5" />
                  <span>mapcn-vue</span>
                </SheetTitle>
              </SheetHeader>
              <nav class="flex flex-col py-4">
                <NuxtLink
                  v-for="item in navItems"
                  :key="item.to"
                  :to="item.to"
                  class="group relative flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors hover:bg-accent/50"
                  :class="[
                    route.path === item.to ||
                    route.path.startsWith(item.to + '/')
                      ? 'bg-accent/30 text-foreground'
                      : `
                        text-muted-foreground
                        hover:text-foreground
                      `,
                  ]"
                >
                  <!-- Active indicator -->
                  <span
                    v-if="
                      route.path === item.to ||
                      route.path.startsWith(item.to + '/')
                    "
                    class="absolute top-1/2 left-0 h-6 w-0.75 -translate-y-1/2 rounded-r-full bg-primary"
                  ></span>
                  <Icon :name="item.icon" class="size-4 shrink-0" />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </nav>
              <div class="mt-auto border-t border-border px-6 py-4">
                <div class="flex items-center gap-2">
                  <a
                    href="https://github.com/geoql/v-maplibre"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex size-9 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon name="simple-icons:github" class="size-5" />
                    <span class="sr-only">GitHub</span>
                  </a>
                  <button
                    class="inline-flex size-9 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    @click="toggleColorMode"
                  >
                    <Icon
                      :name="
                        colorMode.value === 'dark'
                          ? 'lucide:sun'
                          : 'lucide:moon'
                      "
                      class="size-5"
                    />
                    <span class="sr-only">Toggle theme</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot></slot>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border py-6">
      <div
        class="container flex flex-col items-center justify-between gap-4 md:flex-row"
      >
        <p class="text-sm text-muted-foreground">
          Copyright &copy; {{ new Date().getFullYear() }}
        </p>
        <div class="flex items-center gap-3">
          <a
            href="https://x.com/_vinayak_k"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon name="simple-icons:x" class="size-5" />
          </a>
          <a
            href="https://github.com/geoql/v-maplibre"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon name="simple-icons:github" class="size-5" />
          </a>
          <button
            class="text-muted-foreground transition-colors hover:text-foreground"
            @click="toggleColorMode"
          >
            <Icon
              :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'"
              class="size-5"
            />
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>
