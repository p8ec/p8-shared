/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Finds the TOPMOST directory containing package.json
 * by walking up the directory tree.
 * @param startDir Directory to start from (defaults to cwd)
 * @returns Absolute path to monorepo root, or null if none found
 */
export const detectRoot = (startDir: string = process.cwd()): string => {
	let currentDir = path.resolve(startDir);

	// Avoid symlink loops
	try {
		currentDir = fs.realpathSync(currentDir);
	} catch {
		// ignore
	}

	let lastMatch: string = startDir;

	while (true) {
		const pkgPath = path.join(currentDir, 'package.json');

		try {
			if (fs.existsSync(pkgPath)) {
				lastMatch = currentDir;
			}
		} catch {
			// ignore fs errors and continue walking up
		}

		const parentDir = path.dirname(currentDir);
		if (parentDir === currentDir) {
			break; // filesystem root reached
		}

		currentDir = parentDir;
	}

	return lastMatch;
};

/**
 * Detects the package manager used in the project.
 */
export const detectPackageManager = (cwd = process.cwd()): 'npm' | 'pnpm' | 'yarn' => {
	const root = detectRoot(cwd);
	if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) {
		return 'pnpm';
	}
	if (fs.existsSync(path.join(root, 'yarn.lock'))) {
		return 'yarn';
	}
	return 'npm';
};

/**
 * Detects if the project is a workspace.
 */
export const detectWorkspace = (cwd = process.cwd()): boolean => {
	const root = detectRoot(cwd);
	if (fs.existsSync(path.join(root, 'pnpm-workspace.yaml'))) {
		return true;
	}

	const packageJsonPath = path.join(root, 'package.json');
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
