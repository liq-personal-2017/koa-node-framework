module.exports = {
    env: {
        browser: false,
        commonjs: true,
        node: true,
        es6: true,
    },
    extends: ['eslint:recommended', 'google'],
    parserOptions: {
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
        },
        sourceType: 'module',
    },
    parser: 'babel-eslint',
    rules: {
        'no-requireModule-spaces': 0,
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        quotes: ['warn', 'single'],
        semi: ['warn', 'never'],
        'no-console': 1,
        'no-unused-vars': 0,
        'max-len': 0,
        'object-curly-spacing': ['warn', 'always'],
        'array-bracket-spacing': ['warn', 'always'],
        'comma-dangle': [
            'error',
            {
                arrays: 'always',
                objects: 'always',
                imports: 'never',
                exports: 'never',
                functions: 'ignore',
            },
        ],
        'guard-for-in': 0,
        'no-invalid-this': 0,
    },
}
