/**
 * test-setup.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import "@testing-library/jest-dom";
import "../src/auth/google-oauth";
import "../src/auth/gas-deploy";

const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
	const msg = args.join(" ");
	if (msg.includes("Not implemented: navigation to another Document")) {
		return;
	}
	originalConsoleError(...args);
};

const mockStorage: Record<string, string> = {};

globalThis.confirm = (): boolean => true;

Object.defineProperty(globalThis, "localStorage", {
	value: {
		getItem: (key: string): string | null => mockStorage[key] ?? null,
		setItem: (key: string, value: string): void => { mockStorage[key] = value; },
		removeItem: (key: string): void => { delete mockStorage[key]; },
		clear: (): void => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); },
		get length(): number { return Object.keys(mockStorage).length; },
		key: (): string | null => null,
	},
	writable: true,
	configurable: true,
});
