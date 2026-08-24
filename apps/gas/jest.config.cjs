/**
 * jest.config.cjs
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/tests/"],
	setupFiles: ["<rootDir>/tests/setup.ts"],
	moduleFileExtensions: ["ts", "js", "d.ts"],
	testMatch: [
		"<rootDir>/tests/**/*.test.ts",
	],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/tests/tsconfig.json",
			},
		],
	},
	moduleNameMapper: {
		"^@gsg/shared$": "<rootDir>/../shared/src",
		"^@gsg/shared/(.*)$": "<rootDir>/../shared/src/$1",
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
};
