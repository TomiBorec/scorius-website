// Pure HTML → Markdown converter for the Scorius marketing pages.
// Kept free of Cloudflare/runtime dependencies so it can be unit-tested with plain Node.
// Mirrors the output contract of Cloudflare's "Markdown for Agents":
// YAML frontmatter (title/description/image) + body markdown from <main>,
// with nav/footer/scripts/styles/svg stripped.

export interface MarkdownResult {
  markdown: string;
  tokens: number;
}

/** Rough token estimate (≈4 chars per token), same spirit as Cloudflare's x-markdown-tokens. */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&mdash;': '\u2014',
  '&ndash;': '\u2013',
  '&hellip;': '\u2026',
  '&middot;': '\u00B7',
  '&times;': '\u00D7',
  '&rarr;': '\u2192',
  '&copy;': '\u00A9',
  '&trade;': '\u2122',
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

/** Strip tags, decode entities, collapse to a single line — for headings, cells, buttons… */
function inline(html: string): string {
  return decodeEntities(stripTags(html)).replace(/\s+/g, ' ').trim();
}

function metaContent(html: string, attr: 'name' | 'property', key: string): string | null {
  const first = new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`, 'i');
  const second = new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${key}"`, 'i');
  const m = html.match(first) ?? html.match(second);
  return m && m[1].trim() ? decodeEntities(m[1]).trim() : null;
}

function titleTag(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? decodeEntities(m[1]).trim() : null;
}

function yamlEscape(value: string): string {
  return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function absolutize(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function convertTable(tableHtml: string): string {
  const rows: string[][] = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(tableHtml))) {
    const cells: string[] = [];
    const cellRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRe.exec(rowMatch[1]))) {
      cells.push(inline(cellMatch[1]).replace(/\|/g, '\\|'));
    }
    if (cells.length) rows.push(cells);
  }
  if (!rows.length) return '';

  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r: string[]) => Array.from({ length: width }, (_, i) => r[i] ?? '');
  const line = (r: string[]) => '| ' + pad(r).join(' | ') + ' |';
  const separator = '| ' + Array(width).fill('---').join(' | ') + ' |';
  const [header, ...bodyRows] = rows;
  return [line(header), separator, ...bodyRows.map(line)].join('\n');
}

/**
 * Convert one exported page to a Markdown document.
 * @param html     Full HTML of the page.
 * @param pagePath URL path of the page (e.g. "/", "/features"), used to absolutize links.
 * @param origin   Site origin (default https://scorius.app).
 */
export function htmlToMarkdown(
  html: string,
  pagePath: string,
  origin = 'https://scorius.app',
): MarkdownResult {
  const base = origin + pagePath;

  // --- Frontmatter metadata (same fields as Cloudflare's converter) ---
  const title =
    metaContent(html, 'name', 'title') ?? metaContent(html, 'property', 'og:title') ?? titleTag(html);
  const description =
    metaContent(html, 'name', 'description') ?? metaContent(html, 'property', 'og:description');
  const image = metaContent(html, 'property', 'og:image');

  // --- Body: <main> only, so nav + footer chrome is dropped ---
  let body =
    html.match(/<main[^>]*>([\s\S]*)<\/main>/i)?.[1] ??
    html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ??
    html;

  // Drop non-content elements entirely.
  body = body
    .replace(/<(script|style|svg|noscript|template)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<img[^>]*>/gi, '');

  // Tables before generic block handling (features page rules table).
  body = body.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, t) => `\n\n${convertTable(t)}\n\n`);

  // Line breaks first so <br> inside headings/paragraphs becomes a space (via inline()'s
  // whitespace collapse) instead of gluing words together.
  body = body.replace(/<br\s*\/?>/gi, '\n');

  // Inline elements (order matters: anchors before paragraphs so link markdown survives).
  // Note the strict tag-name patterns — `<b ...>` must not match `<br/>`, `<i ...>` must
  // not match `<img>`, etc.
  body = body
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href: string, inner: string) => {
      const text = inline(inner);
      if (!text) return '';
      if (href.startsWith('#')) return text;
      return `[${text}](${absolutize(href, base)})`;
    })
    .replace(/<(strong|b)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi, '*$2*');

  // Headings.
  body = body.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, level: string, inner: string) => {
    const text = inline(inner);
    return text ? `\n\n${'#'.repeat(Number(level))} ${text}\n\n` : '\n';
  });

  // FAQ accordion questions are <button>s — keep as bold standalone lines.
  body = body.replace(/<button[^>]*>([\s\S]*?)<\/button>/gi, (_, inner: string) => {
    const text = inline(inner);
    return text ? `\n\n**${text}**\n\n` : '\n';
  });

  // List items.
  body = body.replace(/<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/gi, (_, inner: string) => `\n- ${inline(inner)}`);

  // Paragraphs.
  body = body.replace(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi, (_, inner: string) => {
    const text = inline(inner);
    return text ? `\n\n${text}\n\n` : '\n';
  });

  // Remaining block-level wrappers become line boundaries.
  body = body.replace(
    /<\/?(div|section|article|header|footer|ul|ol|dl|dd|dt|figure|figcaption|span|form|fieldset)[^>]*>/gi,
    '\n',
  );

  // Strip whatever tags remain, decode entities, tidy whitespace.
  const text = decodeEntities(stripTags(body))
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l, i, arr) => l !== '' || arr[i - 1] !== '') // collapse blank runs
    .join('\n')
    .trim();

  const frontmatter: string[] = [];
  if (title) frontmatter.push(`title: ${yamlEscape(title)}`);
  if (description) frontmatter.push(`description: ${yamlEscape(description)}`);
  if (image) frontmatter.push(`image: ${yamlEscape(absolutize(image, base))}`);

  const markdown =
    (frontmatter.length ? `---\n${frontmatter.join('\n')}\n---\n\n` : '') + text + '\n';

  return { markdown, tokens: estimateTokens(markdown) };
}
