import { z } from 'zod';
import { HTTP_PROTOCOL_REGEX, SLUG_REGEX } from '#lib/const/regex.ts';
import { richTextSchema } from '#lib/richtext.ts';

const httpUrlSchema = z.url({ protocol: HTTP_PROTOCOL_REGEX }).max(2048);

export const createProjectSchema = z.object({
    slug: z.string().trim().max(100).regex(SLUG_REGEX, { error: 'Slug may only contain lowercase letters, digits, and hyphens.' }),
    title: z.string().trim().min(1).max(30),
    description: z.string().trim().min(1),
    category: z.enum(['Personal', 'Uni Project']),
    technologies: z.array(z.string().trim().min(1).max(30)),
    status: z.string().max(16).nullable().optional(),
    role: z.string().trim().max(60).nullable().optional(),
    repositoryUrl: httpUrlSchema.nullable().optional(),
    demoUrl: httpUrlSchema.nullable().optional(),
    heroImageKey: z.string().trim().min(1).max(1024).nullable().optional(),
    content: richTextSchema.optional()
});

export const deleteProjectSchema = z.object({
    id: z.uuid()
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
