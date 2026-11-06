import pg from 'pg';

// PGHOST, PGPORT, PGDATABASE, PGUSER, dan PGPASSWORD disediakan Compose.
export const db = new pg.Pool({
    connectionTimeoutMillis: 5000
});
