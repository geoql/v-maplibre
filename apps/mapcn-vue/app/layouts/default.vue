<script setup lang="ts">
  import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';

  const { categories } = useExamplesData();
</script>

<template>
  <SidebarProvider :default-open="false">
    <AppSidebar :categories="categories" />
    <SidebarInset>
      <FloatingToolbar />
      <slot></slot>
    </SidebarInset>
  </SidebarProvider>
</template>
