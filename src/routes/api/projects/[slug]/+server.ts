import type { ProjectDetail } from '#lib/types/project.ts';
import { SLUG_REGEX } from '#lib/const/regex.ts';
import { db, isUniqueViolation } from '#lib/server/db.ts';
import { PROJECT_COLUMNS, readProjectInput, uploadHeroImage, withImageUrl } from '#lib/server/projects.ts';
import { deleteImage } from '#lib/server/storage.ts';
import type { RequestHandler } from './$types';

type ProjectDetailRow = Omit<ProjectDetail, 'heroImageUrl'> & { heroImageKey: string | null };

const notFound = () => Response.json({ message: 'Project not found.' }, { status: 404 });

export const GET: RequestHandler = async ({ params }) => {
    if (!SLUG_REGEX.test(params.slug)) return notFound();

    const result = await db.query<ProjectDetailRow>(
        `SELECT ${PROJECT_COLUMNS}, content FROM projects WHERE slug = $1`,
        [params.slug]
    );

    const row = result.rows[0];
    return row ? Response.json(withImageUrl(row)) : notFound();
};

export const PUT: RequestHandler = async ({ params, request }) => {
    if (!SLUG_REGEX.test(params.slug)) return notFound();

    const input = await readProjectInput(request);
    if (input instanceof Response) return input;

    // Look up the current image first so a missing project never triggers an upload.
    const current = await db.query<{ heroImageKey: string | null }>(
        `SELECT hero_image_key AS "heroImageKey" FROM projects WHERE slug = $1`,
        [params.slug]
    );
    if (current.rowCount === 0) return notFound();
    const oldImageKey = current.rows[0].heroImageKey;

    const { data: project, image } = input;
    let newImageKey: string | null = null;

    if (image) {
        const uploaded = await uploadHeroImage(image);
        if (uploaded instanceof Response) return uploaded;
        newImageKey = uploaded;
    }

    try {
        const result = await db.query<ProjectDetailRow>(
            `UPDATE projects SET
                slug = $1, title = $2, description = $3, category = $4, technologies = $5,
                status = $6, repository_uri = $7, demo_url = $8, role = $9,
                hero_image_key = COALESCE($10, hero_image_key),
                content = COALESCE($11, content)
            WHERE slug = $12
            RETURNING ${PROJECT_COLUMNS}, content`,
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
                newImageKey,
                project.content ?? null,
                params.slug
            ]
        );

        if (newImageKey && oldImageKey) {
            await deleteImage(oldImageKey).catch((error) =>
                console.error('Failed to delete replaced project image.', { oldImageKey, error })
            );
        }

        return Response.json(withImageUrl(result.rows[0]));
    } catch (error) {
        if (newImageKey) {
            await deleteImage(newImageKey).catch((cleanupError) =>
                console.error('Failed to clean up image after project update failed.', { newImageKey, cleanupError })
            );
        }
        if (isUniqueViolation(error)) {
            return Response.json({ message: 'Slug is already taken.' }, { status: 409 });
        }
        console.error('Project update failed.', error);
        return Response.json({ message: 'Failed to save project.' }, { status: 500 });
    }
};
