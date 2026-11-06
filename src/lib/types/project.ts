import type { CreateProjectInput } from '#lib/schemas/project.ts';

export type { CreateProjectInput } from '#lib/schemas/project.ts';

export type Project = CreateProjectInput & {
    id: string;
    details?: string;
};
