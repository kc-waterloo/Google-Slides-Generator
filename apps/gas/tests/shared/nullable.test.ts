/**
 * tests/shared/nullable.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { assertNotNull_ } from "../../src/shared/nullable/assert-not-null";
import { runAndAssertNotNull } from "../../src/shared/nullable/run-and-assert-not-null";
import { runAndIgnoreNull_ } from "../../src/shared/nullable/run-and-ignore-null";

describe("assertNotNull_", () => {
	it("returns value when input is non-null", () => {
		expect(assertNotNull_("hello")).toBe("hello");
		expect(assertNotNull_(42)).toBe(42);
		expect(assertNotNull_({ a: 1 })).toEqual({ a: 1 });
	});

	it("throws when input is null", () => {
		expect(() => assertNotNull_(null)).toThrow("assertNotNull_: value is null");

		const double = (x: number): number => x * 2;

		expect(() => runAndAssertNotNull(double, null)).toThrow("assertNotNull_: value is null");
	});

	it("includes context string in error message when provided", () => {
		expect(() => assertNotNull_(null, "test context")).toThrow(
			"assertNotNull_: value is null (test context)",
		);
	});

	it("passes through function result when it returns null (input assertion only)", () => {
		const alwaysNull = (): number | null => null;

		expect(runAndAssertNotNull(alwaysNull, 5)).toBeNull();
	});
});

describe("runAndIgnoreNull_", () => {
	it("returns null when input is null", () => {
		const fn = jest.fn();

		expect(runAndIgnoreNull_(fn, null)).toBeNull();
		expect(fn).not.toHaveBeenCalled();
	});

	it("calls function when input is non-null", () => {
		const double = (x: number): number => x * 2;

		expect(runAndIgnoreNull_(double, 5)).toBe(10);
	});

	it("propagates null from function result", () => {
		const alwaysNull = (): number | null => null;

		expect(runAndIgnoreNull_(alwaysNull, 5)).toBeNull();
	});


});
