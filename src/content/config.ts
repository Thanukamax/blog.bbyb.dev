import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    topic: z.string(),
    authors: z.array(z.string()),
    authorInitials: z.array(z.string()),
    authorRoles: z.array(z.string()).optional(),
    date: z.date(),
    readTime: z.string(),
    featured: z.boolean().optional().default(false),
    deck: z.string().optional(),
    heroImage: z.string().optional(),
  }),
});

export const collections = { blog };
