import { defineCollection, defineContentConfig, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    // Numeric prefixes order the files and are stripped from the paths:
    // content/3.layers/5.raster-layers.md -> /layers/raster-layers.
    docs: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        /** Iconify name or Docus-style `i-lucide-*` class for the nav. */
        icon: z.string().optional(),
      }),
    }),
  },
});
