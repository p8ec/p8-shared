# P(8) Global Shared Library for Node.js and TypeScript/JavaScript.

This repository contains the shared library for all P(8) products.

## Javascript Shared Configuration

This repository contains the shared configuration for all P(8) products.

### Usage

#### Installation

```shell
npm i -D @p8ec/shared
```

#### Initialization

```shell
p8-shared-cli init
```

This command will create the following files in your project:

#### **`.eslintrc.js`**

```javascript 
module.exports = require('@p8ec/shared').eslintConfigRecommended;
```

#### **`.prettierrc.js`**

```javascript 
module.exports = require('@p8ec/shared').prettierConfigRecommended;
```
