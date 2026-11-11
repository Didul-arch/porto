<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
</script>

<main>
    <div class="judul">
        <h1>Blogs!</h1>
        <p>Notes, write-ups, and things I learned the hard way.</p>
    </div>

    <ul class="blog-list">
        {#each data.blogs as blog (blog.id)}
            <li>
                <a href={`/blogs/${blog.slug}`}>{blog.title}</a>
                <time datetime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
            </li>
        {:else}
            <li>No posts yet.</li>
        {/each}
    </ul>
</main>

<style lang="scss">
    @use '../../lib/styles/layout';
    @use '../../lib/styles/variables';

    main {
        @include layout.page-container;
        margin-block: 2rem;
    }

    .judul {
        max-width: 75ch;
        margin: 4rem 0;

        h1, p {
            margin: 4px 0;
        }

        h1 {
            font-size: clamp(2.5rem, 6vw, 4rem);
        }

        p {
            font-size: 1.3rem;
        }
    }

    .blog-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1rem;

        li {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 0.5rem 1rem;
            padding: 1rem;
            border: 2px solid variables.$card-border;
        }

        a {
            color: inherit;
            font-weight: 600;
        }

        time {
            color: variables.$text-muted;
        }
    }
    @media (max-width: 767px) {
        main {
            margin-block: 1.5rem 2rem;
        }

        .judul {
            margin: 1.5rem 0 2rem;

            h1 {
                font-size: 2.25rem;
                line-height: 1.2;
                margin-bottom: 0.75rem;
            }

            p {
                text-align: justify;
                font-family: variables.$font-body;
                font-size: 1.0625rem;
                line-height: 1.65;
            }
        }

        .blog-list {
            min-width: 0;
            overflow-wrap: anywhere;

            li {
                min-width: 0;
                flex-direction: column;
                align-items: flex-start;
                font-family: variables.$font-body;
                font-size: 1.0625rem;
                line-height: 1.65;
            }

            a {
                display: flex;
                align-items: center;
                min-height: 44px;
                width: 100%;
                min-width: 0;
                font-size: 1.25rem;
                line-height: 1.4;
            }

            time {
                font-family: variables.$font-mono;
                font-size: 0.875rem;
                line-height: 1.6;
            }
        }
    }
</style>
