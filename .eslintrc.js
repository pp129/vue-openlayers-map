module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/essential",
    "@vue/prettier",
    "plugin:storybook/recommended"
  ],
  overrides: [],
  parserOptions: {
    parser: "babel-eslint",
  },
  plugins: ["vue"],
  rules: {
    "no-unused-vars": "off",
  },
};
