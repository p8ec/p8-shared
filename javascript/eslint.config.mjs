/**
 * 2024 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 *
 * @ts-check
 */

import eslint from '@eslint/js';
import * as tslint from 'typescript-eslint';
import eslintPluginPrettierRecommendedConfig from 'eslint-plugin-prettier/recommended';
import eslintPluginHeaders from 'eslint-plugin-headers';

export default tslint.config(
	eslint.configs.recommended,
	...tslint.configs.recommended,
	eslintPluginPrettierRecommendedConfig,
	{
		plugins: {
			headers: eslintPluginHeaders,
		},
		rules: {
			'headers/header-format': [
				2,
				{
					source: 'string',
					content: '2024 Copyright P8 Enterprise Components, Inc. \nAll Rights Reserved.',
					trailingNewlines: 2,
				},
			],
		},
	},
);
