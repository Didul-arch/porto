import { z } from 'zod';
import { HTTP_PROTOCOL_REGEX } from '#lib/const/regex.ts';

const httpUrlSchema = z.url({ protocol: HTTP_PROTOCOL_REGEX }).max(2048);

const imageUrlSchema = z.string().max(2048).refine(
    (value) =>
        (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) ||
        httpUrlSchema.safeParse(value).success,
    { error: 'Gunakan path /images/... atau URL HTTP/HTTPS.' }
);

export const createProjectSchema = z.object({
    title: z.string().trim().min(1).max(30),
    description: z.string().trim().min(1),
    category: z.enum(['Personal', 'Uni Project']),
    technologies: z.array(z.string().trim().min(1).max(30)),
    status: z.string().max(16).nullable().optional(),
    repositoryUrl: httpUrlSchema.nullable().optional(),
    images: z.array(imageUrlSchema).nullable().optional()
});

export const deleteProjectSchema = z.object({
    id: z.uuid()
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
