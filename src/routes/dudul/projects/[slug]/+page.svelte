<script lang="ts">
    import ProjectForm from '#lib/components/admin/ProjectForm.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<main>
    <a href="/dudul">← Dashboard</a>
    <h1>Edit project</h1>
    {#key data.project.id}
        <ProjectForm project={data.project} />
    {/key}
</main>

<style lang="scss">
    @use '../../../../lib/styles/layout';

    main {
        @include layout.page-container;
        margin-block: 2rem;
    }
</style>
