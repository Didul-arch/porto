import type { Project } from '#lib/types/project.ts';
import { deleteImage } from '#lib/server/storage.ts';
import { deleteProjectSchema } from '#lib/schemas/project.ts';
import { db, isUniqueViolation } from '#lib/server/db.ts';
import { PROJECT_COLUMNS, readProjectInput, uploadHeroImage, withImageUrl } from '#lib/server/projects.ts';
import { EMPTY_DOC } from '#lib/richtext.ts';
import type { RequestHandler } from './$types';

type ProjectRow = Omit<Project, 'heroImageUrl'> & { heroImageKey: string | null };

export const GET: RequestHandler = async () => {
    const result = await db.query<ProjectRow>(`
        SELECT ${PROJECT_COLUMNS}
        FROM projects
        ORDER BY created_at DESC, id DESC
    `);

    return Response.json({
        total: result.rows.length,
        projects: result.rows.map(withImageUrl)
    });
};

export const POST: RequestHandler = async ({ request }) => {
    const input = await readProjectInput(request);
    if (input instanceof Response) return input;

    const { data: project, image } = input;
    let imageKey: string | null = null;

    if (image) {
        const uploaded = await uploadHeroImage(image);
        if (uploaded instanceof Response) return uploaded;
        imageKey = uploaded;
    }

    try {
        const result = await db.query<ProjectRow>(
            `INSERT INTO projects (
                slug, title, description, category, technologies,
                status, repository_uri, demo_url, role, hero_image_key, content
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING ${PROJECT_COLUMNS}`,
            [
                project.slug,
                project.title,
                project.description,
                project.category,
                project.technologies,
                project.status ?? null,
                project.repositoryUrl ?? null,
                project.demoUrl ?? null,
                project.role ?? null,
                imageKey ?? ('heroImageKey' in project ? project.heroImageKey : null) ?? null,
                project.content ?? EMPTY_DOC
            ]
        );

        return Response.json(withImageUrl(result.rows[0]), { status: 201 });
    } catch (error) {
        // The image is already in storage; remove it so it does not become an orphan.
        if (imageKey) {
            await deleteImage(imageKey).catch((cleanupError) =>
                console.error('Failed to clean up image after project insert failed.', { imageKey, cleanupError })
            );
        }
        if (isUniqueViolation(error)) {
            return Response.json({ message: 'Slug is already taken.' }, { status: 409 });
        }
        console.error('Project insert failed.', error);
        return Response.json({ message: 'Failed to save project.' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request }) => {
    const body: unknown = await request.json().catch(() => null);
    const parsed = deleteProjectSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { message: 'Invalid project data.', errors: parsed.error.issues },
            { status: 400 }
        );
    }

    const result = await db.query<{ heroImageKey: string | null }>(
        `DELETE FROM projects WHERE id = $1 RETURNING hero_image_key AS "heroImageKey"`,
        [parsed.data.id]
    );

    if (result.rowCount === 0) {
        return Response.json({ message: 'Project not found.' }, { status: 404 });
    }

    const imageKey = result.rows[0]?.heroImageKey;
    if (imageKey) {
        await deleteImage(imageKey).catch((error) =>
            console.error('Failed to delete project image from storage.', { imageKey, error })
        );
    }

    return new Response(null, { status: 204 });
};
