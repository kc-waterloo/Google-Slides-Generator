/**
 * tests/shared/set-background-color.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { setBackgroundColor_ } from "../../src/shared/slide/set-background-color";
import { createMockSlide } from "../__mocks__/google-apps-script";

describe("setBackgroundColor_", () => {
	it("calls setSolidFill with provided color", () => {
		const slide = createMockSlide([], "test-slide");

		setBackgroundColor_({
			slide,
			newColor: SlidesApp.ThemeColorType.ACCENT3 as unknown as GoogleAppsScript.Slides.ThemeColorType,
		});

		expect(slide.getBackground().setSolidFill).toHaveBeenCalledWith("ACCENT3");
	});

	it("silently handles null slide (try/catch)", () => {
		expect(() => {
			setBackgroundColor_({
				slide: null as unknown as GoogleAppsScript.Slides.Slide,
				newColor: SlidesApp.ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType,
			});
		}).not.toThrow();
	});

	it("silently handles undefined slide (try/catch)", () => {
		expect(() => {
			setBackgroundColor_({
				slide: undefined as unknown as GoogleAppsScript.Slides.Slide,
				newColor: SlidesApp.ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType,
			});
		}).not.toThrow();
	});

	it("silently handles getBackground returning null (try/catch)", () => {
		const slide = createMockSlide([], "test-slide");
		(slide as unknown as { getBackground: jest.Mock }).getBackground = jest.fn(() => null);

		expect(() => {
			setBackgroundColor_({
				slide,
				newColor: SlidesApp.ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType,
			});
		}).not.toThrow();
	});

	it("silently handles setSolidFill throwing", () => {
		const slide = createMockSlide([], "test-slide");
		(slide.getBackground() as unknown as { setSolidFill: jest.Mock }).setSolidFill = jest.fn(() => {
			throw new Error("API error");
		});

		expect(() => {
			setBackgroundColor_({
				slide,
				newColor: SlidesApp.ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType,
			});
		}).not.toThrow();
	});

	it("handles null color gracefully", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const slide = createMockSlide([], "test-slide");

		expect(() => {
			setBackgroundColor_({
				slide,
				newColor: null as unknown as GoogleAppsScript.Slides.ThemeColorType,
			});
		}).not.toThrow();
	});

	it("handles undefined color gracefully", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const slide = createMockSlide([], "test-slide");

		expect(() => {
			setBackgroundColor_({
				slide,
				newColor: undefined as unknown as GoogleAppsScript.Slides.ThemeColorType,
			});
		}).not.toThrow();
	});

	it("handles empty string color gracefully", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const slide = createMockSlide([], "test-slide");

		expect(() => {
			setBackgroundColor_({
				slide,
				newColor: "" as unknown as GoogleAppsScript.Slides.ThemeColorType,
			});
		}).not.toThrow();
	});

	it("handles undefined slide (not just null)", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => {
			setBackgroundColor_({
				slide: undefined as unknown as GoogleAppsScript.Slides.Slide,
				newColor: SlidesApp.ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType,
			});
		}).not.toThrow();
	});

	it("handles getBackground returning undefined", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const slide = createMockSlide([], "test-slide");
		(slide.getBackground as jest.Mock).mockReturnValue(undefined);

		expect(() => {
			setBackgroundColor_({
				slide,
				newColor: SlidesApp.ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType,
			});
		}).not.toThrow();
	});
});
