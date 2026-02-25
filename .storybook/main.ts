import type { StorybookConfig } from '@storybook/sveltekit';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

const env = loadEnv('', process.cwd(), 'PUBLIC_');

function mockSvelteKitEnv(): Plugin {
	const virtualId = '\0virtual:env/dynamic/public';
	return {
		name: 'mock-sveltekit-dynamic-env',
		enforce: 'pre',
		resolveId(id) {
			if (id === '$env/dynamic/public') return virtualId;
		},
		load(id) {
			if (id === virtualId) {
				return `export const env = ${JSON.stringify(env)};`;
			}
		},
	};
}

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|ts|svelte)'],
	addons: ['@storybook/addon-svelte-csf'],
	framework: '@storybook/sveltekit',
	viteFinal(config) {
		config.define = {
			...config.define,
			...Object.fromEntries(
				Object.entries(env).map(([key, val]) => [`import.meta.env.${key}`, JSON.stringify(val)])
			),
		};
		config.plugins = [...(config.plugins || []), mockSvelteKitEnv()];
		return config;
	},
};

export default config;
