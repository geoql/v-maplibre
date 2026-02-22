import type { Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> | null {
  if (!import.meta.client) return null;
  if (!highlighterPromise) {
    highlighterPromise = import('shiki/bundle/web').then((mod) =>
      mod.createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: ['vue', 'bash', 'typescript'],
      }),
    );
  }
  return highlighterPromise;
}

export function useShiki(code: Ref<string | undefined>, lang: Ref<string>) {
  const highlightedHtml = ref('');
  const colorMode = useColorMode();

  async function highlight() {
    const shikiPromise = getHighlighter();
    if (!shikiPromise) return;
    const raw = code.value;
    if (!raw) {
      highlightedHtml.value = '';
      return;
    }
    const shiki = await shikiPromise;
    const theme = colorMode.value === 'dark' ? 'github-dark' : 'github-light';
    highlightedHtml.value = shiki.codeToHtml(raw, {
      lang: lang.value,
      theme,
    });
  }

  watch([code, lang, colorMode], () => highlight(), { immediate: true });

  return { highlightedHtml };
}
