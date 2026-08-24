/**
 * tests/test-utils.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export function createMockIpcRenderer() {
	return {
		invoke: vi.fn(),
		on: vi.fn(),
		removeListener: vi.fn(),
	};
}

export function createMockContextBridge() {
	return {
		exposeInMainWorld: vi.fn(),
	};
}
