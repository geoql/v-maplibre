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
  <div class="flex flex-col font-sans antialiased min-h-dvh bg-background">
    <header
      class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <div class="container flex items-center h-14 max-w-screen-2xl">
        <div class="flex mr-4">
          <NuxtLink to="/" class="flex items-center mr-6 space-x-2">
            <Icon name="lucide:map" class="w-6 h-6"></Icon>
            <span class="font-bold">mapcn-vue</span>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="items-center hidden gap-6 text-sm md:flex">
          <NuxtLink
            to="/docs/introduction"
            class="transition-colors text-muted-foreground hover:text-foreground"
          >
            Docs
          </NuxtLink>
          <NuxtLink
            to="/docs/installation"
            class="transition-colors text-muted-foreground hover:text-foreground"
          >
            Installation
          </NuxtLink>
          <NuxtLink
            to="/docs/components"
            class="transition-colors text-muted-foreground hover:text-foreground"
          >
            Components
          </NuxtLink>
          <NuxtLink
            to="/examples"
            class="transition-colors text-muted-foreground hover:text-foreground"
          >
            Examples
          </NuxtLink>
        </nav>

        <div class="flex items-center justify-end flex-1 space-x-2">
          <a
            href="https://github.com/geoql/v-maplibre"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center text-sm font-medium rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="simple-icons:github" class="w-5 h-5"></Icon>
            <span class="sr-only">GitHub</span>
          </a>
          <button
            class="inline-flex items-center justify-center text-sm font-medium rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground"
            @click="toggleColorMode"
          >
            <Icon
              :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'"
              class="w-5 h-5"
            ></Icon>
            <span class="sr-only">Toggle theme</span>
          </button>

          <!-- Mobile Navigation -->
          <Sheet v-model:open="mobileNavOpen">
            <SheetTrigger as-child>
              <button
                class="inline-flex items-center justify-center text-sm font-medium rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground md:hidden"
                aria-label="Open navigation menu"
              >
                <Icon name="lucide:menu" class="w-5 h-5"></Icon>
              </button>
            </SheetTrigger>
            <SheetContent side="right" class="w-[280px] p-0">
              <SheetHeader class="px-6 py-4 border-b border-border">
                <SheetTitle class="flex items-center gap-2 text-left">
                  <Icon name="lucide:map" class="w-5 h-5"></Icon>
                  <span>mapcn-vue</span>
                </SheetTitle>
              </SheetHeader>
              <nav class="flex flex-col py-4">
                <NuxtLink
                  v-for="item in navItems"
                  :key="item.to"
                  :to="item.to"
                  class="relative flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors group hover:bg-accent/50"
                  :class="[
                    route.path === item.to ||
                    route.path.startsWith(item.to + '/')
                      ? 'text-foreground bg-accent/30'
                      : 'text-muted-foreground hover:text-foreground',
                  ]"
                >
                  <!-- Active indicator -->
                  <span
                    v-if="
                      route.path === item.to ||
                      route.path.startsWith(item.to + '/')
                    "
                    class="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                  ></span>
                  <Icon :name="item.icon" class="w-4 h-4 shrink-0"></Icon>
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </nav>
              <div class="px-6 py-4 mt-auto border-t border-border">
                <div class="flex items-center gap-2">
                  <a
                    href="https://github.com/geoql/v-maplibre"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center justify-center text-sm font-medium rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon name="simple-icons:github" class="w-5 h-5"></Icon>
                    <span class="sr-only">GitHub</span>
                  </a>
                  <button
                    class="inline-flex items-center justify-center text-sm font-medium rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                    @click="toggleColorMode"
                  >
                    <Icon
                      :name="
                        colorMode.value === 'dark'
                          ? 'lucide:sun'
                          : 'lucide:moon'
                      "
                      class="w-5 h-5"
                    ></Icon>
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
    <footer class="py-6 border-t border-border">
      <div
        class="container flex flex-col items-center justify-between gap-4 md:flex-row"
      >
        <p class="text-sm text-muted-foreground">
          Copyright &copy; {{ new Date().getFullYear() }}
        </p>
        <div class="flex items-center gap-3">
          <a
            href="https://twitter.com/_vinayak"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors text-muted-foreground hover:text-foreground"
          >
            <Icon name="simple-icons:x" class="w-5 h-5"></Icon>
          </a>
          <a
            href="https://github.com/geoql/v-maplibre"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors text-muted-foreground hover:text-foreground"
          >
            <Icon name="simple-icons:github" class="w-5 h-5"></Icon>
          </a>
          <button
            class="transition-colors text-muted-foreground hover:text-foreground"
            @click="toggleColorMode"
          >
            <Icon
              :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'"
              class="w-5 h-5"
            ></Icon>
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>
