/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { detectRoot, detectPackageManager } from '../src/bin/utils/detect';

jest.mock('node:fs');

describe('detect', () => {
	const mockedFs = fs as jest.Mocked<typeof fs>;

	beforeEach(() => {
		mockedFs.realpathSync.mockImplementation((p: any) => p);
		mockedFs.existsSync.mockReturnValue(false);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('detectRoot', () => {
		it('should return current directory if it contains package.json and it is the only one', () => {
			const cwd = '/project';
			mockedFs.existsSync.mockImplementation((p: string) => p === path.join(cwd, 'package.json'));
			expect(detectRoot(cwd)).toBe(cwd);
		});

		it('should find the topmost package.json', () => {
			const root = '/project';
			const subPkg = '/project/packages/pkg1';
			const leafDir = '/project/packages/pkg1/src';

			mockedFs.existsSync.mockImplementation((p: string) => {
				return p === path.join(root, 'package.json') || p === path.join(subPkg, 'package.json');
			});

			expect(detectRoot(leafDir)).toBe(root);
		});

		it('should return original cwd if no package.json is found anywhere up', () => {
			const cwd = '/some/path/without/root';
			mockedFs.existsSync.mockReturnValue(false);
			expect(detectRoot(cwd)).toBe(cwd);
		});
	});

	describe('detectPackageManager', () => {
		it('should detect pnpm from a project where topmost root has pnpm-lock.yaml', () => {
			const root = '/project';
			const subDir = '/project/packages/pkg1';

			mockedFs.existsSync.mockImplementation((p: string) => {
				if (p === path.join(root, 'package.json')) return true;
				if (p === path.join(root, 'pnpm-lock.yaml')) return true;
				return false;
			});

			expect(detectPackageManager(subDir)).toBe('pnpm');
		});

		it('should detect yarn from a project where topmost root has yarn.lock', () => {
			const root = '/project';
			const subDir = '/project/packages/pkg1';

			mockedFs.existsSync.mockImplementation((p: string) => {
				if (p === path.join(root, 'package.json')) return true;
				if (p === path.join(root, 'yarn.lock')) return true;
				return false;
			});

			expect(detectPackageManager(subDir)).toBe('yarn');
		});

		it('should default to npm if no lock files are found in the topmost root', () => {
			const root = '/project';
			const subDir = '/project/packages/pkg1';

			mockedFs.existsSync.mockImplementation((p: string) => {
				if (p === path.join(root, 'package.json')) return true;
				return false;
			});

			expect(detectPackageManager(subDir)).toBe('npm');
		});
	});
});
