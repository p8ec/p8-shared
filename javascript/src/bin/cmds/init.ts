/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import yesno from '../utils/yesno';
import { detectPackageManager } from '../utils/detect';
import { cliUtils } from '../p8-shared-cli';

const writeLn = console.log;

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
 * Initializes a TypeScript project with P8 shared configurations.
 */
export const init = async (option: string, pm = 'auto') => {
	const packageJsonData = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
	const packageJson = JSON.parse(packageJsonData);
	const moduleType = packageJson['type'] === 'module' ? 'mjs' : 'cjs';
	const packageManager = pm === 'auto' ? detectPackageManager() : pm;

	writeLn(`Creating eslint.config.${moduleType}...`);
	cliUtils.copyAsset(`eslint.config.${moduleType}`);

	writeLn(`Creating prettier.config.${moduleType}...`);
	cliUtils.copyAsset(`prettier.config.${moduleType}`);

	const scripts = [
		{
			name: 'reset',
			command: {
				pnpm: 'rm -rf ./**/node_modules && rm -rf ./**/pnpm-lock.yaml && pnpm install',
				yarn: 'rm -rf ./**/node_modules && rm -rf ./**/yarn.lock && yarn install',
				npm: 'rm -rf ./**/node_modules && rm -rf ./**/package-lock.json && npm install',
			},
		},
		{
			name: 'audit',
			command: {
				pnpm: 'pnpm audit',
				yarn: 'yarn npm audit',
				npm: 'npm audit --audit-level=moderate',
			},
		},
	];

	scripts.forEach((script) => {
		packageJson.scripts ??= {};
		packageJson.scripts[`${packageManager}:${script.name}`] = script.command[packageManager as 'npm' | 'pnpm' | 'yarn'];
	});

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
		const installCommand = installCommands[packageManager as 'npm' | 'pnpm' | 'yarn'];

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
