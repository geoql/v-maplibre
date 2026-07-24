const MIN_MARKDOWN_LENGTH = 40;

// Decode ONLY &amp; and &nbsp;. Decoding &lt; / &gt; / &quot; / &#39; would
// re-introduce raw angle brackets/quotes an upstream sanitizer had neutralised,
// turning stored HTML back into live markup (indirect XSS). Everything else is
// left encoded on purpose.
function decodeSafeEntities(value: string): string {
  return value.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, '');
}

function inlineToMarkdown(html: string): string {
  let out = html;
  // Links: <a href="x">label</a> → [label](x)
  out = out.replace(
    /<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi,
    (_m, _q, href: string, label: string) =>
      `[${stripTags(label).trim()}](${href})`,
  );
  // Inline code: <code>x</code> → `x`
  out = out.replace(
    /<code\b[^>]*>([\s\S]*?)<\/code>/gi,
    (_m, code: string) => `\`${stripTags(code)}\``,
  );
  // Bold / strong and emphasis / italics.
  out = out.replace(
    /<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi,
    (_m, t: string) => `**${stripTags(t).trim()}**`,
  );
  out = out.replace(
    /<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi,
    (_m, t: string) => `_${stripTags(t).trim()}_`,
  );
  return out;
}

function blockToMarkdown(html: string): string {
  let out = html;

  // Fenced code blocks: <pre>...</pre> → ```\n...\n```
  out = out.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_m, inner: string) => {
    const code = stripTags(inner).replace(/\n+$/, '');
    return `\n\`\`\`\n${code}\n\`\`\`\n`;
  });

  // Headings h1-h6 → #..######
  for (let level = 1; level <= 6; level++) {
    const re = new RegExp(
      `<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`,
      'gi',
    );
    const hashes = '#'.repeat(level);
    out = out.replace(
      re,
      (_m, t: string) =>
        `\n${hashes} ${stripTags(inlineToMarkdown(t)).trim()}\n`,
    );
  }

  // List items → "- item"
  out = out.replace(
    /<li\b[^>]*>([\s\S]*?)<\/li>/gi,
    (_m, t: string) => `- ${stripTags(inlineToMarkdown(t)).trim()}\n`,
  );

  // Paragraphs → text + blank line
  out = out.replace(
    /<p\b[^>]*>([\s\S]*?)<\/p>/gi,
    (_m, t: string) => `\n${stripTags(inlineToMarkdown(t)).trim()}\n`,
  );

  return out;
}

/**
 * Convert a page's HTML to markdown for `Accept: text/markdown` agents. Scoped
 * to <main> when present so nav/footer chrome is dropped. Returns undefined
 * when the conversion yields too little text (< 40 chars) so the caller can
 * fall through to the original HTML response.
 */
export function htmlToMarkdown(html: string): string | undefined {
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const scoped = mainMatch ? mainMatch[1] : html;

  // Remove script/style blocks entirely before any other processing.
  const withoutScripts = scoped
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  const blocked = blockToMarkdown(withoutScripts);
  const inlined = inlineToMarkdown(blocked);
  const stripped = stripTags(inlined);
  const decoded = decodeSafeEntities(stripped);

  const markdown = decoded
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (markdown.length < MIN_MARKDOWN_LENGTH) {
    return undefined;
  }
  return markdown;
}
