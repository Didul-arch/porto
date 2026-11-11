import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Project } from '#lib/types/project.ts';
import type { BlogSummary } from '#lib/types/blog.ts';

export const load: PageLoad = async ({ fetch }) => {
    const [projectsRes, blogsRes] = await Promise.all([fetch('/api/projects'), fetch('/api/blogs')]);

    if (!projectsRes.ok || !blogsRes.ok) {
        error(502, 'Failed to load dashboard data.');
    }

    const projects: { projects: Project[] } = await projectsRes.json();
    const blogs: { blogs: BlogSummary[] } = await blogsRes.json();

    return { projects: projects.projects, blogs: blogs.blogs };
};
