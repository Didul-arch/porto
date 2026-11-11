import type { Blog } from '#lib/types/blog.ts';
import { SLUG_REGEX } from '#lib/const/regex.ts';
import { createBlogSchema } from '#lib/schemas/blog.ts';
import { db, isUniqueViolation } from '#lib/server/db.ts';
import type { RequestHandler } from './$types';

const BLOG_COLUMNS = `id, slug, title, content, created_at AS "createdAt", updated_at AS "updatedAt"`;

const notFound = () => Response.json({ message: 'Blog not found.' }, { status: 404 });

export const GET: RequestHandler = async ({ params }) => {
    if (!SLUG_REGEX.test(params.slug)) return notFound();

    const result = await db.query<Blog>(
        `SELECT ${BLOG_COLUMNS} FROM blogs WHERE slug = $1`,
        [params.slug]
    );

    const blog = result.rows[0];
    return blog ? Response.json(blog) : notFound();
};

export const PUT: RequestHandler = async ({ params, request }) => {
    if (!SLUG_REGEX.test(params.slug)) return notFound();

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
            `UPDATE blogs SET slug = $1, title = $2, content = $3
            WHERE slug = $4
            RETURNING ${BLOG_COLUMNS}`,
            [slug, title, content, params.slug]
        );

        const blog = result.rows[0];
        return blog ? Response.json(blog) : notFound();
    } catch (error) {
        if (isUniqueViolation(error)) {
            return Response.json({ message: 'Slug is already taken.' }, { status: 409 });
        }
        console.error('Blog update failed.', error);
        return Response.json({ message: 'Failed to save blog.' }, { status: 500 });
    }
};
