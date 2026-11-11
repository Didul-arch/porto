import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { BlogSummary } from '#lib/types/blog.ts';

export const load: PageLoad = async ({ fetch }) => {
    const res = await fetch('/api/blogs');

    if (!res.ok) {
        error(502, 'Failed to load blogs.');
    }

    const result: { total: number; blogs: BlogSummary[] } = await res.json();

    return { blogs: result.blogs };
};
