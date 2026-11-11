import { z } from 'zod';
import { SLUG_REGEX } from '#lib/const/regex.ts';
import { richTextSchema } from '#lib/richtext.ts';

export const createBlogSchema = z.object({
    slug: z.string().trim().max(100).regex(SLUG_REGEX, { error: 'Slug may only contain lowercase letters, digits, and hyphens.' }),
    title: z.string().trim().min(1).max(120),
    content: richTextSchema
});

export const deleteBlogSchema = z.object({
    id: z.uuid()
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
