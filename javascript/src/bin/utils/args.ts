/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

/**
 * Robust command line argument parser.
 *
 * @param args - Array of command line arguments.
 * @returns An object containing parsed commands, options, and positional arguments.
 * @example
 * ```ts
 * const args = ['build', '--env=production', '-f', 'config.json', 'input.txt'];
 * const parsed = parseArgs(args);
 * // parsed = {
 * //	  command: 'build',
 * //   options: { env: 'production', f: 'config.json' },
 * //   positional: ['input.txt']
 * // }
 * ```
 */
export const parseArgs = (args: string[]) => {
	const result = {
		command: '',
		options: {} as Record<string, string | boolean>,
		positional: [] as string[],
	};

	let isCommandSet = false;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg.startsWith('--')) {
			const [key, value] = arg.slice(2).split('=');
			if (value !== undefined) {
				result.options[key] = value;
			} else {
				const nextArg = args[i + 1];
				if (nextArg && !nextArg.startsWith('-')) {
					result.options[key] = nextArg;
					i++;
				} else {
					result.options[key] = true;
				}
			}
		} else if (arg.startsWith('-')) {
			const keys = arg.slice(1).split('');
			keys.forEach((key, index) => {
				if (index === keys.length - 1) {
					const nextArg = args[i + 1];
					if (nextArg && !nextArg.startsWith('-')) {
						result.options[key] = nextArg;
						i++;
					} else {
						result.options[key] = true;
					}
				} else {
					result.options[key] = true;
				}
			});
		} else {
			if (!isCommandSet) {
				result.command = arg;
				isCommandSet = true;
			} else {
				result.positional.push(arg);
			}
		}
	}

	return result;
};

export default parseArgs;
