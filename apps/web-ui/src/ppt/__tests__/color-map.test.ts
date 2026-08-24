/**
 * color-map.test.ts
 *
 * Created by Min-Kyu Lee on 30-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { toPptColor } from "../color-map";

describe("toPptColor", () => {
	it("maps DARK1 to 000000", () => {
		expect(toPptColor("DARK1")).toBe("000000");
	});

	it("maps LIGHT1 to FFFFFF", () => {
		expect(toPptColor("LIGHT1")).toBe("FFFFFF");
	});

	it("maps DARK2 to 44546A", () => {
		expect(toPptColor("DARK2")).toBe("44546A");
	});

	it("maps LIGHT2 to E7E6E6", () => {
		expect(toPptColor("LIGHT2")).toBe("E7E6E6");
	});

	it("maps ACCENT1 to 4472C4", () => {
		expect(toPptColor("ACCENT1")).toBe("4472C4");
	});

	it("maps ACCENT2 to ED7D31", () => {
		expect(toPptColor("ACCENT2")).toBe("ED7D31");
	});

	it("maps ACCENT3 to A5A5A5", () => {
		expect(toPptColor("ACCENT3")).toBe("A5A5A5");
	});

	it("maps ACCENT4 to FFC000", () => {
		expect(toPptColor("ACCENT4")).toBe("FFC000");
	});

	it("maps ACCENT5 to 5B9BD5", () => {
		expect(toPptColor("ACCENT5")).toBe("5B9BD5");
	});

	it("maps ACCENT6 to 70AD47", () => {
		expect(toPptColor("ACCENT6")).toBe("70AD47");
	});

	it("returns undefined for undefined input", () => {
		expect(toPptColor(undefined)).toBeUndefined();
	});

	it("returns undefined for unknown theme color", () => {
		const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
		expect(toPptColor("NONEXISTENT")).toBeUndefined();
		expect(spy).toHaveBeenCalledWith(expect.stringContaining("NONEXISTENT"));
		spy.mockRestore();
	});

	it("is case-sensitive", () => {
		expect(toPptColor("dark1")).toBeUndefined();
		expect(toPptColor("DARK1")).toBe("000000");
	});

	it("returns undefined for null input", () => {
		expect(toPptColor(null as never)).toBeUndefined();
	});

	it("returns undefined for empty string", () => {
		const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
		expect(toPptColor("")).toBeUndefined();
		expect(spy).toHaveBeenCalledWith(expect.stringContaining("\"\""));
		spy.mockRestore();
	});

	it("warns on unknown color", () => {
		const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
		toPptColor("UNKNOWN");
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});

	it("does not warn on undefined input", () => {
		const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
		toPptColor(undefined);
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});
});
