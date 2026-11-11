<script lang="ts">
    import ProjectCard from '#lib/components/ProjectCard.svelte';
    const filters = ['All', 'Personal', 'Uni Project'];
    let selectedFilter = $state('All');

    import type { PageProps } from './$types';
    let { data }: PageProps = $props();

    const filteredProjects = $derived(
        data.projects.filter((project) =>
            selectedFilter === 'All' || project.category === selectedFilter
        )
    );
</script>

<main>
    <div class="judul">
        <h1>Projects!</h1>
        <p>Things I’ve built, broke along the way, and (mostly) fixed. This is my software engineering journey so far.</p>
    </div>

    <div class="projects">
        <div class="filter">
            <span>Filter:</span>
            {#each filters as filter}
                <button
                    type="button"
                    class:selected={selectedFilter === filter}
                    aria-pressed={selectedFilter === filter}
                    onclick={() => selectedFilter = filter}
                >
                    {filter}
                </button>
            {/each}
        </div>
        <div class="project-list">
            {#each filteredProjects as project (project.id)}
                <ProjectCard {project} />
            {:else}
                <p>No projects in this category yet.</p>
            {/each}
        </div>
    </div>
</main>

<style lang="scss">
   @use '../../lib/styles/layout';
   @use '../../lib/styles/buttons';
   @use '../../lib/styles/variables';

   main {
       @include layout.page-container;
       margin-block: 2rem;
   }

   button {
       @include buttons.base;
   }

   .filter {
       display: flex;
       align-items: center;
       flex-wrap: wrap;
       gap: 4px;
   }

   .project-list {
       display: grid;
       gap: 1.5rem;
       margin-top: 1.5rem;
   }

   .judul {
      display: flex;
      flex-direction: column;
      max-width: 75ch;
      margin: 4rem 0;

      gap: 2px;
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
   @media (max-width: 767px) {
       main {
           margin-block: 1.5rem 2rem;
       }

       .judul {
           margin: 1.5rem 0 2rem;

           h1 {
               font-size: 2.25rem;
               line-height: 1.2;
               margin-bottom: 0.75rem;
           }

           p {
               text-align: justify;
               font-family: variables.$font-mono;
               font-size: 1.0625rem;
               line-height: 1.65;
           }
       }

       .filter {
           gap: 0.5rem;

           button {
               min-height: 44px;
               max-width: 100%;
               box-sizing: border-box;
               overflow-wrap: anywhere;
           }
       }

       .project-list {
           grid-template-columns: minmax(0, 1fr);

           > p {
               text-align: justify;
               font-family: variables.$font-mono;
               font-size: 1.0625rem;
               line-height: 1.65;
           }
       }
   }
</style>
