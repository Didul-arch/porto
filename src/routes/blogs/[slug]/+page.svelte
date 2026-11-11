<script lang="ts">
    import RichTextBody from '#lib/components/RichTextBody.svelte';
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
        <RichTextBody html={data.html} headings={data.headings} mobileSans />
    </article>
</main>

<style lang="scss">
    @use '../../../lib/styles/layout';
    @use '../../../lib/styles/variables';

    main {
        @include layout.page-container;
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
    @media (max-width: 767px) {
        main {
            margin-block: 1rem 3rem;
        }

        .back {
            display: inline-flex;
            align-items: center;
            min-height: 44px;
            font-size: 0.875rem;
        }

        header {
            margin-block: 1rem 1.5rem;
            overflow-wrap: anywhere;

            h1 {
                font-family: variables.$font-body;
                font-size: clamp(1.75rem, 6vw, 2.25rem);
                line-height: 1.2;
                text-wrap: balance;
                margin-bottom: 0.75rem;
            }

            time {
                font-size: 0.875rem;
                line-height: 1.5;
            }
        }
    }
</style>
