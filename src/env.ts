import { building } from '$app/env';
import { defineEnvVars } from '@sveltejs/kit/env';

const required = {
    schema: (value: string | undefined) => {
        if (value === undefined && !building) throw new Error('Value is missing.');
        return value as string;
    }
};

export const variables = defineEnvVars({
    S3_PUBLIC_BASE_URL: required,
    S3_ENDPOINT: required,
    S3_REGION: required,
    S3_BUCKET: required,
    S3_ACCESS_KEY_ID: required,
    S3_SECRET_ACCESS_KEY: required,
    S3_FORCE_PATH_STYLE: required
});
