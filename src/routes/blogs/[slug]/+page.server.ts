import { error } from '@sveltejs/kit';
import { renderRichText } from '#lib/richtext.ts';
import type { Blog } from '#lib/types/blog.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
    const res = await fetch(`/api/blogs/${params.slug}`);

    if (res.status === 404) {
        error(404, 'Blog not found.');
    }
    if (!res.ok) {
        error(502, 'Failed to load blog.');
    }

    const blog: Blog = await res.json();

    // Rendered on the server from a document validated against the Tiptap schema on save.
    return { ...blog, html: renderRichText(blog.content).html };
};
