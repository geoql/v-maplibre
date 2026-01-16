<script setup lang="ts">
  import type { RouteTabType } from '~/types/route';
  import { TAB_TO_QUERY, QUERY_TO_TAB } from '~/types/route';

  useSeoMeta({
    title: 'Routes - mapcn-vue Examples',
    description:
      'Route visualization examples: Delivery tracking and route planning with alternatives.',
  });

  const route = useRoute();
  const router = useRouter();

  function getInitialTab(): RouteTabType {
    const tabQuery = route.query.tab as string;
    return QUERY_TO_TAB[tabQuery] || 'planning';
  }

  const activeTab = ref<RouteTabType>(getInitialTab());

  function setActiveTab(tab: RouteTabType) {
    activeTab.value = tab;
    router.replace({ query: { tab: TAB_TO_QUERY[tab] } });
  }

  function isTabActive(tab: RouteTabType): boolean {
    return activeTab.value === tab;
  }

  function getTabClasses(tab: RouteTabType): string {
    const base = 'relative px-1 pb-3 text-sm font-medium transition-colors';
    return activeTab.value === tab
      ? `${base} text-foreground`
      : `${base} text-muted-foreground hover:text-foreground`;
  }
</script>

<template>
  <div class="container max-w-screen-2xl py-10 overflow-x-hidden">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Routes</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Route visualization with VLayerMaplibreRoute component.
        </p>
      </div>

      <div class="mb-6 border-b border-border">
        <div class="flex gap-4">
          <button
            :class="getTabClasses('planning')"
            @click="setActiveTab('planning')"
          >
            Route Planning
            <span
              v-if="isTabActive('planning')"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
            />
          </button>
          <button
            :class="getTabClasses('delivery')"
            @click="setActiveTab('delivery')"
          >
            Delivery Tracking
            <span
              v-if="isTabActive('delivery')"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
            />
          </button>
          <button
            :class="getTabClasses('multiStop')"
            @click="setActiveTab('multiStop')"
          >
            Multi-Stop
            <span
              v-if="isTabActive('multiStop')"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
            />
          </button>
          <button
            :class="getTabClasses('tripPlanner')"
            @click="setActiveTab('tripPlanner')"
          >
            Trip Planner
            <span
              v-if="isTabActive('tripPlanner')"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
            />
          </button>
        </div>
      </div>

      <ExamplesRoutePlanningTab v-if="isTabActive('planning')" />

      <ExamplesRouteDeliveryTrackingTab v-if="isTabActive('delivery')" />

      <ExamplesRouteMultiStopTab v-if="isTabActive('multiStop')" />

      <ExamplesRouteTripPlannerTab v-if="isTabActive('tripPlanner')" />
    </div>
  </div>
</template>
