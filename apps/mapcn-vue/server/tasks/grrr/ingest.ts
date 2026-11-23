import type { GrrrDb } from '../../types/grrr';

/**
 * Cron: loads the GRRR large-river basins into D1 (see
 * server/utils/grrr-ingest.ts). Each run works for up to 60 s and saves where
 * it stopped; once everything is loaded a run only reads one row.
 */
export default defineTask({
  meta: {
    name: 'grrr:ingest',
    description: 'Load GRRR large-river basins into D1',
  },
  async run({ context }) {
    const env = (context as { cloudflare?: { env?: { DB?: GrrrDb } } })
      .cloudflare?.env;
    if (!env?.DB) return { result: 'skipped: no D1 binding' };
    const { next, total } = await runGrrrIngest(env.DB, 60_000);
    return { result: `step ${next} of ${total}` };
  },
});
