/**
 * 2023 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 * Private and Confidential.
 */

import type { Config } from 'jest';

// import * as fs from 'fs';
// const swcJestConfig = JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, 'utf-8'));

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
