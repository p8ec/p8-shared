/**
 * 2023 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 * Private and Confidential.
 */

import { ClassicConfig } from '@typescript-eslint/utils/ts-eslint';

/**
 * Recommended ESLint configuration for TypeScript projects.
 */
const eslintConfigRecommended: ClassicConfig.Config = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		sourceType: 'module',
	},
	ignorePatterns: ['.eslintrc.js', '.prettierrc.js', 'dist/', 'node_modules/'],
	plugins: ['@typescript-eslint/eslint-plugin', 'header'],
	extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				varsIgnorePattern: '^_',
			},
		],
		'header/header': [
			2,
			'block',
			[
				'*',
				' * 2023 Copyright P8 Enterprise Components, Inc.',
				' * All Rights Reserved.',
				' * Private and Confidential.',
				' ',
			],
			2,
		],
	},
};

export default eslintConfigRecommended;
