module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        commonjs: true
    },
    extends: ['prettier', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'json-format'],
    parserOptions: {
        sourceType: 'module'
    },
    rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'typeLike',
                format: ['StrictPascalCase']
            },
            {
                selector: ['variable', 'parameter'],
                format: [
                    'camelCase',
                    'snake_case',
                    'UPPER_CASE',
                    'StrictPascalCase'
                ]
            },
            {
                selector: ['function', 'method'],
                format: ['camelCase', 'snake_case']
            },
            { selector: ['property'], format: ['camelCase', 'snake_case'] }
        ]
    },
    settings: {
        'json/sort-package-json': 'standard'
    }
};
