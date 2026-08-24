/**
 * tests/functions/replace-all.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { replaceAll } from "../../src/functions/replace-all";
import { replaceAllSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide, mockSlidesApp } from "../__mocks__/google-apps-script";

beforeEach(() => {
	resetMocks();
});

describe("replaceAll", () => {
	it("replaces text on slides within the given range", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");

		buildMockPresentation({ extraSlides: [slide1, slide2, slide3] });

		replaceAll({
			oldText: "foo",
			newText: "bar",
			matchCase: false,
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 5,
		});

		expect((slide1 as unknown as { replaceAllText: jest.Mock }).replaceAllText).toHaveBeenCalledWith("foo", "bar", false);
		expect((slide2 as unknown as { replaceAllText: jest.Mock }).replaceAllText).toHaveBeenCalledWith("foo", "bar", false);
		expect((slide3 as unknown as { replaceAllText: jest.Mock }).replaceAllText).toHaveBeenCalledWith("foo", "bar", false);
	});

	it("only replaces text within the specified slide range", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");

		buildMockPresentation({ extraSlides: [slide1, slide2, slide3] });

		replaceAll({
			oldText: "foo",
			newText: "bar",
			matchCase: true,
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
		});

		expect((slide1 as unknown as { replaceAllText: jest.Mock }).replaceAllText).toHaveBeenCalledWith("foo", "bar", true);
		expect((slide2 as unknown as { replaceAllText: jest.Mock }).replaceAllText).not.toHaveBeenCalled();
		expect((slide3 as unknown as { replaceAllText: jest.Mock }).replaceAllText).not.toHaveBeenCalled();
	});

	it("uses destructured defaults when called with empty object", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => replaceAll({} as never)).not.toThrow();
	});

	it("handles null presentation without crashing", () => {
		mockSlidesApp.setActivePresentation(null);

		expect(() => {
			replaceAll({
				oldText: "foo",
				newText: "bar",
				matchCase: false,
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 3,
			});
		}).not.toThrow();
	});

	it("does nothing when lowerBound exceeds upperBound", () => {
		const slide = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide] });

		replaceAll({
			oldText: "foo",
			newText: "bar",
			matchCase: false,
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
		});

		expect((slide as unknown as { replaceAllText: jest.Mock }).replaceAllText).not.toHaveBeenCalled();
	});

	it("uses default parameter object when called with no arguments", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "warn").mockImplementation(() => {});

		expect(() => replaceAll()).not.toThrow();
	});

	it("validateParams rejects NaN for lowerBoundSlideNumber", () => {
		const errors = validateParams(replaceAllSchema, {
			oldText: "a",
			newText: "b",
			lowerBoundSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "lowerBoundSlideNumber", message: "lowerBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for upperBoundSlideNumber", () => {
		const errors = validateParams(replaceAllSchema, {
			oldText: "a",
			newText: "b",
			upperBoundSlideNumber: Infinity,
		});

		expect(errors).toEqual([
			{ field: "upperBoundSlideNumber", message: "upperBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects string for matchCase (wrong type for boolean)", () => {
		const errors = validateParams(replaceAllSchema, {
			oldText: "a",
			newText: "b",
			matchCase: "yes",
		});

		expect(errors).toEqual([
			{ field: "matchCase", message: "matchCase must be a boolean" },
		]);
	});

	it("validateParams accepts valid input (all optional params omitted)", () => {
		const errors = validateParams(replaceAllSchema, {});

		expect(errors).toEqual([]);
	});
});
