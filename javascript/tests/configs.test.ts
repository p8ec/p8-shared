/**
 * 2024 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import { eslintConfigRecommended } from '../src';
import { prettierConfigRecommended } from '../src';

const configs = [
	{ name: 'eslintConfigRecommended', config: eslintConfigRecommended() },
	{ name: 'prettierConfigRecommended', config: prettierConfigRecommended() },
];

describe('Test config factories', () => {
	configs.forEach(({ name, config }) => {
		test(name, () => {
			expect(config).not.toBeNull();
			expect(config).not.toBeFalsy();
			expect(config).toBeDefined();
			expect(typeof config === 'function').toBe(false);
		});
	});
});
