<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      code: string;
      lang?: string;
      filename?: string;
    }>(),
    {
      lang: 'vue',
      filename: 'Example.vue',
    },
  );

  const copied = ref(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(props.code);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  const langIcon = computed(() => {
    const icons: Record<string, string> = {
      vue: 'vscode-icons:file-type-vue',
      ts: 'vscode-icons:file-type-typescript',
      typescript: 'vscode-icons:file-type-typescript',
      js: 'vscode-icons:file-type-js',
      javascript: 'vscode-icons:file-type-js',
      json: 'vscode-icons:file-type-json',
      bash: 'vscode-icons:file-type-shell',
      sh: 'vscode-icons:file-type-shell',
    };
    return icons[props.lang] || 'lucide:file-code';
  });
</script>

<template>
  <div class="max-w-full overflow-hidden rounded-lg border border-border">
    <div
      class="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2"
    >
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon :name="langIcon" class="size-4" />
        <span>{{ filename }}</span>
      </div>
      <button
        class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="Copy code"
        @click="copyCode"
      >
        <Icon
          :name="copied ? 'lucide:check' : 'lucide:copy'"
          class="size-4"
          :class="{ 'text-emerald-500': copied }"
        />
      </button>
    </div>
    <ClientOnly>
      <LazyCodeBlockContent :code="code" :lang="lang" />
      <template #fallback>
        <div class="max-h-110 overflow-auto bg-muted/30 p-4">
          <div class="space-y-2">
            <div class="h-4 w-3/4 animate-pulse rounded-sm bg-muted"></div>
            <div class="h-4 w-1/2 animate-pulse rounded-sm bg-muted"></div>
            <div class="h-4 w-5/6 animate-pulse rounded-sm bg-muted"></div>
            <div class="h-4 w-2/3 animate-pulse rounded-sm bg-muted"></div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
