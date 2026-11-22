/**
 * Every URL the old Docus site had indexed still answers 200 with HTML, and
 * an unknown URL gets the shell's 404 page. Runs against a served build:
 *   DOCS_BASE_URL=http://localhost:8799 pnpm --filter @geoql/v-maplibre-docs run test:e2e
 */
import { describe, expect, it } from 'vite-plus/test';
import oracle from './oracle.json' with { type: 'json' };

const base = process.env.DOCS_BASE_URL ?? 'http://localhost:8799';

describe('docs URLs', () => {
  it.each(oracle.urls)('%s answers 200 with HTML', async (path) => {
    const res = await fetch(new URL(path, base), {
      headers: { accept: 'text/html' },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/^text\/html/);
  });

  it('answers an unknown page with the styled 404', async () => {
    const res = await fetch(new URL('/not-a-page', base), {
      headers: { accept: 'text/html' },
    });
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('data-shell-error');
  });
});
