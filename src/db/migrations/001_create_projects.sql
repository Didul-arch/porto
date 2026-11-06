CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL,
    technologies VARCHAR(30)[] NOT NULL,
    status VARCHAR(16),
    repository_uri VARCHAR(2048),
    images VARCHAR(2048)[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

