#!/usr/bin/env node
/**
 * 2024 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

/**
 * P8 Shared CLI tool.
 *
 * This tool is used to simplify the process of creating new P8 components.
 *
 */

import * as path from 'path';
import * as fs from 'fs';
import { processArgs } from 'ferramenta';

const IS_DEV = process.env.NODE_ENV === 'development';

const args = processArgs.args;
const self = path.parse(processArgs.name).name;
const writeLn = console.log;
const writeFile = (name: string, data: string) => fs.writeFileSync(path.join(process.cwd(), name), data);
const copyAsset = (name: string) =>
	IS_DEV
		? fs.copyFileSync(path.join(__dirname, '..', 'assets', name), path.join(process.cwd(), name))
		: fs.copyFileSync(path.join(__dirname, '..', '..', 'assets', name), path.join(process.cwd(), name));

if (args.length === 0) {
	writeLn(`
Usage: ${self} [command] [options]

Commands:
	init [cleanup]
		Initializes a new P8 repo.
			Options:
				cleanup: Removes redundant configurations from package.json.
	dirn [levelsUp]
		Returns the directory name of the caller.
			Options:
				levelsUp: The number of levels up to return the directory name.
`);

	if (IS_DEV) {
		writeLn(`DEVELOPMENT MODE`);
	}
	process.exit(1);
}

const initCleanup = (packageJson: Record<string, unknown>): void => {
	writeLn('Removing eslintConfig and prettier from package.json...');
	const configBackup: Record<string, unknown> = {};
	const configBackupFile = 'p8-package-backup.json';
	const configBackupSections = ['eslintConfig', 'prettier', 'commitlint'];

	configBackupSections.forEach((section) => {
		if (packageJson[section]) {
			writeLn(`Backing up ${section} to ${section}.${configBackupFile}...`);
			configBackup[section] = packageJson[section];
			delete packageJson[section];
		}
	});

	writeFile(`${configBackupFile}`, JSON.stringify(configBackup, null, 2));
	writeFile('package.json', JSON.stringify(packageJson, null, 2));
};

/**
 * Initializes a TypeScript project with P8 shared configurations.
 */
const init = (option: string) => {
	const packageJson = JSON.parse(String(fs.readFileSync(path.join(process.cwd(), 'package.json'))));
	const moduleType = packageJson['type'] === 'module' ? 'mjs' : 'cjs';

	writeLn(`Creating eslint.config.${moduleType}...`);
	copyAsset(`eslint.config.${moduleType}`);

	writeLn(`Creating prettier.config.${moduleType}...`);
	copyAsset(`prettier.config.${moduleType}`);

	writeLn(`Creating commitlint.config.${moduleType}...`);
	copyAsset(`commitlint.config.${moduleType}`);

	writeLn('Creating lefthook.yml...');
	copyAsset('lefthook.yml');

	if (option?.split(',').includes('cleanup')) {
		initCleanup(packageJson);
	}
};

/**
 * Returns the directory name of the caller, optionally returns a directory name specified levels up.
 */
const dirn = (levelsUp: string): string => {
	const DEFAULT_LEVELS_UP = 0;
	levelsUp ??= `${DEFAULT_LEVELS_UP}`;

	const levels = parseInt(levelsUp) || DEFAULT_LEVELS_UP;

	return process.cwd().split(path.sep).reverse()[levels];
};

switch (args[0]) {
	case 'init':
		init(args[1]);
		break;
	case 'dirn':
		writeLn(dirn(args[1]));
		break;
	default:
		console.error(`Unknown command: ${args[0]}`);
		process.exit(1);
}
