import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()),
    severity: z.enum(['info', 'low', 'medium', 'high', 'critical']).optional(),
    cve: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };