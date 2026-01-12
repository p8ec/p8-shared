/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import * as path from 'node:path';

/**
 * Returns the directory name of the caller, optionally returns a directory name specified levels up.
 */
export const dirn = (levelsUp: string): string => {
	const DEFAULT_LEVELS_UP = 0;
	levelsUp ??= `${DEFAULT_LEVELS_UP}`;

	const levels = parseInt(levelsUp) || DEFAULT_LEVELS_UP;

	return process.cwd().split(path.sep).reverse()[levels];
};
