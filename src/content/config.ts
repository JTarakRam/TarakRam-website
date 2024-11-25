import { defineCollection, z } from "astro:content";

const blogsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishDate: z.date(),
    category: z.string(),
    author: z.string(),
    excerpt: z.string(),
    image: z.string().optional(),
  }),
});

const newsletterCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishDate: z.date(),
    description: z.string(),
    author: z.string().default("Tarak Ram"),
    image: z.string().optional(),
  }),
});

const booksCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishDate: z.date(),
    author: z.string(),
    coverImage: z.string(),
    description: z.string(),
    sentence1: z.string(),
    sentence2: z.string(),
    sentence3: z.string(),
    impressions: z.string(),
    whoShouldRead: z.string(),
    howBookChangedMe: z.array(z.string()),
    topQuotes: z.array(z.string()),
  }),
});

export const collections = {
  blogs: blogsCollection,
  newsletters: newsletterCollection,
  books: booksCollection,
};
