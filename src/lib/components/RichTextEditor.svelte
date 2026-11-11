<script lang="ts">
    import { onMount } from 'svelte';
    import { Editor } from '@tiptap/core';
    import { extensions, LANGUAGES, type RichText } from '#lib/richtext.ts';

    let { content = $bindable() }: { content: RichText } = $props();

    let element: HTMLDivElement;
    let editor: Editor | undefined;
    // Bumped on every transaction so the toolbar's active states are recomputed.
    let tick = $state(0);

    onMount(() => {
        editor = new Editor({
            element,
            extensions,
            content,
            onTransaction: () => tick++,
            onUpdate: ({ editor }) => (content = editor.getJSON())
        });
        return () => editor?.destroy();
    });

    type Tool = { label: string; title: string; name: string; attrs?: Record<string, unknown>; run: (e: Editor) => boolean };
    const heading = (level: 1 | 2 | 3): Tool => ({
        label: `H${level}`, title: `Heading ${level}`, name: 'heading', attrs: { level },
        run: (e) => e.chain().focus().toggleHeading({ level }).run()
    });
    const groups: Tool[][] = [
        [heading(1), heading(2), heading(3)],
        [
            { label: 'B', title: 'Bold', name: 'bold', run: (e) => e.chain().focus().toggleBold().run() },
            { label: 'I', title: 'Italic', name: 'italic', run: (e) => e.chain().focus().toggleItalic().run() },
            { label: 'U', title: 'Underline', name: 'underline', run: (e) => e.chain().focus().toggleUnderline().run() }
        ],
        [
            { label: '•', title: 'Bullet list', name: 'bulletList', run: (e) => e.chain().focus().toggleBulletList().run() },
            { label: '1.', title: 'Numbered list', name: 'orderedList', run: (e) => e.chain().focus().toggleOrderedList().run() },
            { label: '❝', title: 'Quote', name: 'blockquote', run: (e) => e.chain().focus().toggleBlockquote().run() },
            { label: '</>', title: 'Code block', name: 'codeBlock', run: (e) => e.chain().focus().toggleCodeBlock().run() }
        ]
    ];

    const isActive = (name: string, attrs?: Record<string, unknown>) =>
        tick >= 0 && (editor?.isActive(name, attrs) ?? false);

    const codeLanguage = $derived(
        tick >= 0 && isActive('codeBlock') ? String(editor?.getAttributes('codeBlock').language ?? '') : null
    );
</script>

<div class="editor">
    <div class="toolbar" role="toolbar" aria-label="Text formatting">
        {#each groups as group, index (index)}
            <div class="group">
                {#each group as tool (tool.title)}
                    <button
                        type="button"
                        title={tool.title}
                        aria-label={tool.title}
                        aria-pressed={isActive(tool.name, tool.attrs)}
                        class:selected={isActive(tool.name, tool.attrs)}
                        onclick={() => editor && tool.run(editor)}
                    >{tool.label}</button>
                {/each}
            </div>
        {/each}

        {#if codeLanguage !== null}
            <select
                aria-label="Code language"
                value={codeLanguage}
                onchange={(event) =>
                    editor?.chain().focus().updateAttributes('codeBlock', { language: event.currentTarget.value || null }).run()}
            >
                <option value="">plain text</option>
                {#each LANGUAGES as language (language)}
                    <option value={language}>{language}</option>
                {/each}
            </select>
        {/if}
    </div>

    <div class="content" bind:this={element}></div>
</div>

<style lang="scss">
    @use '../styles/buttons';
    @use '../styles/forms';
    @use '../styles/prose';
    @use '../styles/variables';

    .editor {
        border: 2px solid variables.$ink;
        background: variables.$surface;
    }

    .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-bottom: 2px solid variables.$card-border;
    }

    .group {
        display: flex;
        gap: 4px;
    }

    button {
        @include buttons.base;
        min-width: 2.5rem;
        padding: 0.25rem 0.5rem;
    }

    select {
        @include forms.control;
        padding: 0.25rem 0.5rem;
    }

    .content {
        min-height: 16rem;
        padding: 1rem;

        :global {
            @include prose.body;

            .tiptap {
                outline: none;
            }
        }
    }
</style>
