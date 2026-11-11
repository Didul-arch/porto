import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Blog } from '#lib/types/blog.ts';

export const load: PageLoad = async ({ fetch, params }) => {
    const res = await fetch(`/api/blogs/${params.slug}`);

    if (res.status === 404) error(404, 'Blog not found.');
    if (!res.ok) error(502, 'Failed to load blog.');

    const blog: Blog = await res.json();
    return { blog };
};
