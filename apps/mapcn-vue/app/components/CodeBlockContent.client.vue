<script setup lang="ts">
  import { codeToHtml } from 'shiki';

  const props = defineProps<{
    code: string;
    lang: string;
  }>();

  const colorMode = useColorMode();

  const theme = computed(() =>
    colorMode.value === 'dark' ? 'github-dark' : 'github-light',
  );

  const highlightedCode = ref('');

  async function highlight() {
    highlightedCode.value = await codeToHtml(props.code, {
      lang: props.lang,
      theme: theme.value,
    });
  }

  watch(theme, highlight, { immediate: true });
</script>

<template>
  <div
    class="max-h-110 overflow-auto text-sm [&_pre]:m-0! [&_pre]:rounded-none! [&_pre]:p-4!"
    v-html="highlightedCode"
  ></div>
</template>
