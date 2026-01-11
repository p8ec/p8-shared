# P(8) Shared Libraries for Node.js

Shared TypeScript/JavaScript libraries for P(8) products.

## Shared Configuration

Shared (**and very opinionated**) configuration for P(8) projects.

**Contents:**

- ESLint configuration
- Prettier configuration
- Commitlint configuration
- Lefthook configuration

### Usage

#### Installation

```shell
npm i -D @p8ec/shared
```

#### Initialization

```shell
p8-cli init
```

This command will create the following files in your project and remove corresponding configuration entries
from `package.json`:

#### **`.eslintrc.cjs`**

```javascript 
/* eslint-disable */
module.exports = require('@p8ec/shared').eslintConfigRecommended;
```

#### **`.prettierrc.cjs`**

```javascript 
/* eslint-disable */
module.exports = require('@p8ec/shared').prettierConfigRecommended;
```

#### **`.commitlintrc.cjs`**

```javascript
/* eslint-disable */
module.exports = { extends: ["@commitlint/config-conventional"] };
```

## P(8) CLI Tool

A command-line interface (CLI) tool for P(8) projects to simplify common tasks.

### Syntax

```shell
p8-cli [command] [options]
```

### Commands

- `init` - Initialize P(8) shared configuration in your project. Options: `cleanup` - remove configuration entries from
  `package.json`
    - Example: `p8-cli init --cleanup` - initializes the shared configuration and removes corresponding entries from
      `package.json`.
- `dirn` - Get the directory name. Options: `0` - current directory (default), `1` - parent directory, `2` - 2 levels up
  directory, etc.
    - Example: `p8-cli dirn 1` - shows the parent directory name.
- `run` - Returns a script string using the detected or specified package manager. Options: `script` - script name,
  `packageManager` - npm, yarn, or pnpm (auto-detected by default), `workspaceMode` - mode of concurrency for workspaces
  (if applicable): `seq` (default) or `par`.
    - Example: `p8-cli run build` - runs the `build` script using the detected package manager.
    - Example: `p8-cli run test pnpm par` - runs the `test` script using
      `pnpm` in parallel mode for workspaces.
