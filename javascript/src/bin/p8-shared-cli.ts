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
import yesno from './utils/yesno';
import prompt from './utils/prompt';
import * as child_process from 'node:child_process';

const IS_DEV = process.env.NODE_ENV === 'development';

let args = processArgs.args;
const self = path.parse(processArgs.name).name;
const writeLn = console.log;
const execShell = (command: string) =>
	IS_DEV ? writeLn(`DEV: execShell ${command}`) : child_process.execSync(command).toString();
const writeFile = (name: string, data: string) =>
	IS_DEV ? writeLn(`DEV: writeFile name=${name} data=${data}`) : fs.writeFileSync(path.join(process.cwd(), name), data);
const copyAsset = (name: string) =>
	IS_DEV
		? writeLn(`DEV: copyAsset name=${name}`)
		: fs.copyFileSync(path.join(__dirname, '..', '..', 'assets', name), path.join(process.cwd(), name));

if (args.length === 0 && !IS_DEV) {
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
const init = async (option: string) => {
	const packageJson = JSON.parse(String(fs.readFileSync(path.join(process.cwd(), 'package.json'))));
	const moduleType = packageJson['type'] === 'module' ? 'mjs' : 'cjs';

	writeLn(`Creating eslint.config.${moduleType}...`);
	copyAsset(`eslint.config.${moduleType}`);

	writeLn(`Creating prettier.config.${moduleType}...`);
	copyAsset(`prettier.config.${moduleType}`);

	packageJson.scripts['npm:reset'] = 'rm -rf ./**/node_modules && rm -rf ./**/package-lock.json && npm install';
	packageJson.scripts['npm:audit'] = 'npm audit --audit-level=moderate';

	const lefthook = await yesno({
		question: 'Do you want to use commitlint/lefthook? [y]n',
		defaultValue: true,
		yesValues: ['yes', 'y'],
		noValues: ['no', 'n'],
	});

	if (lefthook) {
		writeLn(`Creating commitlint.config.${moduleType}...`);
		copyAsset(`commitlint.config.${moduleType}`);

		writeLn('Creating lefthook.yml...');
		copyAsset('lefthook.yml');
		writeLn('Adding lefthook install to postinstall...');
		const lefthookInstall = 'lefthook install';
		packageJson.scripts.postinstall = lefthookInstall;
		const npmInstall = 'npm install --save-dev @commitlint/{config-conventional,cli} commitlint lefthook';
		writeLn(`Executing ${npmInstall}...`);
		execShell(npmInstall);
		writeLn(`Executing ${lefthookInstall}...`);
		execShell(lefthookInstall);
	}

	if (option?.split(',').includes('cleanup')) {
		initCleanup(packageJson);
	} else {
		writeLn('Skipping cleanup...');
		writeFile('package.json', JSON.stringify(packageJson, null, 2));
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

const setup = async () => {
	// Ask the user for arguments if IS_DEV is true
	if (IS_DEV) {
		args = (await prompt('Enter arguments: ')).split(' ');
	}

	switch (args[0]) {
		case 'init':
			await init(args[1]);
			break;
		case 'dirn':
			writeLn(dirn(args[1]));
			break;
		default:
			console.error(`Unknown command: ${args[0]}`);
			process.exit(1);
	}
};

setup()
	.then((r) => {
		if (IS_DEV) {
			writeLn(`DEV: setup completed with result: ${r}`);
		}
	})
	.catch((err) => {
		if (IS_DEV) {
			writeLn(`DEV: setup failed with error: ${err}`);
		}
		console.error(`Error: ${err}`);
		process.exit(1);
	});
