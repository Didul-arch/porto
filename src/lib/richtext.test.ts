import { describe, expect, it } from 'vitest';
import { renderRichText, richTextSchema } from './richtext.ts';

const doc = {
    type: 'doc',
    content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overview' }] },
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Overview' }] },
        { type: 'codeBlock', attrs: { language: 'go' }, content: [{ type: 'text', text: 'func main() {}' }] },
        { type: 'codeBlock', attrs: { language: null }, content: [{ type: 'text', text: '<b>&</b>' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'under', marks: [{ type: 'underline' }] }] }
    ]
};

describe('renderRichText', () => {
    const { html, headings } = renderRichText(doc);

    it('gives headings unique ids and lists them in order', () => {
        expect(headings).toEqual([
            { id: 'overview', level: 2, text: 'Overview' },
            { id: 'overview-1', level: 3, text: 'Overview' }
        ]);
        expect(html).toContain('<h2 id="overview">');
        expect(html).toContain('<h3 id="overview-1">');
    });

    it('highlights code blocks with a known language', () => {
        expect(html).toContain('language-go');
        expect(html).toContain('hljs-keyword');
    });

    it('auto-detects the language of a code block without one, still escaping its text', () => {
        expect(html).not.toContain('<b>&</b>');
        expect(html.match(/<pre>/g)).toHaveLength(2);
    });

    it('renders underline', () => {
        expect(html).toContain('<u>under</u>');
    });
});

describe('richTextSchema', () => {
    it('accepts the document above and rejects an unknown language-less structure', () => {
        expect(richTextSchema.safeParse(doc).success).toBe(true);
        expect(richTextSchema.safeParse({ type: 'doc', content: [{ type: 'marquee' }] }).success).toBe(false);
    });
});
