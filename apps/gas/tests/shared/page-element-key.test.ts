/**
 * tests/shared/page-element-key.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { isPageElementKeyEqual_ } from "../../src/shared/page-element-key/is-page-element-key-equal";
import { getPageElementKey_ } from "../../src/shared/page-element-key/get-page-element-key";
import { createMockPageElement } from "../__mocks__/google-apps-script";

describe("isPageElementKeyEqual_", () => {
	it("returns true for identical keys", () => {
		expect(isPageElementKeyEqual_("hello", "hello")).toBe(true);
	});

	it("returns true for keys with different whitespace", () => {
		expect(isPageElementKeyEqual_("  hello  ", "hello")).toBe(true);
	});

	it("returns false for different keys", () => {
		expect(isPageElementKeyEqual_("hello", "world")).toBe(false);
	});

	it("returns true for two empty strings", () => {
		expect(isPageElementKeyEqual_("", "")).toBe(true);
	});

	it("returns true for one empty, one whitespace", () => {
		expect(isPageElementKeyEqual_("", "   ")).toBe(true);
	});

	it("returns true for different whitespace-only strings (both trim to empty)", () => {
		expect(isPageElementKeyEqual_("  ", "\t")).toBe(true);
	});

	it("is symmetric (a=b and b=a)", () => {
		const a = "  foo  ";
		const b = "foo";
		expect(isPageElementKeyEqual_(a, b) === isPageElementKeyEqual_(b, a)).toBe(true);
	});
});

describe("getPageElementKey_", () => {
	it("returns trimmed description from a page element", () => {
		const el = createMockPageElement("  my-key  ");
		expect(getPageElementKey_(el)).toBe("my-key");
	});

	it("calls getDescription() on the element", () => {
		const el = createMockPageElement("test-key");
		getPageElementKey_(el);
		expect(el.getDescription).toHaveBeenCalled();
	});

	it("handles null description", () => {
		const el = createMockPageElement("test-key");
		jest.spyOn(el, "getDescription").mockImplementation(
			() => null as unknown as string,
		);
		expect(() => getPageElementKey_(el)).toThrow();
	});

	it("handles undefined description", () => {
		const el = createMockPageElement("test-key");
		jest.spyOn(el, "getDescription").mockImplementation(
			() => undefined as unknown as string,
		);
		expect(() => getPageElementKey_(el)).toThrow();
	});
});
