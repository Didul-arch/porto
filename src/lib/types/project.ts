import type { CreateProjectInput } from '#lib/schemas/project.ts';

export type { CreateProjectInput } from '#lib/schemas/project.ts';

export type Project = Omit<CreateProjectInput, 'heroImageKey'> & {
    id: string;
    details?: string;
    heroImageUrl: string | null;
};
