/**
 * rollup.config.mjs
 *
 * Created by Min-Kyu Lee on 08-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";

export default {
	input: "src/index.ts",
	output: {
		file: "dist/bundle.js",
		format: "cjs",
		// Apps Script has no CommonJS module wrapper, so the `exports.foo = foo`
		// lines Rollup emits would throw "exports is not defined" on load.
		// Aliasing `exports` to the global object turns them into the global
		// function bindings the GAS runtime looks up by name.
		intro: "var exports = globalThis;"
	},
	treeshake: false,
	plugins: [
		resolve({
			extensions: [".ts", ".js"],
			browser: false,
		}),
		typescript({
			tsconfig: false,
			compilerOptions: {
				target: "es2020",
				module: "esnext",
				strict: true,
				esModuleInterop: true,
				skipLibCheck: true,
				moduleResolution: "bundler",
				types: ["google-apps-script"],
			},
			include: [
				"src/**/*.ts",
				"../shared/src/**/*.ts",
			],
			exclude: [
				"tests/**/*.ts",
				"util/**/*.ts",
				"coverage/**/*.ts",
				"dist/**/*",
				"../shared/src/**/__tests__/**",
			],
		})
	]
};
