#!/usr/bin/env node
/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

/**
 * P8 Shared CLI tool.
 *
 * This tool is used to simplify the process of creating new P8 components.
 *
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import { processArgs } from 'ferramenta';
import prompt from './utils/prompt';
import parseArgs from './utils/args';
import * as child_process from 'node:child_process';
import { init, initCleanup } from './cmds/init';
import { dirn } from './cmds/dirn';
import { run } from './cmds/run';
import { root } from './cmds/root';
import { detectPackageManager, detectWorkspace } from './utils/detect';

export { init, initCleanup, dirn, run, root, detectPackageManager, detectWorkspace };

export const IS_DEV = process.env.NODE_ENV === 'development';

let args = processArgs.args;
const self = path.parse(processArgs.name).name;
const writeLn = (...args: any[]) => {
	console.log(...args);
};
export const cliUtils = {
	writeLn: (...args: any[]) => {
		writeLn(...args);
	},
	execShell: (command: string) =>
		IS_DEV ? cliUtils.writeLn(`DEV: execShell ${command}`) : child_process.execSync(command).toString(),
	writeFile: (name: string, data: string) =>
		IS_DEV
			? console.log(`DEV: writeFile name=${name} data=${data}`)
			: fs.writeFileSync(path.join(process.cwd(), name), data),
	copyAsset: (name: string) =>
		IS_DEV
			? console.log(`DEV: copyAsset name=${name}`)
			: fs.copyFileSync(path.join(__dirname, '..', '..', 'assets', name), path.join(process.cwd(), name)),
};

if (args.length === 0 && !IS_DEV && require.main === module) {
	writeLn(`
Usage: ${self} {command} [options]

Commands:
	init [options]
		Initializes a new P8 repo.
			Options:
				--cleanup: Flag to remove redundant configurations from package.json.
	dirn [levelsUp]
		Returns the directory name of the caller.
			Arguments:
				levelsUp: The number of levels up to return the directory name.
	run script [options]
		Returns a command to run a script with the specified package manager.
			Arguments:
				script: The script to run.
			Options:
				-p {value}, --packageManager={value}: The package manager to use, where {value} is one of 'npm', 'pnpm', 'yarn', or 'auto' (defaults to 'auto').
				-w {value}, --workspaceMode={value}: The workspace mode to use, where {value} is one of 'none', 'seq', 'par', or 'auto' (defaults to 'auto').
	root
		Returns path to the root of the repo.
	pm
		Returns the detected package manager.
	ws
		Returns true or false for detected workspace.
`);

	if (IS_DEV) {
		writeLn(`DEVELOPMENT MODE`);
	}
	process.exit(1);
}

export const main = async (customArgs?: string[]) => {
	// Ask the user for arguments if IS_DEV is true
	if (IS_DEV && !customArgs) {
		args = (await prompt('Enter arguments:')).split(' ');
	} else if (customArgs) {
		args = customArgs;
	}

	const parsed = parseArgs(args);

	switch (parsed.command) {
		case 'init':
			await init(parsed.positional[0] || (parsed.options.cleanup ? 'cleanup' : ''));
			break;
		case 'dirn':
			cliUtils.writeLn(dirn(parsed.positional[0]));
			break;
		case 'run':
			cliUtils.writeLn(
				run(
					parsed.positional[0],
					(parsed.positional[1] || parsed.options.p || parsed.options.packageManager) as string,
					(parsed.positional[2] || parsed.options.w || parsed.options.workspaceMode) as string,
				),
			);
			break;
		case 'root':
			cliUtils.writeLn(root());
			break;
		case 'pm':
			cliUtils.writeLn(detectPackageManager());
			break;
		case 'ws':
			cliUtils.writeLn(detectWorkspace());
			break;
		default:
			console.error(`Unknown command: ${parsed.command}`);
			process.exit(1);
	}
};

if (require.main === module) {
	main()
		.then((r) => {
			if (IS_DEV) {
				writeLn(`DEV: setup completed successfully with result: ${JSON.stringify(r)}`);
			}
		})
		.catch((err) => {
			if (IS_DEV) {
				writeLn(`DEV: setup failed with error: ${JSON.stringify(err)}`);
			}
			console.error(err.toString());
			process.exit(1);
		});
}
