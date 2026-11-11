<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
</script>

<svelte:head>
    <title>{data.title} — didul.porto</title>
</svelte:head>

<main>
    <a class="back" href="/blogs">← All posts</a>
    <article>
        <header>
            <h1>{data.title}</h1>
            <time datetime={data.createdAt}>{formatDate(data.createdAt)}</time>
        </header>
        <div class="content">{@html data.html}</div>
    </article>
</main>

<style lang="scss">
    @use '../../../lib/styles/layout';
    @use '../../../lib/styles/prose';
    @use '../../../lib/styles/variables';

    main {
        @include layout.page-container;
        max-width: 75ch;
        margin-block: 2rem;
    }

    .back {
        color: variables.$text-muted;
    }

    header {
        margin: 2rem 0;

        h1 {
            margin: 0 0 0.5rem;
            font-size: clamp(2rem, 5vw, 3rem);
        }

        time {
            color: variables.$text-muted;
        }
    }

    .content :global {
        @include prose.body;
    }
</style>
