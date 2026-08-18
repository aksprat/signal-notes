import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string(),
    topics: z.array(z.string()),
    readTime: z.string(),
    featured: z.boolean().default(false)
  })
});

export const collections = { articles };
