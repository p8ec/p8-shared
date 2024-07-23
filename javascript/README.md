# P(8) Shared Libraries for Node.js

Shared TypeScript/JavaScript libraries for P(8) products.

## Shared Configuration

Shared configuration for P(8) projects.

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

#### **`.eslintrc.js`**

```javascript 
module.exports = require('@p8ec/shared').eslintConfigRecommended;
```

#### **`.prettierrc.js`**

```javascript 
module.exports = require('@p8ec/shared').prettierConfigRecommended;
```

## P(8) CLI Tool

### Syntax

```shell
p8-cli [command] [options]
```

### Commands

- `init` - Initialize P(8) shared configuration in your project.
- `dirn` - Get the directory name. Options: `0` - current directory (default), `1` - parent directory, `2` - 2 levels up
  directory, etc.

