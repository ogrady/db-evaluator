import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig } from 'eslint/config';

export default defineConfig(
    js.configs.recommended,

    // TypeScript rules
    ...tseslint.configs.recommended,

    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            import: importPlugin,
            'unused-imports': unusedImports,
        },
        rules: {
            // --- TypeScript ---
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/consistent-type-imports': 'error',

            // --- Imports ---
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    'newlines-between': 'always',
                },
            ],

            // --- Cleanup ---
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                },
            ],
            'import/extensions': [
                'error',
                'ignorePackages',
                {
                    ts: 'always'
                }
            ]
        },
    },

    // Ignore build output
    {
        ignores: ['dist', 'node_modules'],
    }
)
