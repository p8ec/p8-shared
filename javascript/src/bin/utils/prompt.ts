/**
 * 2024 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import * as readline from 'readline';

/**
 * Prompts the user for input
 * @param prompt string The prompt to display to the user
 * @returns Promise<string> The user's input
 */
async function prompt(prompt: string): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise<string>((resolve, reject) => {
		rl.question(prompt + ' ', (answer: string) => {
			rl.close();
			resolve(answer);
		});
	});
}

export default prompt;
