<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import Navbar from '#lib/components/navbar.svelte';

	let { children }: LayoutProps = $props();
</script>

<style>
    @font-face {
      font-family: 'IBM Plex Mono';
      src: url('/fonts/IBMPlexMono-Regular.ttf');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }

    @font-face {
      font-family: 'IBM Plex Mono';
      src: url('/fonts/IBMPlexMono-Italic.ttf');
      font-weight: 400;
      font-style: italic;
      font-display: swap;
    }

    @font-face {
      font-family: 'IBM Plex Mono';
      src: url('/fonts/IBMPlexMono-SemiBold.ttf');
      font-weight: 600;
      font-style: normal;
      font-display: swap;
    }

    @font-face {
      font-family: 'IBM Plex Mono';
      src: url('/fonts/IBMPlexMono-Bold.ttf');
      font-weight: 700;
      font-style: normal;
      font-display: swap;
    }

    @font-face {
      font-family: 'IBM Plex Mono';
      src: url('/fonts/IBMPlexMono-BoldItalic.ttf');
      font-weight: 700;
      font-style: italic;
      font-display: swap;
    }

    @font-face {
      font-family: 'IBM Plex Sans';
      src: url('/fonts/IBMPlexSans-VariableFont_wdth,wght.ttf') format('truetype');
      font-weight: 100 700;
      font-style: normal;
      font-display: swap;
    }

    @font-face {
      font-family: 'IBM Plex Sans';
      src: url('/fonts/IBMPlexSans-Italic-VariableFont_wdth,wght.ttf') format('truetype');
      font-weight: 100 700;
      font-style: italic;
      font-display: swap;
    }

    :global(body) {
      margin: 0;
      font-family: 'IBM Plex Mono', monospace;
    }
</style>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar />
{@render children()}
