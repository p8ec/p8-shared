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

import * as path from 'node:path';
import * as fs from 'node:fs';
import { processArgs } from 'ferramenta';
import yesno from './utils/yesno';
import prompt from './utils/prompt';
import * as child_process from 'node:child_process';

export const IS_DEV = process.env.NODE_ENV === 'development';

let args = processArgs.args;
const self = path.parse(processArgs.name).name;
const writeLn = console.log;
export const cliUtils = {
	execShell: (command: string) =>
		IS_DEV ? writeLn(`DEV: execShell ${command}`) : child_process.execSync(command).toString(),
	writeFile: (name: string, data: string) =>
		IS_DEV
			? writeLn(`DEV: writeFile name=${name} data=${data}`)
			: fs.writeFileSync(path.join(process.cwd(), name), data),
	copyAsset: (name: string) =>
		IS_DEV
			? writeLn(`DEV: copyAsset name=${name}`)
			: fs.copyFileSync(path.join(__dirname, '..', '..', 'assets', name), path.join(process.cwd(), name)),
};

if (args.length === 0 && !IS_DEV && require.main === module) {
	writeLn(`
Usage: ${self} {command} [options]

Commands:
	init [cleanup]
		Initializes a new P8 repo.
			Options:
				cleanup: Removes redundant configurations from package.json.
	dirn [levelsUp]
		Returns the directory name of the caller.
			Options:
				levelsUp: The number of levels up to return the directory name.
	run [script [packageManager [workspaceMode]]]
		Returns a command to run a script with the specified package manager.
			Options:
				script: The script to run.
					- 'start': Starts the application.
					- 'build': Builds the application.
					- 'test': Runs tests.
					- 'lint': Lints the application.
					- 'start-workspace': Starts the workspace.
					- 'build-workspace': Builds the workspace.
					- 'test-workspace': Runs tests in the workspace.
					- 'lint-workspace': Lints the workspace.
				packageManager: The package manager to use (npm, yarn, pnpm). Defaults to npm.
				workspaceMode: Whether to run in workspace mode (seq or par for pnpm). Defaults to none.
`);

	if (IS_DEV) {
		writeLn(`DEVELOPMENT MODE`);
	}
	process.exit(1);
}

export const initCleanup = (packageJson: Record<string, unknown>): void => {
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

	cliUtils.writeFile(`${configBackupFile}`, JSON.stringify(configBackup, null, 2));
	cliUtils.writeFile('package.json', JSON.stringify(packageJson, null, 2));
};

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
 * Initializes a TypeScript project with P8 shared configurations.
 */
export const init = async (option: string, packageManager = detectPackageManager()) => {
	const packageJsonData = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
	const packageJson = JSON.parse(packageJsonData);
	const moduleType = packageJson['type'] === 'module' ? 'mjs' : 'cjs';

	writeLn(`Creating eslint.config.${moduleType}...`);
	cliUtils.copyAsset(`eslint.config.${moduleType}`);

	writeLn(`Creating prettier.config.${moduleType}...`);
	cliUtils.copyAsset(`prettier.config.${moduleType}`);

	packageJson.scripts ??= {};
	packageJson.scripts[`${packageManager}:reset`] =
		packageManager === 'pnpm'
			? 'rm -rf ./**/node_modules && rm -rf ./**/pnpm-lock.yaml && pnpm install'
			: packageManager === 'yarn'
				? 'rm -rf ./**/node_modules && rm -rf ./**/yarn.lock && yarn install'
				: 'rm -rf ./**/node_modules && rm -rf ./**/package-lock.json && npm install';
	packageJson.scripts[`${packageManager}:audit`] =
		packageManager === 'pnpm'
			? 'pnpm audit'
			: packageManager === 'yarn'
				? 'yarn npm audit'
				: 'npm audit --audit-level=moderate';

	const lefthook = await yesno({
		question: 'Do you want to use commitlint/lefthook? [y]n',
		defaultValue: true,
		yesValues: ['yes', 'y'],
		noValues: ['no', 'n'],
	});

	if (lefthook) {
		writeLn(`Creating commitlint.config.${moduleType}...`);
		cliUtils.copyAsset(`commitlint.config.${moduleType}`);

		writeLn('Creating lefthook.yml...');
		cliUtils.copyAsset('lefthook.yml');
		writeLn('Adding lefthook install to postinstall...');
		const lefthookInstall = 'lefthook install';
		packageJson.scripts.postinstall = lefthookInstall;

		const installCommands = {
			npm: 'npm install --save-dev @commitlint/{config-conventional,cli} commitlint lefthook',
			pnpm: 'pnpm install -D @commitlint/{config-conventional,cli} commitlint lefthook',
			yarn: 'yarn add -D @commitlint/config-conventional @commitlint/cli commitlint lefthook',
		};
		const installCommand = installCommands[packageManager];

		if (
			await yesno({
				question: `Do you want to run "${installCommand}" now? [y]n`,
				defaultValue: true,
				yesValues: ['yes', 'y'],
				noValues: ['no', 'n'],
			})
		) {
			writeLn(`Executing ${installCommand}...`);
			cliUtils.execShell(installCommand);
		} else {
			writeLn('You could run the following command to install needed dependencies:');
			writeLn(installCommand);
		}

		if (
			await yesno({
				question: `Do you want to run "${lefthookInstall}" now? [y]n`,
				defaultValue: true,
				yesValues: ['yes', 'y'],
				noValues: ['no', 'n'],
			})
		) {
			writeLn(`Executing ${lefthookInstall}...`);
			cliUtils.execShell(lefthookInstall);
		}
	}

	if (option?.split(',').includes('cleanup')) {
		initCleanup(packageJson);
	} else {
		writeLn('Skipping cleanup...');
		cliUtils.writeFile('package.json', JSON.stringify(packageJson, null, 2));
	}
};

/**
 * Returns the directory name of the caller, optionally returns a directory name specified levels up.
 */
export const dirn = (levelsUp: string): string => {
	const DEFAULT_LEVELS_UP = 0;
	levelsUp ??= `${DEFAULT_LEVELS_UP}`;

	const levels = parseInt(levelsUp) || DEFAULT_LEVELS_UP;

	return process.cwd().split(path.sep).reverse()[levels];
};

export const run = (script: string, packageManager = detectPackageManager(), workspaceMode = 'none'): string => {
	const pnpmWorkspaceSeq = '-r --workspace-concurrency=1 --if-present --reporter-hide-prefix';
	const pnpmWorkspacePar = '-r --if-present --parallel';
	const yarnWorkspaceSeq = 'workspaces foreach -A';
	const yarnWorkspacePar = 'workspaces foreach -A -p';

	const commands = {
		npm: {
			none: `npm run ${script}`,
			seq: `npm run ${script} --workspaces --if-present`,
		},
		yarn: {
			none: `yarn run ${script}`,
			seq: `yarn ${yarnWorkspaceSeq} run ${script}`,
			par: `yarn ${yarnWorkspacePar} run ${script}`,
		},
		pnpm: {
			none: `pnpm run ${script}`,
			seq: `pnpm ${pnpmWorkspaceSeq} run ${script}`,
			par: `pnpm ${pnpmWorkspacePar} run ${script}`,
		},
	};

	if (!commands[packageManager as never]) {
		throw new Error(`Unknown package manager: ${packageManager}`);
	}

	if (!commands[packageManager as never]?.[workspaceMode]) {
		throw new Error(`Unknown workspace mode: ${workspaceMode}`);
	}

	return (commands[packageManager as never] as never)[workspaceMode];
};

const main = async () => {
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
		case 'run':
			writeLn(run(args[1], args[2] as never));
			break;
		default:
			console.error(`Unknown command: ${args[0]}`);
			process.exit(1);
	}
};

if (require.main === module) {
	main()
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
}
