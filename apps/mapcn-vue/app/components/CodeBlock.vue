<script setup lang="ts">
  import { codeToHtml } from 'shiki';

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

  const colorMode = useColorMode();
  const copied = ref(false);

  const { data: highlightedCode } = await useAsyncData(
    `code-${props.code.slice(0, 50)}`,
    async () => {
      return codeToHtml(props.code, {
        lang: props.lang,
        theme: colorMode.value === 'dark' ? 'github-dark' : 'github-light',
      });
    },
    { watch: [() => colorMode.value] },
  );

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
  <div class="overflow-hidden rounded-lg border border-border max-w-full">
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2"
    >
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon :name="langIcon" class="h-4 w-4"></Icon>
        <span>{{ filename }}</span>
      </div>
      <button
        class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="Copy code"
        @click="copyCode"
      >
        <Icon
          :name="copied ? 'lucide:check' : 'lucide:copy'"
          class="h-4 w-4"
          :class="{ 'text-emerald-500': copied }"
        ></Icon>
      </button>
    </div>
    <!-- Code -->
    <div
      class="max-h-110 overflow-auto text-sm [&_pre]:m-0! [&_pre]:rounded-none! [&_pre]:p-4!"
      v-html="highlightedCode"
    ></div>
  </div>
</template>
