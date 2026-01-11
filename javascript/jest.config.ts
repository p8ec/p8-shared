/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import type { Config } from 'jest';

export default async (): Promise<Config> => {
	return {
		verbose: true,
		roots: ['<rootDir>/tests'],
		testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
		transform: {
			'^.+\\.(t|j)sx?$': '@swc/jest',
		},
	};
};
