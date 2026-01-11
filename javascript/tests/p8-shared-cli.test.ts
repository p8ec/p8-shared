/**
 * 2024 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import * as cli from '../src/bin/p8-shared-cli';
import yesno from '../src/bin/utils/yesno';
import * as fs from 'node:fs';
jest.mock('node:fs', () => ({
	...jest.requireActual('node:fs'),
	existsSync: jest.fn(),
}));

jest.mock('../src/bin/utils/yesno');
const mockedYesNo = yesno as jest.MockedFunction<typeof yesno>;

describe('p8-shared-cli', () => {
	describe('detectPackageManager', () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should detect pnpm if pnpm-lock.yaml exists', () => {
			(fs.existsSync as jest.Mock).mockReturnValue(true);
			expect(cli.detectPackageManager('/project/pnpm')).toBe('pnpm');
		});

		it('should detect yarn if yarn.lock exists', () => {
			(fs.existsSync as jest.Mock).mockImplementation((p: unknown) => p.toString().endsWith('yarn.lock'));
			expect(cli.detectPackageManager('/project/yarn')).toBe('yarn');
		});

		it('should detect npm by default', () => {
			(fs.existsSync as jest.Mock).mockReturnValue(false);
			expect(cli.detectPackageManager('/project/npm')).toBe('npm');
		});
	});

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
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
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

		it('should use detected package manager as default', () => {
			(fs.existsSync as jest.Mock).mockImplementation((p: string) => p.toString().endsWith('pnpm-lock.yaml'));
			expect(cli.run('test')).toContain('pnpm run test');
		});

		it('should return correct pnpm command for seq workspace mode', () => {
			expect(cli.run('lint', 'pnpm', 'seq')).toBe(
				'pnpm -r --workspace-concurrency=1 --if-present --reporter-hide-prefix run lint',
			);
		});

		it('should throw error for unknown package manager', () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			expect(() => cli.run('test', 'unknown')).toThrow('Unknown package manager: unknown');
		});

		it('should throw error for unknown workspace mode', () => {
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
			mockedYesNo.mockResolvedValue(true);
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should initialize project with all configs when confirmed', async () => {
			jest.spyOn(fs, 'readFileSync').mockReturnValue(
				JSON.stringify({
					name: 'test-project',
					scripts: {},
				}),
			);
			(fs.existsSync as jest.Mock).mockReturnValue(false); // Default to npm

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

		it('should initialize project with pnpm when pnpm-lock.yaml exists', async () => {
			jest.spyOn(fs, 'readFileSync').mockReturnValue(
				JSON.stringify({
					name: 'test-project',
					scripts: {},
				}),
			);

			const writeFileSpy = jest.spyOn(cli.cliUtils, 'writeFile').mockImplementation();
			jest.spyOn(cli.cliUtils, 'copyAsset').mockImplementation();
			const execShellSpy = jest.spyOn(cli.cliUtils, 'execShell').mockImplementation();

			await cli.init('', 'pnpm');

			expect(execShellSpy).toHaveBeenCalledWith(expect.stringContaining('pnpm install'));
			const packageJson = JSON.parse(writeFileSpy.mock.calls.find((call) => call[0] === 'package.json')![1]);
			expect(packageJson.scripts['pnpm:reset']).toBeDefined();
		});

		it('should initialize project with yarn when yarn.lock exists', async () => {
			jest.spyOn(fs, 'readFileSync').mockReturnValue(
				JSON.stringify({
					name: 'test-project',
					scripts: {},
				}),
			);

			const writeFileSpy = jest.spyOn(cli.cliUtils, 'writeFile').mockImplementation();
			jest.spyOn(cli.cliUtils, 'copyAsset').mockImplementation();
			const execShellSpy = jest.spyOn(cli.cliUtils, 'execShell').mockImplementation();

			await cli.init('', 'yarn');

			expect(execShellSpy).toHaveBeenCalledWith(expect.stringContaining('yarn add -D'));
			const packageJson = JSON.parse(writeFileSpy.mock.calls.find((call) => call[0] === 'package.json')![1]);
			expect(packageJson.scripts['yarn:reset']).toBeDefined();
		});

		it('should not install dependencies if user declines', async () => {
			jest.spyOn(fs, 'readFileSync').mockReturnValue(
				JSON.stringify({
					name: 'test-project',
					scripts: {},
				}),
			);
			(fs.existsSync as jest.Mock).mockReturnValue(false); // Default to npm
			mockedYesNo.mockResolvedValue(false);
			// Suppressing unused vars warnings for spies that are intentionally not used:
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const writeFileSpy = jest.spyOn(cli.cliUtils, 'writeFile').mockImplementation();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const copyAssetSpy = jest.spyOn(cli.cliUtils, 'copyAsset').mockImplementation();
			const execShellSpy = jest.spyOn(cli.cliUtils, 'execShell').mockImplementation();

			await cli.init('');

			expect(execShellSpy).not.toHaveBeenCalledWith(expect.stringContaining('npm install'));
		});
	});
});
