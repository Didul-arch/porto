<script lang="ts">
    import RichTextBody from '#lib/components/RichTextBody.svelte';
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

    <div class="body">
        <RichTextBody html={data.html} headings={data.headings} />
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
        font-size: clamp(2.25rem, 10vw, 6.5rem);
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
        max-width: 80ch;
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
    @media (max-width: 767px) {
        main {
            margin-block: 1rem 3rem;
        }

        .back {
            display: inline-flex;
            align-items: center;
            min-height: 44px;
        }

        .hero {
            margin-top: 1rem;
        }

        .metadata {
            font-size: 0.8125rem;
            line-height: 1.5;
        }

        h1 {
            font-size: clamp(2rem, 8vw, 3rem);
            line-height: 1.1;
            letter-spacing: -0.025em;
            margin-bottom: 1rem;

            .outline {
                -webkit-text-stroke-width: 1px;
            }
        }

        .description {
            font-family: variables.$font-mono;
            text-align: justify;
            font-size: 1.125rem;
            line-height: 1.65;
            overflow-wrap: anywhere;
        }

        .facts {
            grid-template-columns: minmax(0, 1fr);
            gap: 1rem;
            margin-top: 1.5rem;
            font-size: 0.875rem;
            line-height: 1.6;
            overflow-wrap: anywhere;

            dt {
                font-size: 0.75rem;
            }

            .links {
                flex-wrap: wrap;
                gap: 0.5rem 1rem;

                a {
                    display: inline-flex;
                    align-items: center;
                    min-height: 44px;
                }
            }
        }

        .hero-image {
            margin-top: 1.5rem;

            img {
                aspect-ratio: 4 / 3;
            }
        }

        .body {
            margin-top: 2rem;
        }

        .pager {
            grid-template-columns: minmax(0, 1fr);
            margin-top: 2.5rem;
            padding-top: 1.5rem;
            overflow-wrap: anywhere;
            line-height: 1.5;

            small {
                font-size: 0.75rem;
            }
        }
    }
</style>
