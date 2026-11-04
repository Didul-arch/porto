<script lang="ts">
  import { onMount } from 'svelte';
  import { mountAsciiCat } from './ascii-cat.js';

  let {
    speed = 0.55,
    playing = true,
    fps = 30,
    color = '#00008B',
    label = 'Kucing ASCII berputar, nyengir dan mengangkat satu jempol'
  } = $props();

  let art!: HTMLPreElement;
  let controller = $state<ReturnType<typeof mountAsciiCat> | undefined>();

  onMount(() => {
    const instance = mountAsciiCat(art, { speed, playing, fps });
    controller = instance;
    return () => instance.destroy();
  });

  $effect(() => {
    controller?.setOptions({ speed, playing, fps });
  });
</script>

<div class="cat" style:color>
  <pre bind:this={art} role="img" aria-label={label}></pre>
</div>

<style>
  .cat { width: 100%; max-width: 640px; container-type: inline-size; }
  pre {
    margin: 0; width: 100%; overflow: hidden; aspect-ratio: 108 / 128;
    font-family: 'Courier New', Courier, monospace;
    font-size: min(1.5432cqw, 9.876px); line-height: 1.2; letter-spacing: 0;
    font-variant-ligatures: none; font-weight: 400; white-space: pre;
    user-select: none; touch-action: pan-y; cursor: grab;
    text-shadow: 0 0 8px currentColor;
  }
  pre:active { cursor: grabbing; }
</style>
