/**
 * 2024 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

/**
 * Recommended ESLint configuration for TypeScript projects.
 */

import eslint from '@eslint/js';
import * as tslint from 'typescript-eslint';
import eslintPluginPrettierRecommendedConfig from 'eslint-plugin-prettier/recommended';
// @ts-expect-error - importing from a JS file to TS:
import eslintPluginHeaders from 'eslint-plugin-headers';

interface EslintConfigOverrideInterface {
	copyright?: string;
}

export type EslintConfigOverride = EslintConfigOverrideInterface;

export default (override?: EslintConfigOverride) =>
	tslint.config(eslint.configs.recommended, ...tslint.configs.recommended, eslintPluginPrettierRecommendedConfig, {
		plugins: {
			headers: eslintPluginHeaders,
		},
		rules: {
			'headers/header-format': [
				2,
				{
					source: 'string',
					content: override?.copyright ?? '2024 Copyright P8 Enterprise Components, Inc. \nAll Rights Reserved.',
					trailingNewlines: 2,
				},
			],
		},
	});
