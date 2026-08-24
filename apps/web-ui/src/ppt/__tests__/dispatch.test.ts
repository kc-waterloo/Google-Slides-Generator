/**
 * dispatch.test.ts
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { callTypedFn } from "../dispatch";

describe("callTypedFn", () => {
	it("invokes the function with the provided buffer and params", async () => {
		const fn = vi.fn(async () => new ArrayBuffer(0));
		const buffer = new ArrayBuffer(10);
		const params = { key: "value" };

		await callTypedFn(fn, buffer, params);

		expect(fn).toHaveBeenCalledWith(buffer, params);
	});

	it("returns the result from the function", async () => {
		const result = new ArrayBuffer(20);
		const fn = vi.fn(async () => result);

		const output = await callTypedFn(fn, new ArrayBuffer(5), {});

		expect(output).toBe(result);
	});

	it("propagates errors from the function", async () => {
		const fn = vi.fn(async () => {
			throw new Error("function error");
		});

		await expect(callTypedFn(fn, new ArrayBuffer(5), {})).rejects.toThrow("function error");
	});

	it("invokes the function exactly once", async () => {
		const fn = vi.fn(async () => new ArrayBuffer(0));

		await callTypedFn(fn, new ArrayBuffer(5), {});

		expect(fn).toHaveBeenCalledTimes(1);
	});
});
