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
</style>
