/// <reference types="@cloudflare/workers-types" />

// Cloudflare Pages middleware: implements Markdown content negotiation for agents.
// Requests carrying `Accept: text/markdown` get a Markdown rendering of the page
// (Content-Type: text/markdown, x-markdown-tokens header); everyone else gets the
// static HTML untouched. Covers what Cloudflare's "Markdown for Agents" zone
// feature would do — that setting needs a paid plan, this runs on Free.

import { htmlToMarkdown } from './markdown';

function wantsMarkdown(accept: string): boolean {
  return accept
    .toLowerCase()
    .split(',')
    .some((part) => {
      const [type, ...params] = part.trim().split(';');
      if (type.trim() !== 'text/markdown') return false;
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return q ? parseFloat(q.slice(2)) > 0 : true;
    });
}

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  if (!wantsMarkdown(context.request.headers.get('accept') ?? '')) return response;
  if (!response.ok) return response;
  if (!(response.headers.get('content-type') ?? '').includes('text/html')) return response;

  const { pathname } = new URL(context.request.url);
  const { markdown, tokens } = htmlToMarkdown(await response.text(), pathname);

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/markdown; charset=utf-8');
  const vary = headers.get('vary');
  headers.set('vary', vary ? `${vary}, accept` : 'accept');
  headers.set('x-markdown-tokens', String(tokens));
  // TEMP DEBUG
  headers.set('x-debug-md', `mdlen=${markdown.length} tokens=${tokens} est=${Math.ceil(markdown.length / 4)}`);
  // Body no longer matches the HTML representation's metadata.
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('etag');
  headers.delete('last-modified');

  return new Response(markdown, { status: response.status, headers });
};
