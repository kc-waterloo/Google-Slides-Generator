/**
 * vitest.config.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		include: ["tests/**/*.test.ts"],
		coverage: {
			all: true,
			include: ["src/**"],
		},
	},
});
