/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import { parseArgs } from '../src/bin/utils/args';

describe('args utility', () => {
	it('should parse command', () => {
		const result = parseArgs(['init']);
		expect(result.command).toBe('init');
		expect(result.options).toEqual({});
		expect(result.positional).toEqual([]);
	});

	it('should parse command and positional arguments', () => {
		const result = parseArgs(['run', 'test', 'npm', 'seq']);
		expect(result.command).toBe('run');
		expect(result.positional).toEqual(['test', 'npm', 'seq']);
	});

	it('should parse long options with =', () => {
		const result = parseArgs(['init', '--cleanup=true', '--verbose']);
		expect(result.command).toBe('init');
		expect(result.options).toEqual({ cleanup: 'true', verbose: true });
	});

	it('should parse long options with next value', () => {
		const result = parseArgs(['init', '--cleanup', 'true']);
		expect(result.command).toBe('init');
		expect(result.options).toEqual({ cleanup: 'true' });
	});

	it('should parse short options', () => {
		const result = parseArgs(['init', '-c', '-v']);
		expect(result.command).toBe('init');
		expect(result.options).toEqual({ c: true, v: true });
	});

	it('should parse combined short options', () => {
		const result = parseArgs(['init', '-cv']);
		expect(result.command).toBe('init');
		expect(result.options).toEqual({ c: true, v: true });
	});

	it('should parse short option with next value', () => {
		const result = parseArgs(['init', '-c', 'true']);
		expect(result.command).toBe('init');
		expect(result.options).toEqual({ c: 'true' });
	});

	it('should parse combined short options with last one taking value', () => {
		const result = parseArgs(['init', '-cv', 'true']);
		expect(result.command).toBe('init');
		expect(result.options).toEqual({ c: true, v: 'true' });
	});

	it('should handle mixed arguments', () => {
		const result = parseArgs(['run', '-p', 'npm', 'test', '--workspace', 'seq']);
		expect(result.command).toBe('run');
		expect(result.options).toEqual({ p: 'npm', workspace: 'seq' });
		expect(result.positional).toEqual(['test']);
	});
});
