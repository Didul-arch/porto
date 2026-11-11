<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    const project = $derived(data.project);

    // First word solid, the rest outlined — like the reference design.
    const [firstWord, ...restWords] = $derived(project.title.split(' '));
</script>

<svelte:head>
    <title>{project.title} — didul.porto</title>
    <meta name="description" content={project.description} />
</svelte:head>

<main>
    <a class="back" href="/projects">← All projects</a>

    <header class="hero">
        <p class="metadata">
            <span class="category">[{project.category}]</span>
            {#if project.status}
                <span aria-hidden="true">•</span>
                <span>{project.status}</span>
            {/if}
        </p>

        <h1>
            <span class="solid">{firstWord}</span>
            {#if restWords.length}
                <span class="outline">{restWords.join(' ')}.</span>
            {/if}
        </h1>

        <p class="description">{project.description}</p>

        <dl class="facts">
            {#if project.role}
                <div>
                    <dt>Role</dt>
                    <dd>{project.role}</dd>
                </div>
            {/if}
            <div>
                <dt>Stack</dt>
                <dd>{project.technologies.join(' • ')}</dd>
            </div>
            {#if project.status}
                <div>
                    <dt>Status</dt>
                    <dd>{project.status}</dd>
                </div>
            {/if}
            {#if project.repositoryUrl || project.demoUrl}
                <div>
                    <dt>Links</dt>
                    <dd class="links">
                        {#if project.repositoryUrl}
                            <a href={project.repositoryUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
                        {/if}
                        {#if project.demoUrl}
                            <a href={project.demoUrl} target="_blank" rel="noreferrer">Demo ↗</a>
                        {/if}
                    </dd>
                </div>
            {/if}
        </dl>
    </header>

    {#if project.heroImageUrl}
        <figure class="hero-image">
            <img src={project.heroImageUrl} alt={project.title} />
        </figure>
    {/if}

    <div class="body" class:with-toc={data.headings.length > 0}>
        {#if data.headings.length}
            <nav class="toc" aria-label="On this page">
                <p>On this page</p>
                <ol>
                    {#each data.headings as heading (heading.id)}
                        <li class:nested={heading.level === 3}><a href={`#${heading.id}`}>{heading.text}</a></li>
                    {/each}
                </ol>
            </nav>
        {/if}

        <article class="content">{@html data.html}</article>
    </div>

    <nav class="pager" aria-label="Project navigation">
        {#if data.previous}
            <a href={`/projects/${data.previous.slug}`}>
                <small>← Previous</small>
                <strong>{data.previous.title}</strong>
            </a>
        {:else}
            <a href="/projects">
                <small>← Back</small>
                <strong>All projects</strong>
            </a>
        {/if}
        {#if data.next}
            <a class="next" href={`/projects/${data.next.slug}`}>
                <small>Next →</small>
                <strong>{data.next.title}</strong>
            </a>
        {/if}
    </nav>
</main>

<style lang="scss">
    @use '../../../lib/styles/layout';
    @use '../../../lib/styles/prose';
    @use '../../../lib/styles/variables';

    main {
        @include layout.page-container;
        margin-block: 2rem 4rem;
        color: variables.$text;
    }

    .back {
        font-size: 0.875rem;
        color: variables.$text-muted;
    }

    .hero {
        margin-top: 2rem;
    }

    .metadata {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 0;
        font-size: 0.75rem;
        color: variables.$text-muted;

        .category {
            color: variables.$text;
            font-weight: 600;
            text-transform: uppercase;
        }
    }

    h1 {
        margin: 0.5rem 0 1.5rem;
        font-size: clamp(3rem, 10vw, 6.5rem);
        font-weight: 700;
        line-height: 0.95;
        letter-spacing: -0.05em;
        overflow-wrap: anywhere;

        .solid,
        .outline {
            display: block;
        }

        .outline {
            color: variables.$surface;
            -webkit-text-stroke: 2px variables.$ink;
            paint-order: stroke fill;
        }
    }

    .description {
        max-width: 60ch;
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.8;
        color: variables.$text-secondary;
    }

    .facts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
        gap: 1rem 2rem;
        margin: 2rem 0 0;
        padding-block: 1.25rem;
        border-top: 2px solid variables.$ink;
        border-bottom: 1px solid variables.$card-border;
        font-size: 0.8rem;

        dt {
            font-size: 0.65rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: variables.$text-muted;
        }

        dd {
            margin: 0.25rem 0 0;
        }

        .links {
            display: flex;
            gap: 1rem;

            a {
                color: inherit;
            }
        }
    }

    .hero-image {
        margin: 2rem 0 0;
        border: 2px solid variables.$card-border;
        background: variables.$surface-subtle;

        img {
            display: block;
            width: 100%;
            aspect-ratio: 21 / 9;
            object-fit: cover;
        }
    }

    .body {
        margin-top: 3rem;

        &.with-toc {
            @media (min-width: 900px) {
                display: grid;
                grid-template-columns: 12rem minmax(0, 70ch);
                gap: 3rem;
            }
        }
    }

    .toc {
        align-self: start;
        font-size: 0.75rem;

        @media (min-width: 900px) {
            position: sticky;
            top: 2rem;
        }

        p {
            margin: 0 0 0.5rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: variables.$text-muted;
        }

        ol {
            margin: 0;
            padding: 0 0 0 0.75rem;
            list-style: none;
            border-left: 1px solid variables.$card-border;
            display: grid;
            gap: 0.4rem;
        }

        .nested {
            padding-left: 0.75rem;
        }

        a {
            color: variables.$text-secondary;
            text-decoration: none;

            &:hover {
                color: variables.$text;
                text-decoration: underline;
            }
        }
    }

    .content {
        max-width: 70ch;
        font-size: 0.95rem;

        :global {
            @include prose.body;
        }
    }

    .pager {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
        gap: 1rem;
        margin-top: 4rem;
        padding-top: 2rem;
        border-top: 2px solid variables.$ink;

        a {
            display: grid;
            gap: 0.25rem;
            padding: 1rem;
            border: 2px solid variables.$card-border;
            color: inherit;
            text-decoration: none;

            &:hover {
                border-color: variables.$ink;
            }
        }

        .next {
            text-align: right;
        }

        small {
            font-size: 0.65rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: variables.$text-muted;
        }
    }
</style>
