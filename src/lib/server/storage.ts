import { DeleteObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_HEADER_BYTES,
  IMAGE_SIGNATURES,
  MAX_IMAGE_SIZE_BYTES
} from '#lib/const/storage.ts';

import {
    S3_ENDPOINT,
    S3_REGION,
    S3_BUCKET,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_FORCE_PATH_STYLE
} from '$app/env/private';

export const storage = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,

    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY
    },

    forcePathStyle: S3_FORCE_PATH_STYLE === 'true'
});

export const storageBucket = S3_BUCKET;

export class ImageValidationError extends Error {
  constructor(message: string, public status: 400 | 413 | 415 = 400) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

export async function deleteImage(objectKey: string) {
  await storage.send(new DeleteObjectCommand({
    Bucket: storageBucket,
    Key: objectKey
  }));
}

export async function checkStorage() {
  const command = new HeadBucketCommand({
    Bucket: storageBucket
  });

  await storage.send(command);
  return 'Bucket accessible';
}

export async function uploadImage(file: File) {
  if (!(file instanceof File)) {
    throw new ImageValidationError('Input must be a file.');
  }

  if (file.size === 0) {
    throw new ImageValidationError('Image file must not be empty.');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ImageValidationError('Image must be 5 MB or smaller.', 413);
  }
  
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    throw new ImageValidationError('Image must be JPEG, PNG, or WebP.', 415);
  }

  const header = new Uint8Array(
    await file.slice(0, IMAGE_HEADER_BYTES).arrayBuffer()
  );

  const detectedMimeType = Object.entries(IMAGE_SIGNATURES).find(
    ([, signatures]) => signatures.every(
      ({ offset, bytes }) => bytes.every(
        (byte, index) => header[offset + index] === byte
      )
    )
  )?.[0];

  if (!detectedMimeType || detectedMimeType !== file.type) {
    throw new ImageValidationError('Image signature does not match the file MIME type.', 415);
  }

  const objectKey = crypto.randomUUID();

  const buffer = await file.arrayBuffer();
  const rawFile = new Uint8Array(buffer);

  const command = new PutObjectCommand({
    Bucket: storageBucket,
    Key: objectKey,
    Body: rawFile,
    ContentType: detectedMimeType
  })
  await storage.send(command);

  return objectKey;
}
