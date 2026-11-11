import pg from 'pg';

// PGHOST, PGPORT, PGDATABASE, PGUSER, and PGPASSWORD are provided by Compose.
export const db = new pg.Pool({
    connectionTimeoutMillis: 5000
});

// Postgres error code for a UNIQUE violation, e.g. a duplicate slug.
export const isUniqueViolation = (error: unknown) =>
    (error as { code?: string } | null)?.code === '23505';
