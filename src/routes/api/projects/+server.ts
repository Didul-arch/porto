import { S3_PUBLIC_BASE_URL } from '$app/env/private';
import type { Project } from '#lib/types/project.ts';
import { deleteImage, ImageValidationError, uploadImage } from '#lib/server/storage.ts';
import { createProjectSchema, deleteProjectSchema } from '#lib/schemas/project.ts';
import { db } from '#lib/server/db.ts';
import type { RequestHandler } from './$types';

type ProjectRow = Omit<Project, 'heroImageUrl'> & { heroImageKey: string | null };

export async function GET() {
    const result = await db.query<ProjectRow>(`
        SELECT
            id, title, description, hero_image_key AS "heroImageKey",
            category, technologies, status,
            repository_uri AS "repositoryUrl",
            created_at, updated_at
        FROM projects
        ORDER BY created_at DESC, id DESC
    `);
    const projects: Project[] = result.rows.map(({ heroImageKey, ...project }) => ({
        ...project,
        heroImageUrl: heroImageKey ? `${S3_PUBLIC_BASE_URL}/${heroImageKey}` : null
    }));

    return Response.json({
        total: result.rows.length,
        projects: projects
    });
}

export const POST: RequestHandler = async ({ request }) => {
    const isMultipart = request.headers.get('content-type')
        ?.split(';')[0].trim().toLowerCase() === 'multipart/form-data';
    let body: unknown;
    let image: File | undefined;

    if (isMultipart) {
        const form = await request.formData().catch(() => null);
        if (!form) {
            return Response.json({ message: 'Form upload tidak valid.' }, { status: 400 });
        }

        const imageFields = form.getAll('image');
        if (imageFields.length !== 1 || !(imageFields[0] instanceof File)) {
            return Response.json({ message: 'Kirim tepat satu file pada field image.' }, { status: 400 });
        }
        image = imageFields[0];
        body = {
            title: form.get('title'),
            description: form.get('description'),
            category: form.get('category'),
            technologies: form.getAll('technologies'),
            status: form.get('status'),
            repositoryUrl: form.get('repositoryUrl') || null
        };
    } else {
        body = await request.json().catch(() => null);
    }

    const schema = isMultipart ? createProjectSchema.omit({ heroImageKey: true }) : createProjectSchema;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            {
                message: 'Data project tidak valid.',
                errors: parsed.error.issues
            },
            { status: 400 }
        );
    }

    const project = parsed.data;
    let imageKey: string | undefined;

    if (image) {
        try {
            imageKey = await uploadImage(image);
        } catch (error) {
            if (error instanceof ImageValidationError) {
                return Response.json({ message: error.message }, { status: error.status });
            }
            console.error('Upload gambar project gagal.', error);
            return Response.json({ message: 'Gagal mengunggah gambar ke storage.' }, { status: 502 });
        }
    }

    try {
        const result = await db.query<ProjectRow>(
            `INSERT INTO projects (
                title, description, category, technologies,
                status, repository_uri, hero_image_key
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, title, description, category, technologies,
                status, repository_uri AS "repositoryUrl", hero_image_key AS "heroImageKey"`,
            [
                project.title,
                project.description,
                project.category,
                project.technologies,
                project.status ?? null,
                project.repositoryUrl ?? null,
                imageKey ?? ('heroImageKey' in project ? project.heroImageKey : null) ?? null
            ]
        );

        return Response.json(result.rows[0], { status: 201 });
    } catch (error) {
        if (imageKey) {
            try {
                await deleteImage(imageKey);
            } catch (cleanupError) {
                console.error('Gagal membersihkan gambar setelah penyimpanan project gagal.', {
                    imageKey,
                    error: cleanupError
                });
            }
        }
        console.error('Penyimpanan project gagal.', error);
        return Response.json({ message: 'Gagal menyimpan project.' }, { status: 500 });
    }
};

export const DELETE = async ({ request }) => {
  const body:unknown = await request.json().catch(() => null);
  const parsed = deleteProjectSchema.safeParse(body);

  if (!parsed.success) {
      return Response.json(
          {
              message: 'Data project tidak valid.',
              errors: parsed.error.issues
          },
          { status: 400 }
      );
  }

  const result = await db.query(
    `DELETE FROM projects WHERE id=$1`, [parsed.data.id]
  )
  if (result.rowCount === 0) {
      return Response.json(
          { message: 'Project tidak ditemukan.' },
          { status: 404 }
      );
  }
  return new Response(null, { status: 204 });
}
