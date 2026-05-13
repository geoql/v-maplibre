<script setup lang="ts">
  import type { ExampleCategory } from '~/types/examples';
  import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
  } from '~/components/ui/sidebar';

  defineProps<{
    categories: ExampleCategory[];
  }>();

  const route = useRoute();
  const { setOpenMobile } = useSidebar();
  const colorMode = useColorMode();

  watch(
    () => route.path,
    () => setOpenMobile(false),
  );

  function toggleColorMode() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  }
</script>

<template>
  <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
    <SidebarHeader class="border-b border-sidebar-border px-4 py-3">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <Icon name="lucide:map" class="size-5" />
        <span>mapcn-vue</span>
      </NuxtLink>
    </SidebarHeader>

    <SidebarContent class="hide-scrollbar">
      <nav aria-label="Example navigation">
        <!-- Home + Examples index links -->
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="route.path === '/'">
                <NuxtLink to="/">
                  <Icon name="lucide:home" class="size-4" />
                  <span>Home</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                as-child
                :is-active="route.path === '/examples'"
              >
                <NuxtLink to="/examples">
                  <Icon name="lucide:grid-2x2" class="size-4" />
                  <span>All Examples</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <!-- Example categories -->
        <SidebarGroup v-for="category in categories" :key="category.id">
          <SidebarGroupLabel class="uppercase tracking-widest">
            {{ category.title }}
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem
              v-for="example in category.examples"
              :key="example.href"
            >
              <SidebarMenuButton
                as-child
                :is-active="route.path === example.href"
                size="sm"
              >
                <NuxtLink :to="example.href">
                  <Icon :name="example.icon" class="size-4" />
                  <span>{{ example.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
              <SidebarMenuBadge v-if="example.badge">
                {{ example.badge }}
              </SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </nav>
    </SidebarContent>

    <SidebarFooter class="border-t border-sidebar-border px-4 py-3">
      <div class="flex items-center gap-1">
        <a
          href="https://github.com/geoql/v-maplibre"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex size-8 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Icon name="simple-icons:github" class="size-4" />
          <span class="sr-only">GitHub</span>
        </a>
        <button
          type="button"
          class="inline-flex size-8 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          @click="toggleColorMode"
        >
          <Icon
            :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'"
            class="size-4"
          />
          <span class="sr-only">Toggle theme</span>
        </button>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
