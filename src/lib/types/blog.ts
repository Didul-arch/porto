import type { RichText } from '#lib/richtext.ts';

export type BlogSummary = {
    id: string;
    slug: string;
    title: string;
    createdAt: string;
};

export type Blog = BlogSummary & {
    content: RichText;
    updatedAt: string;
};
