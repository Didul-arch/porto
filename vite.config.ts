import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({ mode }) => ({
	server: {
		watch: {
			usePolling: loadEnv(mode, '.', 'DOCKER_').DOCKER_POLLING === 'true',
			interval: 300
		}
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			preprocess: vitePreprocess(),

			adapter: adapter()
		})
	]
}));
