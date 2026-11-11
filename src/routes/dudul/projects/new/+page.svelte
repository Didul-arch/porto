<script lang="ts">
    import ProjectForm from '#lib/components/admin/ProjectForm.svelte';
</script>

<main>
    <a href="/dudul">← Dashboard</a>
    <h1>New project</h1>
    <ProjectForm />
</main>

<style lang="scss">
    @use '../../../../lib/styles/layout';

    main {
        @include layout.page-container;
        margin-block: 2rem;
    }
</style>
