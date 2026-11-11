<script lang="ts">
    import BlogForm from '#lib/components/admin/BlogForm.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<main>
    <a href="/dudul">← Dashboard</a>
    <h1>Edit blog</h1>
    {#key data.blog.id}
        <BlogForm blog={data.blog} />
    {/key}
</main>

<style lang="scss">
    @use '../../../../lib/styles/layout';

    main {
        @include layout.page-container;
        margin-block: 2rem;
    }
</style>
