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

if (args.length === 0) {
	// eslint-disable-next-line no-console
	console.log(`
Usage: ${self} [command] [options]

Commands:
	init [--flavor=recommended]
		Initializes a new P8 component.
			Options:
				--flavor: The flavor of the component to create. Defaults to 'recommended'.
`);
	process.exit(1);
}

const init = () => {
	const eslintConfigFilename = 'eslint.config.mjs';
	// eslint-disable-next-line no-console
	console.log(`Creating ${eslintConfigFilename}...`);
	fs.writeFileSync(
		path.join(process.cwd(), eslintConfigFilename),
		`module.exports = require('@p8ec/shared').eslintConfigRecommended;`,
	);

	const prettierConfigFilename = 'prettier.config.mjs';
	// eslint-disable-next-line no-console
	console.log(`Creating ${prettierConfigFilename}...`);
	fs.writeFileSync(
		path.join(process.cwd(), prettierConfigFilename),
		`module.exports = require('@p8ec/shared').prettierConfigRecommended;`,
	);

	// Remove eslintConfig and prettier from package.json
	// eslint-disable-next-line no-console
	console.log('Removing eslintConfig and prettier from package.json...');
	const packageJson = JSON.parse(String(fs.readFileSync(path.join(process.cwd(), 'package.json'))));
	delete packageJson['eslintConfig'];
	delete packageJson['prettier'];
	fs.writeFileSync(path.join(process.cwd(), 'package.json'), JSON.stringify(packageJson, null, 2));
};

switch (args[0]) {
	case 'init':
		init();
		break;
	default:
		// eslint-disable-next-line no-console
		console.error(`Unknown command: ${args[0]}`);
		process.exit(1);
}
