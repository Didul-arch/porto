import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { ProjectDetail } from '#lib/types/project.ts';

export const load: PageLoad = async ({ fetch, params }) => {
    const res = await fetch(`/api/projects/${params.slug}`);

    if (res.status === 404) error(404, 'Project not found.');
    if (!res.ok) error(502, 'Failed to load project.');

    const project: ProjectDetail = await res.json();
    return { project };
};
