// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tslint from 'typescript-eslint';

export default tslint.config(
    {
      ignores: [
        'dist/**',
        'node_modules/**',
        'coverage/**',
        '.eslintrc.js',
        'eslint.config.mjs',
        '*.config.js',
        '*.config.ts',
        'migrations/**',
        '**/*.spec.ts',
        '**/*.e2e-spec.ts'
      ],
    },
    eslint.configs.recommended,
    ...tslint.configs.recommendedTypeChecked,
    ...tslint.configs.stylisticTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
          ...globals.es2022,
        },
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
          project: './tsconfig.json',
        },
      },
    },
    {
      rules: {
        // TypeScript specific rules
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }],
        '@typescript-eslint/explicit-function-return-type': ['warn', {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',

        // Async/Promise rules
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/require-await': 'warn',

        // Safety rules
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',

        // Style rules
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/consistent-type-imports': ['error', {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports'
        }],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'interface',
            format: ['PascalCase'],
            custom: {
              regex: '^I[A-Z]',
              match: false
            }
          },
          {
            selector: 'typeAlias',
            format: ['PascalCase']
          },
          {
            selector: 'enum',
            format: ['PascalCase']
          },
          {
            selector: 'enumMember',
            format: ['UPPER_CASE']
          }
        ],

        // General rules
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-debugger': 'error',
        'no-duplicate-imports': 'error',
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',

        // Prettier
        'prettier/prettier': ['error', {
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 100,
          tabWidth: 2,
          semi: true,
          bracketSpacing: true,
          arrowParens: 'always',
          endOfLine: 'auto'
        }]
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'test/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      }
    },
    {
      files: ['src/main.ts', 'src/**/*.module.ts'],
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
      }
    }
);
