// eslint.config.js
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
    // Apply to all TypeScript files
    {
        files: ['src/**/*.ts', 'tests/**/*.ts'],
        languageOptions: {
            parser: typescriptParser,
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                global: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescript,
        },
        rules: {
            // ESLint base rules
            ...js.configs.recommended.rules,

            // TypeScript specific rules
            '@typescript-eslint/no-unused-vars': ['off', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-var-requires': 'error',

            // General rules (use base ESLint rules, not TypeScript versions)
            'prefer-const': 'error',
            'no-var': 'error',
            'no-console': 'off', // Allow console in library
            'quotes': ['error', 'single'],
            'comma-dangle': ['error', 'never'],
            'no-trailing-spaces': 'error',
            'eol-last': 'off',
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'key-spacing': ['error', { beforeColon: false, afterColon: true }],
            'space-before-blocks': 'error',
            'space-infix-ops': 'error',
            'space-unary-ops': 'error',
            'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
            'no-mixed-spaces-and-tabs': 'error',

            // Import/Export rules
            'no-duplicate-imports': 'error',

            // Error prevention - disable ESLint versions, use TypeScript versions
            'no-undef': 'off', // TypeScript handles this
            'no-unused-vars': 'off', // Use TypeScript version instead
            'no-redeclare': 'off', // TypeScript handles this
        },
    },

    // Test files specific rules
    {
        files: ['tests/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
        languageOptions: {
            parser: typescriptParser,
            globals: {
                jest: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
            'no-console': 'off',
        },
    },

    // Configuration files
    {
        files: ['*.config.js', '*.config.mjs', 'scripts/**/*.js'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
            },
        },
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-var-requires': 'off',
        },
    },

    // Ignore patterns
    {
        ignores: [
            'node_modules/**',
            'lib/**',
            'dist/**',
            'coverage/**',
            '*.min.js',
            'build/**',
            '.git/**',
        ],
    },
]