/**
 * 2024 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import { Options } from 'prettier';

/**
 * Recommended Prettier configuration.
 */
export const prettierConfigRecommended: Options = {
	singleQuote: true,
	trailingComma: 'all',
	tabWidth: 2,
	useTabs: true,
	printWidth: 120,
	bracketSpacing: true,
};

interface PrettierConfigOverrideInterface {
	tabWidth?: number;
}

export type PrettierConfigOverride = PrettierConfigOverrideInterface & Options;

export default (overrides?: PrettierConfigOverride) => ({
	...prettierConfigRecommended,
	...(overrides ?? {}),
});
