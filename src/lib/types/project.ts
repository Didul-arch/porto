import type { CreateProjectInput } from '#lib/schemas/project.ts';
import type { RichText } from '#lib/richtext.ts';

export type { CreateProjectInput } from '#lib/schemas/project.ts';

export type Project = Omit<CreateProjectInput, 'heroImageKey' | 'content'> & {
    id: string;
    heroImageUrl: string | null;
};

export type ProjectDetail = Project & {
    content: RichText;
};
