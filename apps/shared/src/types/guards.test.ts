/**
 * guards.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { isRecord, isRecordArray } from "./guards";

describe("isRecord", () => {
	it("returns true for plain objects", () => {
		expect(isRecord({})).toBe(true);
		expect(isRecord({ a: 1 })).toBe(true);
	});

	it("returns false for null", () => {
		expect(isRecord(null)).toBe(false);
	});

	it("returns false for arrays", () => {
		expect(isRecord([])).toBe(false);
	});

	it("returns false for primitives", () => {
		expect(isRecord("string")).toBe(false);
		expect(isRecord(42)).toBe(false);
		expect(isRecord(true)).toBe(false);
		expect(isRecord(undefined)).toBe(false);
	});

	it("returns true for objects created with Object.create", () => {
		expect(isRecord(Object.create(null))).toBe(true);
	});
});

describe("isRecordArray", () => {
	it("returns true for array of plain objects", () => {
		expect(isRecordArray([{ a: 1 }, { b: 2 }])).toBe(true);
	});

	it("returns true for empty array", () => {
		expect(isRecordArray([])).toBe(true);
	});

	it("returns false for non-array values", () => {
		expect(isRecordArray(null)).toBe(false);
		expect(isRecordArray({})).toBe(false);
		expect(isRecordArray("string")).toBe(false);
	});

	it("returns false when some items are not records", () => {
		expect(isRecordArray([{ a: 1 }, null])).toBe(false);
		expect(isRecordArray([{ a: 1 }, "string"])).toBe(false);
		expect(isRecordArray([{ a: 1 }, undefined])).toBe(false);
	});

	it("returns false when array contains nested arrays", () => {
		expect(isRecordArray([{ a: 1 }, []])).toBe(false);
	});
});
