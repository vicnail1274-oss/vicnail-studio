---
title: "How to Set Up ESLint + Prettier in 10 Minutes"
description: "Step-by-step guide to configuring ESLint and Prettier together in a JavaScript or TypeScript project. Covers conflict resolution, editor integration, and pre-commit hooks."
keywords: ["how to set up eslint prettier", "eslint prettier config", "eslint prettier conflict", "prettier eslint typescript", "eslint setup guide"]
canonical: "https://devplaybook.cc/blog/how-to-setup-eslint-prettier"
date: "2025-03-20"
tags: ["tooling", "javascript", "typescript", "dx"]
slug: "how-to-setup-eslint-prettier"
---

# How to Set Up ESLint + Prettier in 10 Minutes

ESLint catches bugs and enforces code quality rules. Prettier handles formatting — indentation, line length, trailing commas. Used together correctly, they eliminate entire categories of code review comments.

The tricky part: they overlap. Both tools can have opinions about semicolons, quotes, and spacing. Without the right config, they'll fight each other. This guide covers the complete setup — no conflicts, no guessing.

---

## Prerequisites

- Node.js 18+ installed
- A JavaScript or TypeScript project with `package.json`

---

## Step 1: Install Packages

```bash
# ESLint core
npm install --save-dev eslint

# Prettier core
npm install --save-dev prettier

# The bridge: turns off ESLint formatting rules that conflict with Prettier
npm install --save-dev eslint-config-prettier

# Optional: runs Prettier as an ESLint rule (shows Prettier violations as ESLint errors)
npm install --save-dev eslint-plugin-prettier
```

For TypeScript projects, add:

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

---

## Step 2: Configure Prettier

Create `.prettierrc` in your project root:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

Create `.prettierignore`:

```
node_modules/
dist/
build/
coverage/
.next/
*.min.js
```

---

## Step 3: Configure ESLint

### JavaScript Project

Create `eslint.config.js` (flat config, ESLint 9+):

```javascript
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      eqeqeq: 'error',
      'prefer-const': 'error',
    },
  },
  eslintConfigPrettier, // Must be last — disables conflicting rules
];
```

### TypeScript Project

```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier, // Must be last
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
    },
  }
);
```

### Using Legacy `.eslintrc.json` (ESLint 8 and below)

```json
{
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

The key: `"prettier"` always goes **last** in `extends`. It's `eslint-config-prettier` — it turns off rules that conflict.

---

## Step 4: Add npm Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

Run to verify:

```bash
npm run lint          # Check for ESLint issues
npm run format        # Format all files
npm run format:check  # CI: fail if files aren't formatted
```

---

## Step 5: Editor Integration

### VS Code

Install extensions:
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier - Code formatter** (esbenp.prettier-vscode)

Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

This setup: save file → Prettier formats → ESLint auto-fixes linting issues.

---

## Step 6: Pre-commit Hooks (Optional but Recommended)

Prevent unformatted/unlinted code from reaching your repo:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Update `package.json`:

```json
{
  "lint-staged": {
    "*.{js,mjs,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

Update `.husky/pre-commit`:

```bash
npx lint-staged
```

Now every commit automatically lints and formats staged files.

---

## Common Issues and Fixes

### "ESLint and Prettier are conflicting"

Symptom: ESLint complains about formatting that Prettier wants.

Fix: Ensure `eslint-config-prettier` is the **last** item in your `extends` array or flat config. It must override other configs.

### "Prettier is not found as a formatter"

Symptom: VS Code is using ESLint's formatter instead.

Fix: Check `"editor.defaultFormatter": "esbenp.prettier-vscode"` is set at the top level in `.vscode/settings.json`, not just per-language.

### "Cannot find module '@typescript-eslint/parser'"

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### ESLint 9 Flat Config Migration

If you're upgrading from `.eslintrc` to flat config:

```bash
npx @eslint/migrate-config .eslintrc.json
```

This auto-converts your old config to the new `eslint.config.js` format.

---

## Recommended Rule Sets for Common Stacks

### React

```bash
npm install --save-dev eslint-plugin-react eslint-plugin-react-hooks
```

```javascript
// eslint.config.js addition
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

// Add to your config array:
{
  plugins: { react: reactPlugin, 'react-hooks': hooksPlugin },
  rules: {
    'react/prop-types': 'off',          // If using TypeScript
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  }
}
```

### Node.js

```bash
npm install --save-dev eslint-plugin-node
```

---

## CI Integration

Add to your GitHub Actions workflow:

```yaml
- name: Lint and format check
  run: |
    npm run lint
    npm run format:check
```

Both commands exit non-zero on failure, blocking the PR merge.

---

## Summary

| Step | What it does |
|------|-------------|
| Install `eslint-config-prettier` | Turns off ESLint rules that clash with Prettier |
| Put `prettier` last in `extends` | Ensures Prettier wins all formatting conflicts |
| `format:check` in CI | Blocks merges of unformatted code |
| `lint-staged` + husky | Auto-fixes on commit |
| VS Code `formatOnSave` | No manual formatting needed |

Clean code is a tooling problem, not a discipline problem. Set this up once, and the tools enforce consistency automatically.

---

Use [devplaybook.cc](https://devplaybook.cc) tools to quickly format and validate your config files while setting this up.
