import { getSchema, type JSONContent } from '@tiptap/core';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { toHtml } from 'hast-util-to-html';
import { common, createLowlight } from 'lowlight';
import { z } from 'zod';

export type RichText = JSONContent;

export const lowlight = createLowlight(common);
export const LANGUAGES = lowlight.listLanguages().sort();

// One extension list shared by the editor, the renderer, and validation,
// so a stored document can always be rendered.
export const extensions = [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockLowlight.configure({ lowlight })
];

const schema = getSchema(extensions);

export const richTextSchema = z
    .looseObject({ type: z.literal('doc') })
    .refine(
        (doc) => {
            try {
                schema.nodeFromJSON(doc).check();
                return true;
            } catch {
                return false;
            }
        },
        { error: 'Invalid document content.' }
    );

export const EMPTY_DOC: RichText = { type: 'doc', content: [] };

/** URL-safe version of a title: lowercase letters, digits, and single hyphens. */
export const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export type Heading = { id: string; level: number; text: string };

const textOf = (node: JSONContent): string =>
    node.text ?? node.content?.map(textOf).join('') ?? '';

function highlight(node: JSONContent) {
    const code = textOf(node);
    const requested = typeof node.attrs?.language === 'string' ? node.attrs.language : null;
    // No (or unknown) language: auto-detect, which is what the editor does while typing.
    const tree = requested && lowlight.registered(requested)
        ? lowlight.highlight(requested, code)
        : lowlight.highlightAuto(code);
    const language = requested ?? tree.data?.language;
    return `<pre><code class="hljs${language ? ` language-${language}` : ''}">${toHtml(tree)}</code></pre>`;
}

/**
 * Renders a document to HTML with heading ids (for a table of contents)
 * and syntax-highlighted code blocks. Works in the browser and on the server.
 */
export function renderRichText(doc: RichText) {
    const headings: Heading[] = [];
    const codeBlocks: JSONContent[] = [];
    const seen = new Map<string, number>();

    const walk = (node: JSONContent) => {
        if (node.type === 'heading') {
            const text = textOf(node);
            const base = slugify(text) || 'section';
            const count = seen.get(base) ?? 0;
            seen.set(base, count + 1);
            headings.push({ id: count ? `${base}-${count}` : base, level: Number(node.attrs?.level ?? 1), text });
        }
        if (node.type === 'codeBlock') codeBlocks.push(node);
        node.content?.forEach(walk);
    };
    walk(doc);

    // Tiptap emits bare <h2> and <pre><code>; both are swapped in document order.
    // Safe to do with regex because the schema never lets raw HTML into the document.
    let h = 0;
    let c = 0;
    const html = generateHTML(doc, extensions)
        .replace(/<h([1-6])>/g, (_, level) => `<h${level} id="${headings[h++]?.id ?? ''}">`)
        .replace(/<pre><code[^>]*>[\s\S]*?<\/code><\/pre>/g, () => highlight(codeBlocks[c++]));

    return { html, headings };
}
