/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import { detectRoot } from '../utils/detect';

/**
 * Returns the root directory of the project.
 */
export const root = (cwd = process.cwd()): string => {
	return detectRoot(cwd);
};
