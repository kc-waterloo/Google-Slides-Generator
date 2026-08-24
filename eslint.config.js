import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import commentHeader from "eslint-plugin-comment-header";
import globals from "globals";

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: [
			"**/dist/**",
			"**/node_modules/**",
			"**/coverage/**",
			"**/dist-electron/**",
			"**/out/**",
			"**/release/**",
			"**/util/build/**",
		],
	},
	{
		files: ["**/*.cjs"],
		languageOptions: {
			sourceType: "commonjs",
			globals: {
				...globals.node,
			},
		},
	},
	{
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					caughtErrors: "none",
				},
			],
			indent: ["error", "tab"],
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "double"],
			semi: ["error", "always"],
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
		},
		plugins: {
			"comment-header": commentHeader,
		},
	},
	eslintConfigPrettier,
);
