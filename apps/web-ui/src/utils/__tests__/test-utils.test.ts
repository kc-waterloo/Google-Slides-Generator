/**
 * test-utils.test.ts
 *
 * Created by Min-Kyu Lee on 02-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { createMockStorage } from "../test-utils";

describe("createMockStorage", () => {
	it("getItem and setItem work", () => {
		const storage = createMockStorage();
		storage.setItem("key1", "value1");
		expect(storage.getItem("key1")).toBe("value1");
		expect(storage.getItem("nonexistent")).toBeNull();
	});

	it("removeItem removes a key", () => {
		const storage = createMockStorage();
		storage.setItem("key1", "value1");
		storage.removeItem("key1");
		expect(storage.getItem("key1")).toBeNull();
	});

	it("clear removes all keys", () => {
		const storage = createMockStorage();
		storage.setItem("key1", "value1");
		storage.setItem("key2", "value2");
		expect(storage.length).toBe(2);
		storage.clear();
		expect(storage.getItem("key1")).toBeNull();
		expect(storage.getItem("key2")).toBeNull();
		expect(storage.length).toBe(0);
	});

	it("length getter returns correct count", () => {
		const storage = createMockStorage();
		expect(storage.length).toBe(0);
		storage.setItem("a", "1");
		expect(storage.length).toBe(1);
		storage.setItem("b", "2");
		expect(storage.length).toBe(2);
	});

	it("key returns correct key at index or null for out of bounds", () => {
		const storage = createMockStorage();
		storage.setItem("first", "1");
		storage.setItem("second", "2");
		const key0 = storage.key(0);
		const key1 = storage.key(1);
		expect([key0, key1].sort()).toEqual(["first", "second"]);
		expect(storage.key(5)).toBeNull();
	});
});
