module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "plugin:vue/essential", "@vue/prettier"],
  overrides: [],
  parserOptions: {
    parser: "babel-eslint",
  },
  plugins: ["vue"],
  rules: {}
};
