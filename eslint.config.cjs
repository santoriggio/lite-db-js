const tsParser = require("@typescript-eslint/parser");
const jsdoc = require("eslint-plugin-jsdoc");

module.exports = [
  {
    files: ["src/**/*.{ts,js}"], // Includes all .ts and .js files in src directory and subdirectories
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      jsdoc,
    },
    rules: {
      ...jsdoc.configs["flat/recommended"].rules,
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
        },
      ],
      "array-bracket-newline": ["error", "consistent"],
      "array-bracket-spacing": ["error", "never"],
      "arrow-parens": ["error", "always"],
      "block-spacing": ["error", "always"],
      "brace-style": ["error", "1tbs", { allowSingleLine: true }],
      camelcase: "error",
      "comma-dangle": ["error", "always-multiline"],
      "comma-spacing": ["error", { before: false, after: true }],
      "comma-style": ["error", "last"],
      "computed-property-spacing": ["error", "never"],
      "eol-last": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "func-call-spacing": ["error", "never"],
      indent: ["error", 2, { SwitchCase: 1 }],
      "key-spacing": [
        "error",
        { beforeColon: false, afterColon: true, mode: "strict" },
      ],
      "keyword-spacing": ["error", { before: true, after: true }],
      "linebreak-style": ["error", "unix"],
      "lines-around-comment": [
        "error",
        {
          beforeBlockComment: true,
          beforeLineComment: true,
          allowBlockStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
        },
      ],
      "multiline-comment-style": ["error", "starred-block"],
      "newline-before-return": "error",
      "newline-per-chained-call": ["error", { ignoreChainWithDepth: 2 }],
      "no-console": "warn",
      "no-else-return": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
      "no-trailing-spaces": "error",
      "no-unneeded-ternary": "error",
      "object-curly-newline": ["error", { consistent: true }],
      "object-curly-spacing": ["error", "always"],
      "object-property-newline": [
        "error",
        { allowAllPropertiesOnSameLine: true },
      ],
      "one-var": ["error", { initialized: "never" }],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "semi-spacing": ["error", { before: false, after: true }],
      "space-before-blocks": ["error", "always"],
      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "space-in-parens": ["error", "never"],
      "space-infix-ops": "error",
      "space-unary-ops": [
        "error",
        {
          words: true,
          nonwords: false,
        },
      ],
      "spaced-comment": [
        "error",
        "always",
        {
          line: {
            markers: ["*package", "!", "/", ","],
          },
          block: {
            balanced: true,
            markers: ["*package", "!", ","],
            exceptions: ["*"],
          },
        },
      ],
      "switch-colon-spacing": ["error", { after: true, before: false }],
      "template-tag-spacing": ["error", "never"],
      "unicode-bom": ["error", "never"],
      "wrap-regex": "error",
    },
  },
];
