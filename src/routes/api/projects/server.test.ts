import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/private', () => ({
    S3_PUBLIC_BASE_URL: 'https://cdn.test',
    S3_ENDPOINT: 'https://s3.test',
    S3_REGION: 'garage',
    S3_BUCKET: 'test-bucket',
    S3_ACCESS_KEY_ID: 'test',
    S3_SECRET_ACCESS_KEY: 'test',
    S3_FORCE_PATH_STYLE: 'true'
}));

const query = vi.fn();
vi.mock('#lib/server/db.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('#lib/server/db.ts')>()),
    db: { query }
}));

// Keep the real ImageValidationError class, fake only the network functions.
const uploadImage = vi.fn();
const deleteImage = vi.fn();
vi.mock('#lib/server/storage.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('#lib/server/storage.ts')>()),
    uploadImage,
    deleteImage
}));

const { GET, POST, DELETE } = await import('./+server.ts');
const { PUT } = await import('./[slug]/+server.ts');
const { ImageValidationError } = await import('#lib/server/storage.ts');

type PostEvent = Parameters<typeof POST>[0];
const post = (request: Request) => POST({ request } as unknown as PostEvent);
const del = (body: unknown) =>
    DELETE({ request: new Request('http://test', { method: 'DELETE', body: JSON.stringify(body) }) } as never);

const validProject = {
    slug: 'mini-twitter-cuit',
    title: 'Mini Twitter',
    description: 'A tiny twitter clone.',
    category: 'Personal',
    technologies: ['Go', 'Svelte']
};

const jsonRequest = (body: unknown) =>
    new Request('http://test/api/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
    });

const multipartRequest = (fields: Record<string, string | string[]>, images: File[]) => {
    const form = new FormData();
    for (const [name, value] of Object.entries(fields)) {
        for (const v of [value].flat()) form.append(name, v);
    }
    for (const image of images) form.append('image', image);
    return new Request('http://test/api/projects', { method: 'POST', body: form });
};

const fieldsFor = (p: typeof validProject) => ({ ...p, technologies: p.technologies });

const png = () => new File([new Uint8Array([137, 80, 78, 71])], 'a.png', { type: 'image/png' });

beforeEach(() => {
    query.mockReset();
    uploadImage.mockReset();
    deleteImage.mockReset();
    deleteImage.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('GET /api/projects', () => {
    it('turns heroImageKey into a public heroImageUrl and hides the key', async () => {
        query.mockResolvedValue({
            rows: [
                { id: '1', slug: 'a', heroImageKey: 'abc-123' },
                { id: '2', slug: 'b', heroImageKey: null }
            ]
        });

        const body = await (await GET({} as never)).json();

        expect(body.total).toBe(2);
        expect(body.projects[0].heroImageUrl).toBe('https://cdn.test/abc-123');
        expect(body.projects[1].heroImageUrl).toBeNull();
        expect(body.projects[0]).not.toHaveProperty('heroImageKey');
    });
});

describe('POST /api/projects (JSON)', () => {
    it('inserts a valid project and returns 201', async () => {
        query.mockResolvedValue({ rows: [{ id: '1', ...validProject }] });

        const res = await post(jsonRequest(validProject));

        expect(res.status).toBe(201);
        expect(query.mock.calls[0][1]).toEqual([
            'mini-twitter-cuit',
            'Mini Twitter',
            'A tiny twitter clone.',
            'Personal',
            ['Go', 'Svelte'],
            null,
            null,
            null,
            null,
            null,
            { type: 'doc', content: [] }
        ]);
    });

    it.each([
        ['missing slug', { ...validProject, slug: undefined }],
        ['uppercase slug', { ...validProject, slug: 'Mini-Twitter' }],
        ['double dash slug', { ...validProject, slug: 'mini--twitter' }],
        ['empty title', { ...validProject, title: '   ' }],
        ['title over 30 chars', { ...validProject, title: 'x'.repeat(31) }],
        ['unknown category', { ...validProject, category: 'Work' }],
        ['non-http repository URL', { ...validProject, repositoryUrl: 'ftp://example.com' }]
    ])('returns 400 for %s', async (_, body) => {
        const res = await post(jsonRequest(body));

        expect(res.status).toBe(400);
        expect(query).not.toHaveBeenCalled();
    });

    it('stores rich text content and rejects an unknown node type', async () => {
        query.mockResolvedValue({ rows: [{ id: '1' }] });
        const content = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hi' }] }] };

        expect((await post(jsonRequest({ ...validProject, content }))).status).toBe(201);
        expect(query.mock.calls[0][1][10]).toEqual(content);

        const bad = { type: 'doc', content: [{ type: 'marquee' }] };
        expect((await post(jsonRequest({ ...validProject, content: bad }))).status).toBe(400);
    });

    it('returns 409 when the slug is already taken', async () => {
        query.mockRejectedValue({ code: '23505' });

        expect((await post(jsonRequest(validProject))).status).toBe(409);
    });

    it('returns 400 for a body that is not JSON', async () => {
        const res = await post(
            new Request('http://test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' })
        );

        expect(res.status).toBe(400);
    });
});

describe('POST /api/projects (multipart)', () => {
    const fields = { ...validProject, technologies: ['Go', 'Svelte'] };

    it('uploads the image and stores the returned key', async () => {
        uploadImage.mockResolvedValue('key-from-storage');
        query.mockResolvedValue({ rows: [{ id: '1' }] });

        const res = await post(multipartRequest(fields, [png()]));

        expect(res.status).toBe(201);
        expect(uploadImage).toHaveBeenCalledOnce();
        const params = query.mock.calls[0][1];
        expect(params[0]).toBe('mini-twitter-cuit');
        expect(params[4]).toEqual(['Go', 'Svelte']);
        expect(params[9]).toBe('key-from-storage');
    });

    it('creates without an image when none is sent', async () => {
        query.mockResolvedValue({ rows: [{ id: '1' }] });

        const res = await post(multipartRequest(fields, []));

        expect(res.status).toBe(201);
        expect(uploadImage).not.toHaveBeenCalled();
        expect(query.mock.calls[0][1][9]).toBeNull();
    });

    it('returns 400 when two images are sent', async () => {
        const res = await post(multipartRequest(fields, [png(), png()]));

        expect(res.status).toBe(400);
        expect(uploadImage).not.toHaveBeenCalled();
    });

    it('does not upload when metadata is invalid', async () => {
        const res = await post(multipartRequest({ ...fields, slug: 'Bad Slug' }, [png()]));

        expect(res.status).toBe(400);
        expect(uploadImage).not.toHaveBeenCalled();
    });

    it('passes the validation status through (e.g. 415)', async () => {
        uploadImage.mockRejectedValue(new ImageValidationError('bad format', 415));

        const res = await post(multipartRequest(fields, [png()]));

        expect(res.status).toBe(415);
        expect(query).not.toHaveBeenCalled();
    });

    it('returns 502 when storage itself fails', async () => {
        uploadImage.mockRejectedValue(new Error('network down'));

        const res = await post(multipartRequest(fields, [png()]));

        expect(res.status).toBe(502);
        expect(query).not.toHaveBeenCalled();
    });

    it('deletes the uploaded image when the INSERT fails', async () => {
        uploadImage.mockResolvedValue('orphan-key');
        query.mockRejectedValue(new Error('db down'));

        const res = await post(multipartRequest(fields, [png()]));

        expect(res.status).toBe(500);
        expect(deleteImage).toHaveBeenCalledWith('orphan-key');
    });

    it('still returns 500 when the cleanup also fails', async () => {
        uploadImage.mockResolvedValue('orphan-key');
        query.mockRejectedValue(new Error('db down'));
        deleteImage.mockRejectedValue(new Error('storage down'));

        const res = await post(multipartRequest(fields, [png()]));

        expect(res.status).toBe(500);
    });
});

describe('PUT /api/projects/[slug]', () => {
    const put = (slug: string, request: Request) => PUT({ params: { slug }, request } as never);

    it('updates the project and keeps the old image when none is sent', async () => {
        query
            .mockResolvedValueOnce({ rowCount: 1, rows: [{ heroImageKey: 'old-key' }] })
            .mockResolvedValueOnce({ rows: [{ id: '1', heroImageKey: 'old-key' }] });

        const res = await put('mini-twitter-cuit', jsonRequest({ ...validProject, title: 'Renamed' }));

        expect(res.status).toBe(200);
        const params = query.mock.calls[1][1];
        expect(params[1]).toBe('Renamed');
        expect(params[9]).toBeNull();
        expect(params[11]).toBe('mini-twitter-cuit');
        expect(deleteImage).not.toHaveBeenCalled();
    });

    it('replaces the image and deletes the old one', async () => {
        uploadImage.mockResolvedValue('new-key');
        query
            .mockResolvedValueOnce({ rowCount: 1, rows: [{ heroImageKey: 'old-key' }] })
            .mockResolvedValueOnce({ rows: [{ id: '1', heroImageKey: 'new-key' }] });

        const res = await put('mini-twitter-cuit', multipartRequest(fieldsFor(validProject), [png()]));

        expect(res.status).toBe(200);
        expect(query.mock.calls[1][1][9]).toBe('new-key');
        expect(deleteImage).toHaveBeenCalledWith('old-key');
    });

    it('returns 404 before uploading when the project does not exist', async () => {
        query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

        const res = await put('missing', multipartRequest(fieldsFor(validProject), [png()]));

        expect(res.status).toBe(404);
        expect(uploadImage).not.toHaveBeenCalled();
    });

    it('returns 409 and removes the new image when the slug is taken', async () => {
        uploadImage.mockResolvedValue('new-key');
        query
            .mockResolvedValueOnce({ rowCount: 1, rows: [{ heroImageKey: null }] })
            .mockRejectedValueOnce({ code: '23505' });

        const res = await put('mini-twitter-cuit', multipartRequest(fieldsFor(validProject), [png()]));

        expect(res.status).toBe(409);
        expect(deleteImage).toHaveBeenCalledWith('new-key');
    });
});

describe('DELETE /api/projects', () => {
    const id = '6f1c2a3b-0000-4000-8000-000000000001';

    it('returns 204 with an empty body when the project is deleted', async () => {
        query.mockResolvedValue({ rowCount: 1, rows: [{ heroImageKey: null }] });

        const res = await del({ id });

        expect(res.status).toBe(204);
        expect(await res.text()).toBe('');
        expect(query).toHaveBeenCalledWith(expect.any(String), [id]);
    });

    it('deletes the hero image from storage along with the project', async () => {
        query.mockResolvedValue({ rowCount: 1, rows: [{ heroImageKey: 'abc' }] });

        expect((await del({ id })).status).toBe(204);
        expect(deleteImage).toHaveBeenCalledWith('abc');
    });

    it('returns 404 when no project has that id', async () => {
        query.mockResolvedValue({ rowCount: 0, rows: [] });

        expect((await del({ id })).status).toBe(404);
    });

    it('returns 400 for an id that is not a UUID', async () => {
        const res = await del({ id: 'not-a-uuid' });

        expect(res.status).toBe(400);
        expect(query).not.toHaveBeenCalled();
    });
});
