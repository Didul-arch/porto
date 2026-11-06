import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
    S3_PUBLIC_BASE_URL: {},
    S3_ENDPOINT: {},
    S3_REGION: {},
    S3_BUCKET: {},
    S3_ACCESS_KEY_ID: {},
    S3_SECRET_ACCESS_KEY: {},
    S3_FORCE_PATH_STYLE: {}
});
