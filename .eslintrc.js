module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        jquery: true
    },
    extends: [
        'eslint:recommended'
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    rules: {
        "semi": [2, 'always'],
        'space-before-function-paren': [2, 'always'],
        'import/no-duplicates': 0,
        'handle-callback-err': 0,
        'no-tabs': 0,
        'no-unused-vars': 1,
        'no-irregular-whitespace': 1
    },

};