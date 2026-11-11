<script lang="ts">
    import { goto } from '$app/navigation';
    import RichTextEditor from '#lib/components/RichTextEditor.svelte';
    import { EMPTY_DOC, slugify, type RichText } from '#lib/richtext.ts';
    import type { ProjectDetail } from '#lib/types/project.ts';

    // Without `project` the form creates; with it, the form edits that project.
    let { project }: { project?: ProjectDetail } = $props();

    const categories = ['Personal', 'Uni Project'];

    // The form owns its draft; the page re-keys this component when the project changes.
    // svelte-ignore state_referenced_locally
    const initial = project;
    let title = $state(initial?.title ?? '');
    let slug = $state(initial?.slug ?? '');
    let slugEdited = $state(Boolean(initial));
    let description = $state(initial?.description ?? '');
    let category = $state(initial?.category ?? categories[0]);
    let technologies = $state(initial?.technologies.join(', ') ?? '');
    let status = $state(initial?.status ?? '');
    let role = $state(initial?.role ?? '');
    let repositoryUrl = $state(initial?.repositoryUrl ?? '');
    let demoUrl = $state(initial?.demoUrl ?? '');
    let content = $state<RichText>(initial?.content ?? EMPTY_DOC);
    let imageInput: HTMLInputElement;
    let message = $state('');
    let saving = $state(false);

    $effect(() => {
        if (!slugEdited) slug = slugify(title);
    });

    async function save(event: SubmitEvent) {
        event.preventDefault();
        saving = true;
        message = '';

        // Multipart so the optional hero image rides along with the metadata.
        const form = new FormData();
        form.set('title', title);
        form.set('slug', slug);
        form.set('description', description);
        form.set('category', category);
        form.set('status', status);
        form.set('role', role);
        form.set('repositoryUrl', repositoryUrl);
        form.set('demoUrl', demoUrl);
        form.set('content', JSON.stringify(content));
        for (const tech of technologies.split(',').map((t) => t.trim()).filter(Boolean)) {
            form.append('technologies', tech);
        }
        const image = imageInput.files?.[0];
        if (image) form.set('image', image);

        const res = await fetch(project ? `/api/projects/${project.slug}` : '/api/projects', {
            method: project ? 'PUT' : 'POST',
            body: form
        });

        if (res.ok) {
            await goto('/dudul');
            return;
        }

        const body = await res.json().catch(() => null);
        message = body?.message ?? 'Failed to save.';
        saving = false;
    }
</script>

<form onsubmit={save}>
    <label>
        Title
        <input type="text" bind:value={title} required maxlength="30" />
    </label>

    <label>
        Slug
        <input
            type="text"
            bind:value={slug}
            oninput={() => (slugEdited = true)}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, digits, and hyphens only."
        />
    </label>

    <label>
        Short description
        <textarea bind:value={description} required></textarea>
    </label>

    <div class="row">
        <label>
            Category
            <select bind:value={category}>
                {#each categories as option (option)}
                    <option value={option}>{option}</option>
                {/each}
            </select>
        </label>

        <label>
            Status
            <input type="text" bind:value={status} maxlength="16" placeholder="e.g. Ongoing" />
        </label>

        <label>
            Role
            <input type="text" bind:value={role} maxlength="60" placeholder="e.g. Fullstack" />
        </label>
    </div>

    <label>
        Technologies (comma separated)
        <input type="text" bind:value={technologies} placeholder="SvelteKit, Go, PostgreSQL" />
    </label>

    <div class="row">
        <label>
            Repository URL
            <input type="url" bind:value={repositoryUrl} placeholder="https://" />
        </label>

        <label>
            Demo URL
            <input type="url" bind:value={demoUrl} placeholder="https://" />
        </label>
    </div>

    <label>
        Hero image {project?.heroImageUrl ? '(leave empty to keep the current one)' : ''}
        <input type="file" accept="image/jpeg,image/png,image/webp" bind:this={imageInput} />
    </label>

    {#if project?.heroImageUrl}
        <img class="preview" src={project.heroImageUrl} alt="Current hero" />
    {/if}

    <RichTextEditor bind:content />

    {#if message}
        <p class="message" role="alert">{message}</p>
    {/if}

    <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
</form>

<style lang="scss">
    @use '../../styles/forms';
    @use '../../styles/buttons';
    @use '../../styles/variables';

    form {
        @include forms.layout;
    }

    input,
    select,
    textarea {
        @include forms.control;
    }

    textarea {
        min-height: 6rem;
        resize: vertical;
    }

    .row {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    }

    .preview {
        max-width: 16rem;
        border: 1px solid variables.$card-border;
    }

    button {
        @include buttons.base(false);
        justify-self: start;
    }
</style>
