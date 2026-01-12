/**
 * 2026 Copyright P8 Enterprise Components, Inc.
 * All Rights Reserved.
 */

import { detectPackageManager, detectWorkspace } from '../utils/detect';

export const run = (script: string, packageManager?: string, workspaceMode?: string): string => {
	if (!workspaceMode || workspaceMode === 'auto') {
		workspaceMode = detectWorkspace() ? 'seq' : 'none';
	}

	if (!packageManager || packageManager === 'auto') {
		packageManager = detectPackageManager();
	}

	const pnpmWorkspaceSeq = '-r --workspace-concurrency=1 --if-present --reporter-hide-prefix';
	const pnpmWorkspacePar = '-r --if-present --parallel';
	const yarnWorkspaceSeq = 'workspaces foreach -A';
	const yarnWorkspacePar = 'workspaces foreach -A -p';

	const commands = {
		npm: {
			none: `npm run ${script}`,
			seq: `npm run ${script} --workspaces --if-present`,
		},
		yarn: {
			none: `yarn run ${script}`,
			seq: `yarn ${yarnWorkspaceSeq} run ${script}`,
			par: `yarn ${yarnWorkspacePar} run ${script}`,
		},
		pnpm: {
			none: `pnpm run ${script}`,
			seq: `pnpm ${pnpmWorkspaceSeq} run ${script}`,
			par: `pnpm ${pnpmWorkspacePar} run ${script}`,
		},
	};

	if (!commands[packageManager as never]) {
		throw new Error(`Unknown package manager: ${packageManager}`);
	}

	if (!commands[packageManager as never]?.[workspaceMode]) {
		throw new Error(`Unknown workspace mode: ${workspaceMode}`);
	}

	return (commands[packageManager as never] as never)[workspaceMode];
};
