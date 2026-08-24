/**
 * display-name.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { toDisplayName } from "../display-name";

describe("toDisplayName", () => {
	it("converts camelCase to title case", () => {
		expect(toDisplayName("createBulletSlide")).toBe("Create Bullet Slide");
	});

	it("handles single word", () => {
		expect(toDisplayName("hello")).toBe("Hello");
	});

	it("handles empty string", () => {
		expect(toDisplayName("")).toBe("");
	});

	it("handles already capitalized first letter", () => {
		expect(toDisplayName("CreateSummarySlide")).toBe("Create Summary Slide");
	});

	it("handles consecutive uppercase letters", () => {
		expect(toDisplayName("parseHTML")).toBe("Parse H T M L");
	});

	it("trims leading/trailing spaces", () => {
		expect(toDisplayName("a")).toBe("A");
	});
});
