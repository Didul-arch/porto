import { S3_PUBLIC_BASE_URL } from '$app/env/private';
import { createProjectSchema, type CreateProjectInput } from '#lib/schemas/project.ts';
import { ImageValidationError, uploadImage } from '#lib/server/storage.ts';

// Shared by POST /api/projects and PUT /api/projects/[slug].

export const PROJECT_COLUMNS = `
    id, slug, title, description, category, technologies, status, role,
    repository_uri AS "repositoryUrl",
    demo_url AS "demoUrl",
    hero_image_key AS "heroImageKey",
    created_at AS "createdAt", updated_at AS "updatedAt"`;

/** Replaces the storage key with the public URL the browser can load. */
export function withImageUrl<T extends { heroImageKey: string | null }>({ heroImageKey, ...row }: T) {
    return {
        ...row,
        heroImageUrl: heroImageKey ? `${S3_PUBLIC_BASE_URL}/${heroImageKey}` : null
    };
}

const parseJsonField = (value: FormDataEntryValue | null) => {
    if (typeof value !== 'string') return undefined;
    try {
        return JSON.parse(value);
    } catch {
        // Leave the broken string for Zod so the client gets a 400, not a 500.
        return value;
    }
};

export type ProjectInput = { data: CreateProjectInput; image?: File };

/** Reads JSON or multipart (metadata + optional `image` file). Returns a 400 Response when invalid. */
export async function readProjectInput(request: Request): Promise<ProjectInput | Response> {
    const isMultipart = request.headers.get('content-type')
        ?.split(';')[0].trim().toLowerCase() === 'multipart/form-data';

    let body: unknown;
    let image: File | undefined;

    if (isMultipart) {
        const form = await request.formData().catch(() => null);
        if (!form) {
            return Response.json({ message: 'Invalid form upload.' }, { status: 400 });
        }

        const imageFields = form.getAll('image').filter((field) => field instanceof File && field.size > 0);
        if (imageFields.length > 1) {
            return Response.json({ message: 'Send at most one file in the image field.' }, { status: 400 });
        }
        image = imageFields[0] as File | undefined;

        const optional = (name: string) => form.get(name) || null;
        body = {
            slug: form.get('slug'),
            title: form.get('title'),
            description: form.get('description'),
            category: form.get('category'),
            technologies: form.getAll('technologies'),
            status: optional('status'),
            role: optional('role'),
            repositoryUrl: optional('repositoryUrl'),
            demoUrl: optional('demoUrl'),
            content: parseJsonField(form.get('content'))
        };
    } else {
        body = await request.json().catch(() => null);
    }

    const schema = isMultipart ? createProjectSchema.omit({ heroImageKey: true }) : createProjectSchema;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { message: 'Invalid project data.', errors: parsed.error.issues },
            { status: 400 }
        );
    }

    return { data: parsed.data, image };
}

/** Uploads the hero image. Returns the storage key, or an error Response (4xx for bad input, 502 for storage failure). */
export async function uploadHeroImage(image: File): Promise<string | Response> {
    try {
        return await uploadImage(image);
    } catch (error) {
        if (error instanceof ImageValidationError) {
            return Response.json({ message: error.message }, { status: error.status });
        }
        console.error('Project image upload failed.', error);
        return Response.json({ message: 'Failed to upload image to storage.' }, { status: 502 });
    }
}
