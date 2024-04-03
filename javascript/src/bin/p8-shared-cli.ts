#!/usr/bin/env node
/**
 * 2023 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 * Private and Confidential.
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
	// eslint-disable-next-line no-console
	console.log('Creating .eslintrc.js...');
	fs.writeFileSync(
		path.join(path.resolve(__dirname), '.eslintrc.js'),
		`module.exports = require('@p8ec/shared').eslintConfigRecommended;`,
	);

	// eslint-disable-next-line no-console
	console.log('Creating .prettierrc.js...');
	fs.writeFileSync(
		path.join(path.resolve(__dirname), '.prettierrc.js'),
		`module.exports = require('@p8ec/shared').prettierConfigRecommended;`,
	);
};

switch (args[0]) {
	case 'init':
		init();
		break;
	default:
		// eslint-disable-next-line no-console
		console.error(`Unknown command: ${args[0]}`);
		process.exit(1);
		break;
}
