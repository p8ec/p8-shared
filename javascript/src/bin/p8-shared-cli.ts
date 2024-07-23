#!/usr/bin/env node
/**
 * 2023 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

/**
 * P8 Shared CLI tool.
 *
 * This tool is used to simplify the process of creating new P8 components.
 *
 * 	Usage:
 * 		p8-shared [command] [options]
 *
 * 	Commands:
 * 		init [--flavor=recommended]
 * 			Initializes a new P8 component.
 *				Options:
 *					--flavor: The flavor of the component to create. Defaults to 'recommended'.
 */

import * as path from 'path';
import * as fs from 'fs';
import { processArgs } from 'ferramenta';

const args = processArgs.args;
const self = path.parse(processArgs.name).name;
const writeLn = console.log;
const writeFile = (name: string, data: string) => fs.writeFileSync(path.join(process.cwd(), name), data);

if (args.length === 0) {
	writeLn(`
Usage: ${self} [command] [options]

Commands:
	init [--flavor=recommended]
		Initializes a new P8 component.
			Options:
				--flavor: The flavor of the component to create. Defaults to 'recommended'.
`);
	process.exit(1);
}

/**
 * Initializes a TypeScript project with P8 shared configurations.
 */
const init = () => {
	writeLn('Creating .eslintrc.js...');
	writeFile('.eslintrc.js', `module.exports = require('@p8ec/shared').eslintConfigRecommended;`);

	writeLn('Creating .prettierrc.js...');
	writeFile('.prettierrc.js', `module.exports = require('@p8ec/shared').prettierConfigRecommended;`);

	// Cleanup package.json
	writeLn('Removing eslintConfig and prettier from package.json...');
	const packageJson = JSON.parse(String(fs.readFileSync(path.join(process.cwd(), 'package.json'))));

	if (packageJson['eslintConfig']) {
		writeLn('Backing up eslintConfig to eslint.package.json.bak...');
		writeFile('eslint.package.json.bak', packageJson['eslintConfig']);
		delete packageJson['eslintConfig'];
	}

	if (packageJson['prettier']) {
		writeLn('Backing up prettier to prettier.package.json.bak...');
		writeFile('prettier.package.json.bak', packageJson['prettier']);
		delete packageJson['prettier'];
	}

	writeFile('package.json', JSON.stringify(packageJson, null, 2));
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

/**
 * Returns the caller PID
 */
const pid = (): number => {
	return process.pid;
};

switch (args[0]) {
	case 'init':
		init();
		break;
	case 'dirn':
		writeLn(dirn(args[1]));
		break;
	default:
		// eslint-disable-next-line no-console
		console.error(`Unknown command: ${args[0]}`);
		process.exit(1);
}
