/**
 * tests/shared/presentation.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { getActivePresentation_ } from "../../src/shared/presentation";
import { mockSlidesApp } from "../__mocks__/google-apps-script";
import * as logger from "../../src/shared/logger/logger";

beforeEach(() => {
	jest.clearAllMocks();
	mockSlidesApp.setActivePresentation(null);
});

describe("getActivePresentation_", () => {
	it("returns the active presentation when available", () => {
		const mockPresentation = {} as GoogleAppsScript.Slides.Presentation;
		mockSlidesApp.setActivePresentation(mockPresentation);

		const result = getActivePresentation_("test-module");

		expect(result).toBe(mockPresentation);
	});

	it("returns null when there is no active presentation", () => {
		const warnSpy = jest.spyOn(logger, "logWarn").mockImplementation(() => {});

		const result = getActivePresentation_("test-module");

		expect(result).toBeNull();
		warnSpy.mockRestore();
	});

	it("logs a warning when no active presentation", () => {
		const warnSpy = jest.spyOn(logger, "logWarn").mockImplementation(() => {});

		getActivePresentation_("test-module");

		expect(warnSpy).toHaveBeenCalledWith("test-module", "No active presentation");
		warnSpy.mockRestore();
	});

	it("handles null module name", () => {
		const warnSpy = jest.spyOn(logger, "logWarn").mockImplementation(() => {});

		const result = getActivePresentation_(null as unknown as string);

		expect(result).toBeNull();
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it("handles undefined module name", () => {
		const warnSpy = jest.spyOn(logger, "logWarn").mockImplementation(() => {});

		const result = getActivePresentation_(undefined as unknown as string);

		expect(result).toBeNull();
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it("handles empty string module name", () => {
		const warnSpy = jest.spyOn(logger, "logWarn").mockImplementation(() => {});

		const result = getActivePresentation_("");

		expect(result).toBeNull();
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it("handles getActivePresentation throwing", () => {
		jest.spyOn(mockSlidesApp, "getActivePresentation").mockImplementation(() => {
			throw new Error("fail");
		});

		expect(() => getActivePresentation_("test-module")).toThrow();
	});
});
