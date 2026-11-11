<script lang="ts">
    import type { Heading } from '#lib/richtext.ts';

    // Rendered rich text plus its "On this page" list.
    // The list is hidden on mobile, stacked on tablet, and beside the text from 900px.
    let { html, headings, mobileSans = false }: {
        html: string;
        headings: Heading[];
        mobileSans?: boolean;
    } = $props();
</script>

<div class="body">
    {#if headings.length}
        <nav class="toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
                {#each headings as heading (heading.id)}
                    <li class:nested={heading.level === 3}><a href={`#${heading.id}`}>{heading.text}</a></li>
                {/each}
            </ol>
        </nav>
    {/if}

    <article class="content" class:mobile-sans={mobileSans}>{@html html}</article>
</div>

<style lang="scss">
    @use '../styles/prose';
    @use '../styles/variables';

    $toc-width: 14rem;
    $toc-gap: 3rem;
    $side-breakpoint: 900px;

    .body {
        display: grid;
        gap: 2rem;

        @media (min-width: $side-breakpoint) {
            grid-template-columns: minmax(0, 1fr) $toc-width;
            gap: $toc-gap;
        }
    }

    .toc {
        align-self: start;
        font-size: 0.75rem;

        @media (min-width: $side-breakpoint) {
            order: 1;
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

    @media (max-width: 767px) {
        .body {
            grid-template-columns: minmax(0, 1fr);
            gap: 1.5rem;
        }

        .content {
            min-width: 0;
            width: 100%;
            box-sizing: border-box;
        }

        .content {
            max-width: 66ch;
            margin-inline: auto;
        }

        .toc {
            display: none;
        }

        .content.mobile-sans {
            font-family: variables.$font-body;
        }
    }

    // Measure: ~72 characters per line; together with the list column this fills the 1100px container.
    .content {
        @media (min-width: 768px) {
            max-width: 72ch;
        }

        :global {
            @include prose.body;
        }
    }
</style>
