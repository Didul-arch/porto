import type { Blog, BlogSummary } from '#lib/types/blog.ts';
import { createBlogSchema, deleteBlogSchema } from '#lib/schemas/blog.ts';
import { db, isUniqueViolation } from '#lib/server/db.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    const result = await db.query<BlogSummary>(`
        SELECT id, slug, title, created_at AS "createdAt"
        FROM blogs
        ORDER BY created_at DESC, id DESC
    `);

    return Response.json({ total: result.rows.length, blogs: result.rows });
};

export const POST: RequestHandler = async ({ request }) => {
    const body: unknown = await request.json().catch(() => null);
    const parsed = createBlogSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { message: 'Invalid blog data.', errors: parsed.error.issues },
            { status: 400 }
        );
    }

    const { slug, title, content } = parsed.data;

    try {
        const result = await db.query<Blog>(
            `INSERT INTO blogs (slug, title, content)
            VALUES ($1, $2, $3)
            RETURNING id, slug, title, content,
                created_at AS "createdAt", updated_at AS "updatedAt"`,
            [slug, title, content]
        );

        return Response.json(result.rows[0], { status: 201 });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return Response.json({ message: 'Slug is already taken.' }, { status: 409 });
        }
        console.error('Blog insert failed.', error);
        return Response.json({ message: 'Failed to save blog.' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request }) => {
    const body: unknown = await request.json().catch(() => null);
    const parsed = deleteBlogSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { message: 'Invalid blog data.', errors: parsed.error.issues },
            { status: 400 }
        );
    }

    const result = await db.query(`DELETE FROM blogs WHERE id = $1`, [parsed.data.id]);

    if (result.rowCount === 0) {
        return Response.json({ message: 'Blog not found.' }, { status: 404 });
    }

    return new Response(null, { status: 204 });
};
