import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Project } from '#lib/types/project.ts';

export const load: PageLoad = async ({ fetch }) => {
    const res = await fetch('/api/projects');

    if (!res.ok) {
        error(502, 'Failed to load projects.');
    }

    const result: { total: number; projects: Project[] } = await res.json();

    return { projects: result.projects };
};
