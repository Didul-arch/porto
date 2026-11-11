import { error } from '@sveltejs/kit';
import { renderRichText } from '#lib/richtext.ts';
import type { Project, ProjectDetail } from '#lib/types/project.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
    const [res, listRes] = await Promise.all([
        fetch(`/api/projects/${params.slug}`),
        fetch('/api/projects')
    ]);

    if (res.status === 404) error(404, 'Project not found.');
    if (!res.ok || !listRes.ok) error(502, 'Failed to load project.');

    const project: ProjectDetail = await res.json();
    const { projects }: { projects: Project[] } = await listRes.json();

    const { html, headings } = renderRichText(project.content);

    // The list is newest first: "next" is the newer neighbour, "previous" the older one.
    const position = projects.findIndex((p) => p.slug === project.slug);
    const pick = (p?: Project) => (p ? { slug: p.slug, title: p.title } : null);

    return {
        project,
        html,
        headings: headings.filter((heading) => heading.level <= 3),
        previous: pick(projects[position + 1]),
        next: pick(projects[position - 1])
    };
};
