import { building } from '$app/env';
import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

// SvelteKit menjalankan app saat build untuk analisis route. Di Docker build
// belum ada .env, jadi nilai baru diwajibkan saat app benar-benar jalan.
const required = { schema: building ? z.string().optional() : z.string() };

export const variables = defineEnvVars({
    S3_PUBLIC_BASE_URL: required,
    S3_ENDPOINT: required,
    S3_REGION: required,
    S3_BUCKET: required,
    S3_ACCESS_KEY_ID: required,
    S3_SECRET_ACCESS_KEY: required,
    S3_FORCE_PATH_STYLE: required
});
