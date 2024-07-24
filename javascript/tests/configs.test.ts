/**
 * 2023 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import { eslintConfigRecommended } from '../src';
import { prettierConfigRecommended } from '../src';

const configs = [
	{ name: 'eslintConfigRecommended', config: eslintConfigRecommended },
	{ name: 'prettierConfigRecommended', config: prettierConfigRecommended },
];

describe('Config is not empty', () => {
	configs.forEach(({ name, config }) => {
		test(name, () => {
			expect(config).not.toBeNull();
		});
	});
});
