import type { StorybookConfig } from '@storybook/sveltekit';
import { loadEnv } from 'vite';

const env = loadEnv('', process.cwd(), 'PUBLIC_');

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
		return config;
	},
};

export default config;
