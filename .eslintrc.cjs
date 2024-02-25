/**
 * .eslintrc.cjs
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

module.exports = {
	"ignorePatterns": [
		"dist/**/*",
		"node_modules/**/*",
	],
	"env": {
		"browser": true,
		"es2021": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended"
	],
	"overrides": [
		{
			"env": {
				"node": true
			},
			"files": [
				".eslintrc.{js,cjs}"
			],
			"parserOptions": {
				"sourceType": "script"
			}
		}
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module"
	},
	"plugins": [
		"@typescript-eslint",
		"eslint-plugin-comment-header"
	],
	"rules": {
		"comment-header/comment-header": [
			"warn",
			{
				authorName: "Min-Kyu Lee",
				regexFileNamesToShowParentDirectory: [
					"index\\..*",
					"defaults\\..*",
				],
			},
		],
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		]
	}
};
