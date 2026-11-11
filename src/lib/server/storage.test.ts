import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PutObjectCommand } from '@aws-sdk/client-s3';

vi.mock('$app/env/private', () => ({
    S3_ENDPOINT: 'https://s3.test',
    S3_REGION: 'garage',
    S3_BUCKET: 'test-bucket',
    S3_ACCESS_KEY_ID: 'test',
    S3_SECRET_ACCESS_KEY: 'test',
    S3_FORCE_PATH_STYLE: 'true'
}));

const { storage, uploadImage, ImageValidationError } = await import('./storage.ts');

// Magic bytes padded to 12 bytes so the header read has something to look at.
const PNG = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0];
const JPEG = [255, 216, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0];
const WEBP = [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80];

const file = (bytes: number[], type: string) =>
    new File([new Uint8Array(bytes)], 'image', { type });

describe('uploadImage', () => {
    // Never talk to Garage: replace the real network call.
    const send = vi.spyOn(storage, 'send');

    beforeEach(() => {
        send.mockReset();
        send.mockResolvedValue({} as never);
    });

    it.each([
        ['image/png', PNG],
        ['image/jpeg', JPEG],
        ['image/webp', WEBP]
    ])('uploads a valid %s and returns a UUID key', async (type, bytes) => {
        const key = await uploadImage(file(bytes, type));

        expect(key).toMatch(/^[0-9a-f-]{36}$/);
        expect(send).toHaveBeenCalledOnce();

        const command = send.mock.calls[0][0] as PutObjectCommand;
        expect(command).toBeInstanceOf(PutObjectCommand);
        expect(command.input).toMatchObject({ Bucket: 'test-bucket', Key: key, ContentType: type });
    });

    it('rejects an empty file with 400', async () => {
        await expect(uploadImage(file([], 'image/png'))).rejects.toMatchObject({
            name: 'ImageValidationError',
            status: 400
        });
    });

    it('rejects a file larger than 5 MB with 413', async () => {
        const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big', { type: 'image/png' });

        await expect(uploadImage(big)).rejects.toMatchObject({ status: 413 });
    });

    it('rejects a MIME type that is not allowed with 415', async () => {
        await expect(uploadImage(file(PNG, 'image/gif'))).rejects.toMatchObject({ status: 415 });
    });

    it('rejects a file whose bytes do not match its MIME type with 415', async () => {
        // Claims to be PNG, but the bytes are JPEG.
        await expect(uploadImage(file(JPEG, 'image/png'))).rejects.toMatchObject({ status: 415 });
    });

    it('rejects random bytes labelled as an image with 415', async () => {
        await expect(uploadImage(file([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'image/webp')))
            .rejects.toBeInstanceOf(ImageValidationError);
    });

    it('never calls storage when validation fails', async () => {
        await uploadImage(file([], 'image/png')).catch(() => {});

        expect(send).not.toHaveBeenCalled();
    });

    it('lets storage errors through as a normal Error, not a validation error', async () => {
        send.mockRejectedValue(new Error('network down'));

        const error = await uploadImage(file(PNG, 'image/png')).catch((e) => e);

        expect(error).toBeInstanceOf(Error);
        expect(error).not.toBeInstanceOf(ImageValidationError);
    });
});
