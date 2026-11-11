<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    let message = $state('');

    async function remove(resource: 'projects' | 'blogs', id: string, title: string) {
        if (!confirm(`Delete "${title}"?`)) return;

        const res = await fetch(`/api/${resource}`, {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (res.ok) {
            message = '';
            await invalidateAll();
            return;
        }
        const body = await res.json().catch(() => null);
        message = body?.message ?? 'Failed to delete.';
    }
</script>

<svelte:head>
    <title>dudul — admin</title>
</svelte:head>

<main>
    <h1>dudul</h1>

    {#if message}
        <p class="message" role="alert">{message}</p>
    {/if}

    {#snippet section(name: 'projects' | 'blogs', items: { id: string; slug: string; title: string }[])}
        <section>
            <header>
                <h2>{name}</h2>
                <a class="button" href={`/dudul/${name}/new`}>+ New</a>
            </header>

            <ul>
                {#each items as item (item.id)}
                    <li>
                        <a href={`/${name}/${item.slug}`}>{item.title}</a>
                        <code>/{item.slug}</code>
                        <span class="actions">
                            <a class="button" href={`/dudul/${name}/${item.slug}`}>Edit</a>
                            <button type="button" class="danger" onclick={() => remove(name, item.id, item.title)}>Delete</button>
                        </span>
                    </li>
                {:else}
                    <li class="empty">Nothing here yet.</li>
                {/each}
            </ul>
        </section>
    {/snippet}

    {@render section('projects', data.projects)}
    {@render section('blogs', data.blogs)}
</main>

<style lang="scss">
    @use '../../lib/styles/layout';
    @use '../../lib/styles/buttons';
    @use '../../lib/styles/variables';

    main {
        @include layout.page-container;
        margin-block: 2rem;
        display: grid;
        gap: 2rem;
    }

    h1 {
        margin: 0;
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;

        h2 {
            margin: 0;
            text-transform: capitalize;
        }
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.5rem;
    }

    li {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem 1rem;
        padding: 0.75rem 1rem;
        border: 2px solid variables.$card-border;

        > a {
            color: inherit;
            font-weight: 600;
        }

        code {
            color: variables.$text-muted;
        }
    }

    .empty {
        color: variables.$text-muted;
    }

    .actions {
        display: flex;
        gap: 0.5rem;
        margin-left: auto;
    }

    .button {
        @include buttons.base(false);
        padding: 0.25rem 0.5rem;
        text-decoration: none;
    }

    .danger {
        @include buttons.danger;
        padding: 0.25rem 0.5rem;
    }

    .message {
        margin: 0;
        color: variables.$danger;
    }
</style>
