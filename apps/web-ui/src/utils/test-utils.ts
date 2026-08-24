/**
 * test-utils.ts
 *
 * Created by Min-Kyu Lee on 30-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export const createMockStorage = (): Storage => {
	const store: Record<string, string> = {};
	return {
		getItem: (key: string): string | null => store[key] ?? null,
		setItem: (key: string, value: string): void => { store[key] = value; },
		removeItem: (key: string): void => { delete store[key]; },
		clear: (): void => { Object.keys(store).forEach((k) => delete store[k]); },
		key: (index: number): string | null => Object.keys(store)[index] ?? null,
		get length() { return Object.keys(store).length; },
	};
};
