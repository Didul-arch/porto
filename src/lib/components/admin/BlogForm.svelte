<script lang="ts">
    import { goto } from '$app/navigation';
    import RichTextEditor from '#lib/components/RichTextEditor.svelte';
    import { EMPTY_DOC, slugify, type RichText } from '#lib/richtext.ts';
    import type { Blog } from '#lib/types/blog.ts';

    // Without `blog` the form creates; with it, the form edits that blog.
    let { blog }: { blog?: Blog } = $props();

    // The form owns its draft; the page re-keys this component when the blog changes.
    // svelte-ignore state_referenced_locally
    const initial = blog;
    let title = $state(initial?.title ?? '');
    let slug = $state(initial?.slug ?? '');
    let slugEdited = $state(Boolean(initial));
    let content = $state<RichText>(initial?.content ?? EMPTY_DOC);
    let message = $state('');
    let saving = $state(false);

    // The slug follows the title until it is edited by hand.
    $effect(() => {
        if (!slugEdited) slug = slugify(title);
    });

    async function save(event: SubmitEvent) {
        event.preventDefault();
        saving = true;
        message = '';

        const res = await fetch(blog ? `/api/blogs/${blog.slug}` : '/api/blogs', {
            method: blog ? 'PUT' : 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ title, slug, content })
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
        <input type="text" bind:value={title} required maxlength="120" />
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

    <RichTextEditor bind:content />

    {#if message}
        <p class="message" role="alert">{message}</p>
    {/if}

    <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
</form>

<style lang="scss">
    @use '../../styles/forms';
    @use '../../styles/buttons';

    form {
        @include forms.layout;
    }

    input {
        @include forms.control;
    }

    button {
        @include buttons.base(false);
        justify-self: start;
    }
</style>
