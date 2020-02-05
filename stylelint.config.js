module.exports = {
  ignoreFiles: ["**/*.js", "src/assets/css/element-variables.scss", "theme/"],
  extends: ["stylelint-config-standard", "stylelint-config-prettier"],
  rules: {
    "no-empty-source": null,
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["extend", "mixin"]
      }
    ]
  }
};
