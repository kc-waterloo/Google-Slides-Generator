/**
 * vite.config.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	base: process.env.VITE_BASE ?? "/Google-Slides-Generator/",
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: "./src/test-setup.ts",

		coverage: {
			all: true,
			include: ["src/**"],
			exclude: [
				"src/**/*.test.ts",
				"src/**/*.test.tsx",
				"src/**/__tests__/**",
				"src/test-setup.ts",
				"src/test-utils.ts",
			],
		},
	},
});
