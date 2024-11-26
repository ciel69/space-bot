const { defineConfig } = require('eslint-define-config')

const vueRules = require('./vue.cjs')
const jsdocRules = require('./jsdoc.cjs')
const importsRules = require('./imports.cjs')

module.exports = defineConfig({
    extends: [
        'plugin:vue/strongly-recommended',
        'plugin:import/typescript',
        'plugin:import/recommended',
        '@vue/airbnb',
    ],
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
    plugins: ['import', 'jsdoc', 'filename-rules', '@stylistic/js'],
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx', 'vue', 'svg'],
                moduleDirectory: ['node_modules', './src/'],
            },
            alias: {
                map: [['@', './src']],
            },
            typescript: {
                alwaysTryTypes: true,
                project: './src',
            },
        },
    },
    rules: {
        ...vueRules,
        ...jsdocRules,
        ...importsRules,
        semi: ['error', 'never'],
        // '@typescript-eslint/no-redeclare': ['error'],
        '@stylistic/js/arrow-parens': ['error'],
        'boundaries/element-types': 'off',
        'boundaries/no-private': 'off',
        '@stylistic/js/comma-dangle': [
            'off',
            {
                arrays: 'never',
                objects: 'never',
                imports: 'never',
                exports: 'never',
                functions: 'never',
            },
        ],
        'constructor-super': 'off',
        indent: ['off'],
        'linebreak-style': 'off',
        '@stylistic/js/linebreak-style': 'off',
        'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
        '@stylistic/js/max-len': ['error', { code: 140, ignoreTemplateLiterals: true, ignoreStrings: true }],
        'no-console': 'off',
        'no-debugger': 'error',
        'no-mixed-operators': [
            'error',
            {
                groups: [
                    ['+', '-', '*', '/', '%', '**'],
                    ['&', '|', '^', '~', '<<', '>>', '>>>'],
                    ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
                    ['&&', '||'],
                    ['in', 'instanceof'],
                ],
                allowSamePrecedence: true,
            },
        ],
        'no-unused-expressions': 'error',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-bitwise': ['error', { allow: ['~'] }],
        'no-unused-vars': 'off',
        'no-underscore-dangle': 'off',
        'no-redeclare': 'off',
        'no-shadow': ['off'],
        'no-restricted-globals': 'off',
        'object-curly-newline': 'off',
        '@stylistic/js/object-curly-newline': [
            'error',
            {
                ObjectExpression: { multiline: true, consistent: true },
                ObjectPattern: { multiline: true, consistent: true },
                ExportDeclaration: { multiline: true, minProperties: 3 },
            },
        ],
        'prefer-destructuring': [
            'error',
            {
                array: false,
                object: true,
            },
            {
                enforceForRenamedProperties: false,
            },
        ],
        '@typescript-eslint/naming-convention': [
            'off',
            {
                selector: 'variable',
                format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                leadingUnderscore: 'allow',
            },
            {
                selector: ['enumMember'],
                format: ['camelCase', 'UPPER_CASE'],
            },
        ],
        'filename-rules/match': [2, 'kebab-case'],
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.js'],
            rules: {
                indent: 'off',
                // '@typescript-eslint/indent': ['error', 2],
                // '@typescript-eslint/member-delimiter-style': [
                //     'error',
                //     {
                //         multiline: {
                //             delimiter: 'comma',
                //         },
                //         singleline: {
                //             delimiter: 'comma',
                //             requireLast: false,
                //         },
                //     },
                // ],
                /*'@typescript-eslint/lines-between-class-members': [
                    'error',
                    'always',
                    {
                        exceptAfterSingleLine: true,
                    },
                ],*/
            },
        },
        {
            files: ['**/*.d.ts'],
            rules: {
                '@typescript-eslint/naming-convention': ['off'],
            },
        },
    ],
})
