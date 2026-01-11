/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

/**
 * Recommended ESLint configuration for TypeScript projects.
 */

import eslint from '@eslint/js';
import tslint from 'typescript-eslint';
import eslintPluginPrettierRecommendedConfig from 'eslint-plugin-prettier/recommended';
// @ts-expect-error - importing from a JS file to TS:
import eslintPluginHeaders from 'eslint-plugin-headers';
import { ConfigWithExtends } from 'typescript-eslint';

interface EslintConfigOverrideInterface {
	copyright?: string;
	eslintConfig?: ConfigWithExtends;
}

export type EslintConfigOverride = EslintConfigOverrideInterface;

export default (override?: EslintConfigOverride) =>
	tslint.config(
		eslint.configs.recommended,
		tslint.configs.recommended,
		eslintPluginPrettierRecommendedConfig,
		{
			ignores: ['**/dist/'],
		},
		{
			plugins: {
				headers: eslintPluginHeaders,
			},
			rules: {
				'headers/header-format': [
					2,
					{
						source: 'string',
						content: override?.copyright ?? '2025 Copyright P8 Enterprise Components, Inc. \nAll Rights Reserved.',
						trailingNewlines: 2,
					},
				],
				'@typescript-eslint/no-unused-vars': [
					'warn',
					{
						argsIgnorePattern: '^_',
						varsIgnorePattern: '^_',
						caughtErrorsIgnorePattern: '^_',
					},
				],
			},
		},
		{ ...override?.eslintConfig },
	);
