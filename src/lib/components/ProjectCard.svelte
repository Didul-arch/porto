<script lang="ts">
    import type { Project } from '#lib/types/project.ts';

    let { project }: { project: Project } = $props();
</script>

<!-- Tes follow mode Zed. -->
<article class="project-card">
    <div class="card-content">
    <div class="metadata">
        <span class="category">[{project.category}]</span>
        {#if project.status}
            <span aria-hidden="true">•</span>
            <span>{project.status}</span>
        {/if}
    </div>

    <h2><a href={`/projects/${project.slug}`}>{project.title}</a></h2>
    <p class="description">{project.description}</p>

    <div class="stack">
        <span class="stack-label">Stack:</span>
        <ul aria-label="Technology stack">
            {#each project.technologies as technology}
                <li>{technology}</li>
            {/each}
        </ul>
    </div>


    <footer>
        <a href={`/projects/${project.slug}`}>Read more <span aria-hidden="true">→</span></a>

        {#if project.repositoryUrl}
            <a href={project.repositoryUrl} target="_blank" rel="noreferrer">
                GitHub <span aria-hidden="true">↗</span>
                <span class="sr-only"> for {project.title} (opens in a new tab)</span>
            </a>
        {/if}
    </footer>
    </div>

    {#if project.heroImageUrl}
        <div class="card-image">
            <img src={project.heroImageUrl} alt={project.title} loading="lazy" />
        </div>
    {/if}
</article>

<style lang="scss">
    @use '../styles/variables';

    .project-card {
        display: flex;
        align-items: flex-start;
        gap: clamp(1rem, 3vw, 2rem);
        padding: clamp(1.25rem, 3vw, 2rem);
        border: 2px solid variables.$card-border;
        background: variables.$surface;
        color: variables.$text;
        box-shadow: 0 8px 18px -12px rgb(29 98 133 / 35%);
        overflow-wrap: anywhere;
    }

    .card-content {
        flex: 1;
        min-width: 0;
    }

    .card-image {
        flex: 0 0 25%;
        min-width: 0;

        img {
            display: block;
            width: 100%;
            aspect-ratio: 4 / 3;
            object-fit: cover;
            border: 1px solid variables.$card-border;
        }
    }

    @media (max-width: 600px) {
        .project-card {
            flex-direction: column;
        }

        .card-image {
            width: 100%;
            flex-basis: auto;
        }
    }

    .metadata {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        color: variables.$text-muted;
        font-size: 0.75rem;
        line-height: 1.6;

        .category {
            color: variables.$text;
            font-weight: 600;
            text-transform: uppercase;
        }
    }

    h2 {
        margin: 0.75rem 0;
        font-size: clamp(1.5rem, 3.5vw, 2.25rem);
        line-height: 1.2;
        letter-spacing: -0.04em;

        a {
            color: inherit;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .description {
        max-width: 85ch;
        margin: 0;
        color: variables.$text-secondary;
        font-size: 0.875rem;
        line-height: 1.8;
    }

    .stack {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1.25rem;
        font-size: 0.75rem;
    }

    .stack-label {
        color: variables.$text-muted;
        text-transform: uppercase;
    }

    ul {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    li {
        border: 1px solid variables.$card-border;
        padding: 0.125rem 0.5rem;
        background: variables.$surface-subtle;
    }

    footer {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        column-gap: 1.5rem;
        margin-top: 1.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid variables.$card-border;
        font-size: 0.75rem;
    }

    footer a {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 44px;
        color: inherit;
        cursor: pointer;
        text-decoration: none;

        &:hover {
            color: variables.$purple;
            text-decoration: underline;
            text-underline-offset: 4px;
        }

        &:focus-visible {
            outline: 2px solid variables.$purple;
            outline-offset: 4px;
        }
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
    }
</style>
