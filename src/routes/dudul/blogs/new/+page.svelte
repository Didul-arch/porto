<script lang="ts">
    import BlogForm from '#lib/components/admin/BlogForm.svelte';
</script>

<main>
    <a href="/dudul">← Dashboard</a>
    <h1>New blog</h1>
    <BlogForm />
</main>

<style lang="scss">
    @use '../../../../lib/styles/layout';

    main {
        @include layout.page-container;
        max-width: 75ch;
        margin-block: 2rem;
    }
</style>
