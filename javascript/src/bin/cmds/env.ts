/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { detectRoot } from '../utils/detect';
import { scanDirectory } from 'ferramenta';

/**
 * Parses an.env file content into an object.
 */
export const parseEnvContent = (content: string): Record<string, string> => {
	const env: Record<string, string> = {};
	const lines = content.split('\n');

	for (let line of lines) {
		line = line.trim();
		if (!line || line.startsWith('#')) {
			continue;
		}

		const [key, ...valueParts] = line.split('=');
		if (key) {
			let value = valueParts.join('=');
			// Remove surrounding quotes if present
			if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}
			env[key.trim()] = value.trim();
		}
	}

	return env;
};

/**
 * Reads .env files and populates environment variables.
 * @param filemask - .env file name or mask (e.g. .env*)
 * @param useRoot - If true, search from project root.
 * @param quiet - If true, suppress console output.
 */
export const env = (
	filemask: string = '.env',
	useRoot: boolean = false,
	quiet: boolean = false,
): Record<string, string> => {
	const startDir = useRoot ? detectRoot() : process.cwd();
	const files = scanDirectory(startDir, filemask, false);

	const mergedEnv: Record<string, string> = {};
	const seenInFiles: Record<string, { file: string; value: string }[]> = {};

	for (const file of files) {
		const filePath = path.isAbsolute(file) ? file : path.join(startDir, file);
		if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
			const content = fs.readFileSync(filePath, 'utf8');
			const parsed = parseEnvContent(content);

			for (const [key, value] of Object.entries(parsed)) {
				seenInFiles[key] = seenInFiles[key] || [];
				seenInFiles[key].push({ file, value });
				// Always use the first value encountered if multiple, or later ones?
				// Usually, merging .env files, the later ones might override the earlier ones.
				// Let's stick with the last one for now and show a warning if values differ.
				mergedEnv[key] = value;
			}
		}
	}

	// Show warnings for conflicts
	for (const [key, occurrences] of Object.entries(seenInFiles)) {
		if (occurrences.length > 1) {
			const values = occurrences.map((o) => `${o.file}: ${o.value}`);
			const uniqueValues = new Set(occurrences.map((o) => o.value));
			if (uniqueValues.size > 1) {
				console.warn(`Warning: Conflict for env variable '${key}' found in files: ${values.join(', ')}`);
			}
		}
	}

	// Populate process.env
	for (const [key, value] of Object.entries(mergedEnv)) {
		process.env[key] = value;
		if (!quiet) console.log(`${key}=${value}`);
	}

	return mergedEnv;
};
