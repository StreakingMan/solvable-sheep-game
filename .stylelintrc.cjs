/**
 * stylelint config
 * @ref https://stylelint.io/
 * @desc generated at 9/15/2022, 12:51:58 PM by streakingman-cli@1.9.2
 */

module.exports = {
    extends: [
        'stylelint-config-standard-scss',
        'stylelint-config-prettier-scss',
    ],
    rules: {
        // 后续统一
        'selector-class-pattern': '^[a-zA-Z0-9-_]+$',
    },
};
