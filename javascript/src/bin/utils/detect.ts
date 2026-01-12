/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Detects the package manager used in the project.
 */
export const detectPackageManager = (cwd = process.cwd()): 'npm' | 'pnpm' | 'yarn' => {
	if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
		return 'pnpm';
	}
	if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
		return 'yarn';
	}
	return 'npm';
};

/**
 * Detects if the project is a workspace.
 */
export const detectWorkspace = (cwd = process.cwd()): boolean => {
	if (fs.existsSync(path.join(cwd, 'pnpm-workspace.yaml'))) {
		return true;
	}

	const packageJsonPath = path.join(cwd, 'package.json');
	if (fs.existsSync(packageJsonPath)) {
		try {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
			if (packageJson.workspaces) {
				return true;
			}
		} catch {
			return false;
		}
	}

	return false;
};
