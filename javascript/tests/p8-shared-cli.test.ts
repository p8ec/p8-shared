/**
 * 2024 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import * as cli from '../src/bin/p8-shared-cli';
import yesno from '../src/bin/utils/yesno';
import * as fs from 'fs';

jest.mock('../src/bin/utils/yesno');
const mockedYesno = yesno as jest.MockedFunction<typeof yesno>;

describe('p8-shared-cli', () => {
	describe('dirn', () => {
		const originalCwd = process.cwd();

		afterEach(() => {
			jest.spyOn(process, 'cwd').mockReturnValue(originalCwd);
		});

		it('should return the current directory name when levelsUp is 0', () => {
			jest.spyOn(process, 'cwd').mockReturnValue('/home/user/project');
			expect(cli.dirn('0')).toBe('project');
		});

		it('should return the parent directory name when levelsUp is 1', () => {
			jest.spyOn(process, 'cwd').mockReturnValue('/home/user/project');
			expect(cli.dirn('1')).toBe('user');
		});

		it('should default to 0 levels up if levelsUp is not provided', () => {
			jest.spyOn(process, 'cwd').mockReturnValue('/home/user/project');
			// @ts-ignore
			expect(cli.dirn()).toBe('project');
		});
	});

	describe('run', () => {
		it('should return correct npm command for none workspace mode', () => {
			expect(cli.run('test', 'npm', 'none')).toBe('npm run test');
		});

		it('should return correct npm command for seq workspace mode', () => {
			expect(cli.run('test', 'npm', 'seq')).toBe('npm run test --workspaces --if-present');
		});

		it('should return correct yarn command for par workspace mode', () => {
			expect(cli.run('build', 'yarn', 'par')).toBe('yarn workspaces foreach -A -p run build');
		});

		it('should return correct pnpm command for seq workspace mode', () => {
			expect(cli.run('lint', 'pnpm', 'seq')).toBe(
				'pnpm -r --workspace-concurrency=1 --if-present --reporter-hide-prefix run lint',
			);
		});

		it('should throw error for unknown package manager', () => {
			// @ts-ignore
			expect(() => cli.run('test', 'unknown')).toThrow('Unknown package manager: unknown');
		});

		it('should throw error for unknown workspace mode', () => {
			// @ts-ignore
			expect(() => cli.run('test', 'npm', 'unknown')).toThrow('Unknown workspace mode: unknown');
		});
	});

	describe('initCleanup', () => {
		beforeEach(() => {
			jest.spyOn(console, 'log').mockImplementation();
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should remove specific sections and back them up', () => {
			const packageJson = {
				name: 'test-project',
				eslintConfig: { some: 'config' },
				prettier: { some: 'prettier' },
				commitlint: { some: 'commitlint' },
				other: 'stays',
			};

			const writeFileSpy = jest.spyOn(cli.cliUtils, 'writeFile').mockImplementation();

			cli.initCleanup(packageJson);

			expect(packageJson).toEqual({
				name: 'test-project',
				other: 'stays',
			});

			expect(writeFileSpy).toHaveBeenCalledWith(
				expect.stringContaining('p8-package-backup.json'),
				expect.stringContaining('"eslintConfig"'),
			);
			expect(writeFileSpy).toHaveBeenCalledWith(
				expect.stringContaining('package.json'),
				expect.stringContaining('"test-project"'),
			);
		});
	});

	describe('init', () => {
		beforeEach(() => {
			jest.spyOn(console, 'log').mockImplementation();
			mockedYesno.mockResolvedValue(true);
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should initialize project with all configs when confirmed', async () => {
			const fs = require('fs');
			jest.spyOn(fs, 'readFileSync').mockReturnValue(
				JSON.stringify({
					name: 'test-project',
					scripts: {},
				}),
			);

			const writeFileSpy = jest.spyOn(cli.cliUtils, 'writeFile').mockImplementation();
			const copyAssetSpy = jest.spyOn(cli.cliUtils, 'copyAsset').mockImplementation();
			const execShellSpy = jest.spyOn(cli.cliUtils, 'execShell').mockImplementation();

			await cli.init('');

			expect(copyAssetSpy).toHaveBeenCalledWith('eslint.config.cjs');
			expect(copyAssetSpy).toHaveBeenCalledWith('prettier.config.cjs');
			expect(copyAssetSpy).toHaveBeenCalledWith('commitlint.config.cjs');
			expect(copyAssetSpy).toHaveBeenCalledWith('lefthook.yml');
			expect(writeFileSpy).toHaveBeenCalledWith('package.json', expect.any(String));
			expect(execShellSpy).toHaveBeenCalledWith(expect.stringContaining('npm install'));
		});

		it('should not install dependencies if user declines', async () => {
			const fs = require('fs');
			jest.spyOn(fs, 'readFileSync').mockReturnValue(
				JSON.stringify({
					name: 'test-project',
					scripts: {},
				}),
			);
			mockedYesno.mockResolvedValue(false);
			const writeFileSpy = jest.spyOn(cli.cliUtils, 'writeFile').mockImplementation();
			const copyAssetSpy = jest.spyOn(cli.cliUtils, 'copyAsset').mockImplementation();
			const execShellSpy = jest.spyOn(cli.cliUtils, 'execShell').mockImplementation();

			await cli.init('');

			expect(execShellSpy).not.toHaveBeenCalledWith(expect.stringContaining('npm install'));
		});
	});
});
