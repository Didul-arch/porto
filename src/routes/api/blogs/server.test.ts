import { beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.fn();
vi.mock('#lib/server/db.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('#lib/server/db.ts')>()),
    db: { query }
}));

const { GET, POST, DELETE } = await import('./+server.ts');
const { GET: GET_BY_SLUG, PUT } = await import('./[slug]/+server.ts');

const call = <T extends (event: never) => unknown>(handler: T, event: object) =>
    handler(event as never) as ReturnType<T>;

const json = (method: string, body: unknown) =>
    new Request('http://test/api/blogs', {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
    });

const doc = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]
};

const validBlog = { slug: 'first-post', title: 'First post', content: doc };

beforeEach(() => {
    query.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('GET /api/blogs', () => {
    it('lists blogs without their content', async () => {
        query.mockResolvedValue({ rows: [{ id: '1', slug: 'a', title: 'A', createdAt: 'now' }] });

        const body = await (await call(GET, {})).json();

        expect(body.total).toBe(1);
        expect(body.blogs[0]).not.toHaveProperty('content');
    });
});

describe('POST /api/blogs', () => {
    it('stores a valid blog and returns 201', async () => {
        query.mockResolvedValue({ rows: [{ id: '1', ...validBlog }] });

        const res = await call(POST, { request: json('POST', validBlog) });

        expect(res.status).toBe(201);
        expect(query.mock.calls[0][1]).toEqual(['first-post', 'First post', doc]);
    });

    it.each([
        ['missing content', { ...validBlog, content: undefined }],
        ['content that is not a doc', { ...validBlog, content: { type: 'paragraph' } }],
        ['content with an unknown node', { ...validBlog, content: { type: 'doc', content: [{ type: 'marquee' }] } }],
        ['text directly inside doc', { ...validBlog, content: { type: 'doc', content: [{ type: 'text', text: 'x' }] } }],
        ['bad slug', { ...validBlog, slug: 'First Post' }],
        ['empty title', { ...validBlog, title: ' ' }]
    ])('returns 400 for %s', async (_, body) => {
        const res = await call(POST, { request: json('POST', body) });

        expect(res.status).toBe(400);
        expect(query).not.toHaveBeenCalled();
    });

    it('returns 409 when the slug is already taken', async () => {
        query.mockRejectedValue({ code: '23505' });

        const res = await call(POST, { request: json('POST', validBlog) });

        expect(res.status).toBe(409);
    });

    it('returns 500 for other database errors', async () => {
        query.mockRejectedValue(new Error('db down'));

        const res = await call(POST, { request: json('POST', validBlog) });

        expect(res.status).toBe(500);
    });
});

describe('GET /api/blogs/[slug]', () => {
    it('returns the blog with its content', async () => {
        query.mockResolvedValue({ rows: [{ id: '1', ...validBlog }] });

        const body = await (await call(GET_BY_SLUG, { params: { slug: 'first-post' } })).json();

        expect(body.content).toEqual(doc);
        expect(query).toHaveBeenCalledWith(expect.any(String), ['first-post']);
    });

    it('returns 404 for an unknown slug', async () => {
        query.mockResolvedValue({ rows: [] });

        expect((await call(GET_BY_SLUG, { params: { slug: 'nope' } })).status).toBe(404);
    });

    it('returns 404 for a malformed slug without querying', async () => {
        expect((await call(GET_BY_SLUG, { params: { slug: 'Not Valid' } })).status).toBe(404);
        expect(query).not.toHaveBeenCalled();
    });
});

describe('PUT /api/blogs/[slug]', () => {
    it('updates by the current slug and returns the row', async () => {
        query.mockResolvedValue({ rows: [{ id: '1', ...validBlog, slug: 'renamed' }] });

        const res = await call(PUT, { params: { slug: 'first-post' }, request: json('PUT', { ...validBlog, slug: 'renamed' }) });

        expect(res.status).toBe(200);
        expect(query.mock.calls[0][1]).toEqual(['renamed', 'First post', doc, 'first-post']);
    });

    it('returns 404 when nothing matched', async () => {
        query.mockResolvedValue({ rows: [] });

        expect((await call(PUT, { params: { slug: 'missing' }, request: json('PUT', validBlog) })).status).toBe(404);
    });

    it('returns 409 when the new slug is taken', async () => {
        query.mockRejectedValue({ code: '23505' });

        expect((await call(PUT, { params: { slug: 'first-post' }, request: json('PUT', validBlog) })).status).toBe(409);
    });

    it('returns 400 for invalid content without querying', async () => {
        const res = await call(PUT, { params: { slug: 'first-post' }, request: json('PUT', { ...validBlog, content: { type: 'nope' } }) });

        expect(res.status).toBe(400);
        expect(query).not.toHaveBeenCalled();
    });
});

describe('DELETE /api/blogs', () => {
    const id = '6f1c2a3b-0000-4000-8000-000000000001';

    it('returns 204 when deleted', async () => {
        query.mockResolvedValue({ rowCount: 1 });

        expect((await call(DELETE, { request: json('DELETE', { id }) })).status).toBe(204);
    });

    it('returns 404 when nothing was deleted', async () => {
        query.mockResolvedValue({ rowCount: 0 });

        expect((await call(DELETE, { request: json('DELETE', { id }) })).status).toBe(404);
    });

    it('returns 400 for a non-UUID id', async () => {
        expect((await call(DELETE, { request: json('DELETE', { id: 'x' }) })).status).toBe(400);
        expect(query).not.toHaveBeenCalled();
    });
});
