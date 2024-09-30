/**
 * @see https://github.com/vercel/next.js/issues/64409
 */

// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { fixupPluginRules } from '@eslint/compat';
import tsEslint from 'typescript-eslint';
import eslint from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const pluginsToPatch = [
  '@next/next',
  // Other plugins to patch, example :
  'react',
  'react-hooks',
];

const compatConfig = [...compat.extends('next/core-web-vitals')];

const patchedConfig = compatConfig.map((entry) => {
  const plugins = entry.plugins;

  for (const key in plugins) {
    if (Object.prototype.hasOwnProperty.call(plugins, key) && pluginsToPatch.includes(key)) {
      plugins[key] = fixupPluginRules(plugins[key]);
    }
  }

  return entry;
});

const config = [...patchedConfig, { ignores: ['.next/*'] }];

export default tsEslint.config(
  eslint.configs.recommended,
  prettierRecommended,
  ...tsEslint.configs.strictTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,
  ...config,
  {
    languageOptions: {
      parser: tsEslint.parser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: true,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ['eslint.config.mjs', 'next.config.mjs', 'prettier.config.mjs', 'postcss.config.mjs'],
    ...tsEslint.configs.disableTypeChecked,
  },
);
