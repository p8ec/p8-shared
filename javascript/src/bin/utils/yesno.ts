/**
 * 2024 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import * as readline from 'readline';

interface AskOptions {
	question: string;
	defaultValue?: boolean;
	yesValues?: string[];
	noValues?: string[];
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	invalid?: Function;
}

const options = {
	yes: ['yes', 'y'],
	no: ['no', 'n'],
};

function defaultInvalidHandler({ yesValues, noValues }: AskOptions): void {
	const yValues = yesValues || options.yes;
	const nValues = noValues || options.no;
	process.stdout.write('\nInvalid Response.\n');
	process.stdout.write('Answer either yes : (' + yValues.join(', ') + ') \n');
	process.stdout.write('Or no: (' + nValues.join(', ') + ') \n\n');
}

/**
 * Ask a question and get a boolean response
 * @param question
 * @param defaultValue
 * @param yesValues
 * @param noValues
 * @param invalid
 */
async function ask({ question, defaultValue, yesValues, noValues, invalid }: AskOptions): Promise<boolean> {
	if (!invalid || typeof invalid !== 'function') {
		invalid = defaultInvalidHandler;
	}
	const yValues = (yesValues || options.yes).map((v) => v.toLowerCase());
	const nValues = (noValues || options.no).map((v) => v.toLowerCase());

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise<boolean>((resolve, reject) => {
		rl.question(question + ' ', async (answer: string) => {
			rl.close();
			const cleaned = answer.trim().toLowerCase();
			if (cleaned === '' && defaultValue != null) {
				return resolve(defaultValue);
			}
			if (yValues.indexOf(cleaned) >= 0) {
				return resolve(true);
			}
			if (nValues.indexOf(cleaned) >= 0) {
				return resolve(false);
			}
			invalid({ question, defaultValue, yesValues, noValues });
			const result = await ask({ question, defaultValue, yesValues, noValues, invalid });
			resolve(result);
		});
	});
}

export default ask;
