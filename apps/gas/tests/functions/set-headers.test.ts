/**
 * tests/functions/set-headers.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { setHeaders } from "../../src/functions/set-headers";
import { setHeadersSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide, createMockPageElement, mockSlidesApp, ThemeColorType } from "../__mocks__/google-apps-script";

beforeEach(() => {
	resetMocks();
});

const suppressLogs = (): void => {
	jest.spyOn(console, "log").mockImplementation(() => {});
};

const createSlides = (count: number): GoogleAppsScript.Slides.Slide[] => {
	return Array.from({ length: count }, (_, i) => createMockSlide([], `slide-${i}`));
};

describe("setHeaders", () => {
	it("processes setHeaderItems without throwing", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-3-text"),
			createMockPageElement("top-bar-topic-2-of-3-text"),
			createMockPageElement("top-bar-topic-3-of-3-text"),
		], "template-header-id");

		const slide1 = createMockSlide([], "slide1");
		const slide2 = createMockSlide([], "slide2");
		const slide3 = createMockSlide([], "slide3");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1, slide2, slide3],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{
						sectionName: "Topic A",
						sectionStartSlideNumber: 1,
						sectionEndSlideNumber: 2,
					},
				],
				headerLength: 3,
			});
		}).not.toThrow();
	});

	it("returns early when no template slide is found", () => {
		buildMockPresentation();

		expect(() => {
			setHeaders({
				templateSlideNumber: 999,
				setHeaderItems: [],
				headerLength: 3,
			});
		}).not.toThrow();
	});

	it("returns early when presentation is null", () => {
		mockSlidesApp.setActivePresentation(null);

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [{ sectionName: "A", sectionStartSlideNumber: 1, sectionEndSlideNumber: 1 }],
				headerLength: 3,
			});
		}).not.toThrow();
	});

	it("advances header base index when conditions are met", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-3-text"),
			createMockPageElement("top-bar-topic-2-of-3-text"),
			createMockPageElement("top-bar-topic-3-of-3-text"),
		], "template-header-id");

		const slide1 = createMockSlide([], "slide1");
		const slide2 = createMockSlide([], "slide2");
		const slide3 = createMockSlide([], "slide3");
		const slide4 = createMockSlide([], "slide4");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1, slide2, slide3, slide4],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{ sectionName: "Topic A", sectionStartSlideNumber: 1, sectionEndSlideNumber: 1 },
					{ sectionName: "Topic B", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
					{ sectionName: "Topic C", sectionStartSlideNumber: 3, sectionEndSlideNumber: 3 },
					{ sectionName: "Topic D", sectionStartSlideNumber: 4, sectionEndSlideNumber: 4 },
				],
				headerLength: 3,
			});
		}).not.toThrow();
	});

	it("handles sectionName undefined items (skips bold/dark text)", () => {
		suppressLogs();

		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text"),
			createMockPageElement("top-bar-topic-2-of-2-text"),
		], "template-header-id");

		const slide1 = createMockSlide([], "slide1");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{ sectionName: undefined, sectionStartSlideNumber: 1, sectionEndSlideNumber: 1 },
				],
				headerLength: 2,
			});
		}).not.toThrow();
	});

	it("handles mixed sectionName and undefined items", () => {
		suppressLogs();

		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-3-text"),
			createMockPageElement("top-bar-topic-2-of-3-text"),
			createMockPageElement("top-bar-topic-3-of-3-text"),
		], "template-header-id");

		buildMockPresentation({
			extraSlides: [templateSlide, ...createSlides(30)],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{ sectionName: undefined, sectionStartSlideNumber: 1, sectionEndSlideNumber: 1 },
					{ sectionName: "Topic A", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
				],
				headerLength: 3,
			});
		}).not.toThrow();
	});

	it("uses destructured defaults when called with empty object", () => {
		suppressLogs();

		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-3-text"),
			createMockPageElement("top-bar-topic-2-of-3-text"),
			createMockPageElement("top-bar-topic-3-of-3-text"),
		], "template-header-id");

		buildMockPresentation({
			extraSlides: [templateSlide, ...createSlides(31)],
		});

		expect(() => setHeaders({} as never)).not.toThrow();
	});

	it("handles all sectionName undefined (empty headerSectionsStrings)", () => {
		suppressLogs();

		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-3-text", "Template Text"),
			createMockPageElement("top-bar-topic-2-of-3-text", "Template Text"),
			createMockPageElement("top-bar-topic-3-of-3-text", "Template Text"),
		], "template-header-id");

		const slide1 = createMockSlide([
			createMockPageElement("top-bar-topic-1-of-3-text", "Stale"),
			createMockPageElement("top-bar-topic-2-of-3-text", "Stale"),
			createMockPageElement("top-bar-topic-3-of-3-text", "Stale"),
		], "slide1");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{ sectionName: undefined, sectionStartSlideNumber: 1, sectionEndSlideNumber: 1 },
					{ sectionName: undefined, sectionStartSlideNumber: 1, sectionEndSlideNumber: 1 },
					{ sectionName: undefined, sectionStartSlideNumber: 1, sectionEndSlideNumber: 1 },
				],
				headerLength: 3,
			});
		}).not.toThrow();
	});

	it("clamps boldedIndex when headerRelativeIndex exceeds headerLength", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text"),
			createMockPageElement("top-bar-topic-2-of-2-text"),
		], "template-header-id");

		buildMockPresentation({
			extraSlides: [templateSlide, ...createSlides(30)],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{ sectionName: "Topic A", sectionStartSlideNumber: 1, sectionEndSlideNumber: 1 },
					{ sectionName: "Topic B", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
					{ sectionName: "Topic C", sectionStartSlideNumber: 3, sectionEndSlideNumber: 3 },
					{ sectionName: "Topic D", sectionStartSlideNumber: 4, sectionEndSlideNumber: 4 },
				],
				headerLength: 2,
			});
		}).not.toThrow();
	});

	it("handles headerLength of 1", () => {
		suppressLogs();

		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-1-text"),
		], "template-header-id");

		const slide1 = createMockSlide([], "slide1");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{ sectionName: "Only Section", sectionStartSlideNumber: 1, sectionEndSlideNumber: 1 },
				],
				headerLength: 1,
			});
		}).not.toThrow();
	});

	it("handles empty setHeaderItems array", () => {
		suppressLogs();

		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-3-text"),
		], "template-header-id");

		buildMockPresentation({
			extraSlides: [templateSlide],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [],
				headerLength: 3,
			});
		}).not.toThrow();
	});

	it("uses default parameter object when called with no arguments", () => {
		suppressLogs();

		buildMockPresentation();

		expect(() => setHeaders()).not.toThrow();
	});

	it("handles sectionEndSlideNumber < sectionStartSlideNumber gracefully", () => {
		suppressLogs();

		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-3-text"),
			createMockPageElement("top-bar-topic-2-of-3-text"),
			createMockPageElement("top-bar-topic-3-of-3-text"),
		], "template-header-id");

		buildMockPresentation({
			extraSlides: [templateSlide, ...createSlides(5)],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{
						sectionName: "Section A",
						sectionStartSlideNumber: 5,
						sectionEndSlideNumber: 3,
					},
				],
				headerLength: 3,
			});
		}).not.toThrow();
	});

	it("uses overrideBorderKey and overrideTopicPrefix", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("custom-border"),
			createMockPageElement("custom-prefix-1-of-2-text"),
			createMockPageElement("custom-prefix-2-of-2-text"),
		], "template-custom-id");

		const slide1 = createMockSlide([], "slide1");

		const { presentation } = buildMockPresentation({
			extraSlides: [templateSlide, slide1],
		});

		setHeaders({
			templateSlideNumber: null,
			setHeaderItems: [
				{ sectionName: "Section A", sectionStartSlideNumber: 3, sectionEndSlideNumber: 3 },
			],
			headerLength: 2,
			overrideBorderKey: "custom-border",
			overrideTopicPrefix: "custom-prefix-",
		});

		const slides = presentation.getSlides();
		const destSlides = slides.filter((s) => s.getObjectId() === "slide1");
		expect(destSlides.length).toBeGreaterThan(0);
	});

	it("handles headerLength of 0", () => {
		suppressLogs();

		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
		], "template-zero-id");

		const slide1 = createMockSlide([], "slide1");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{ sectionName: "A", sectionStartSlideNumber: 3, sectionEndSlideNumber: 3 },
				],
				headerLength: 0,
			});
		}).not.toThrow();
	});

	it("asserts setText is called on destination elements", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text", "Template"),
			createMockPageElement("top-bar-topic-2-of-2-text", "Template"),
		], "template-assert-id");

		const slide1 = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text", "Old"),
			createMockPageElement("top-bar-topic-2-of-2-text", "Old"),
		], "slide1");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1],
		});

		setHeaders({
			templateSlideNumber: null,
			setHeaderItems: [
				{ sectionName: "Section A", sectionStartSlideNumber: 4, sectionEndSlideNumber: 4 },
			],
			headerLength: 2,
		});

		const destShape = slide1.getPageElements()[1]!.asShape();
		expect(destShape.getText().setText).toHaveBeenCalled();
	});

	it("asserts setForegroundColor is called on destination elements", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text", "Template"),
			createMockPageElement("top-bar-topic-2-of-2-text", "Template"),
		], "template-color-assert-id");

		const slide1 = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text", "Old"),
			createMockPageElement("top-bar-topic-2-of-2-text", "Old"),
		], "slide1");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1],
		});

		setHeaders({
			templateSlideNumber: null,
			setHeaderItems: [
				{ sectionName: "Section A", sectionStartSlideNumber: 4, sectionEndSlideNumber: 4 },
			],
			headerLength: 2,
			activeSectionColor: ThemeColorType.ACCENT3 as unknown as GoogleAppsScript.Slides.ThemeColorType,
			inactiveSectionColor: ThemeColorType.ACCENT1 as unknown as GoogleAppsScript.Slides.ThemeColorType,
		});

		const shape = slide1.getPageElements()[2]!.asShape();
		expect(shape.getText().getTextStyle().setForegroundColor).toHaveBeenCalledWith("ACCENT1");
	});

	it("handles sectionStart/End beyond slide array length", () => {
		suppressLogs();

		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-3-text"),
		], "template-outofbounds-id");

		buildMockPresentation({
			extraSlides: [templateSlide],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{
						sectionName: "A",
						sectionStartSlideNumber: 999,
						sectionEndSlideNumber: 999,
					},
				],
				headerLength: 3,
			});
		}).not.toThrow();
	});

	it("applies bold to active section element", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text", "Template"),
			createMockPageElement("top-bar-topic-2-of-2-text", "Template"),
		], "template-bold-id");

		const slide1 = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text", "Old"),
			createMockPageElement("top-bar-topic-2-of-2-text", "Old"),
		], "slide1");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1],
		});

		setHeaders({
			templateSlideNumber: null,
			setHeaderItems: [
				{ sectionName: "Section A", sectionStartSlideNumber: 4, sectionEndSlideNumber: 4 },
			],
			headerLength: 2,
		});

		const shape = slide1.getPageElements()[1]!.asShape();
		expect(shape.getText().getTextStyle().setBold).toHaveBeenCalledWith(true);
	});

	it("applies active section text style params when provided", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text", "Template"),
			createMockPageElement("top-bar-topic-2-of-2-text", "Template"),
		], "template-style-id");

		const slide1 = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text", "Old"),
			createMockPageElement("top-bar-topic-2-of-2-text", "Old"),
		], "slide1");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1],
		});

		setHeaders({
			templateSlideNumber: null,
			setHeaderItems: [
				{ sectionName: "Section A", sectionStartSlideNumber: 4, sectionEndSlideNumber: 4 },
			],
			headerLength: 2,
			activeSectionItalic: true,
			activeSectionStrikethrough: true,
			activeSectionUnderline: true,
			activeSectionFontSize: 18,
		});

		const activeShape = slide1.getPageElements()[1]!.asShape();
		const textStyle = activeShape.getText().getTextStyle();
		expect(textStyle.setItalic).toHaveBeenCalledWith(true);
		expect(textStyle.setStrikethrough).toHaveBeenCalledWith(true);
		expect(textStyle.setUnderline).toHaveBeenCalledWith(true);
		expect(textStyle.setFontSize).toHaveBeenCalledWith(18);
	});

	it("applies inactive section text style params when provided", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text", "Template"),
			createMockPageElement("top-bar-topic-2-of-2-text", "Template"),
		], "template-inactive-id");

		const slide1 = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text", "Old"),
			createMockPageElement("top-bar-topic-2-of-2-text", "Old"),
		], "slide1");

		buildMockPresentation({
			extraSlides: [templateSlide, slide1],
		});

		setHeaders({
			templateSlideNumber: null,
			setHeaderItems: [
				{ sectionName: "Section A", sectionStartSlideNumber: 4, sectionEndSlideNumber: 4 },
			],
			headerLength: 2,
			inactiveSectionItalic: true,
			inactiveSectionStrikethrough: true,
			inactiveSectionUnderline: true,
			inactiveSectionFontSize: 12,
		});

		const inactiveShape = slide1.getPageElements()[2]!.asShape();
		const textStyle = inactiveShape.getText().getTextStyle();
		expect(textStyle.setItalic).toHaveBeenCalledWith(true);
		expect(textStyle.setStrikethrough).toHaveBeenCalledWith(true);
		expect(textStyle.setUnderline).toHaveBeenCalledWith(true);
		expect(textStyle.setFontSize).toHaveBeenCalledWith(12);
	});

	it("handles headerLength > actual header slots in template", () => {
		suppressLogs();

		const templateSlide = createMockSlide([
			createMockPageElement("top-bar-border-key"),
			createMockPageElement("top-bar-topic-1-of-2-text"),
			createMockPageElement("top-bar-topic-2-of-2-text"),
		], "template-short-id");

		buildMockPresentation({
			extraSlides: [templateSlide, ...createSlides(3)],
		});

		expect(() => {
			setHeaders({
				templateSlideNumber: null,
				setHeaderItems: [
					{
						sectionName: "A",
						sectionStartSlideNumber: 1,
						sectionEndSlideNumber: 3,
					},
				],
				headerLength: 2,
			});
		}).not.toThrow();
	});

	it("validateParams rejects wrong type for setHeaderItems (string instead of object[])", () => {
		const errors = validateParams(setHeadersSchema, {
			setHeaderItems: "not-an-array",
		});

		expect(errors).toEqual([
			{ field: "setHeaderItems", message: "setHeaderItems must be an array" },
		]);
	});

	it("validateParams rejects NaN for headerLength", () => {
		const errors = validateParams(setHeadersSchema, {
			setHeaderItems: [{ sectionName: "A", sectionStartSlideNumber: 1, sectionEndSlideNumber: 2 }],
			headerLength: NaN,
		});

		expect(errors).toEqual([
			{ field: "headerLength", message: "headerLength must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for headerLength", () => {
		const errors = validateParams(setHeadersSchema, {
			setHeaderItems: [{ sectionName: "A", sectionStartSlideNumber: 1, sectionEndSlideNumber: 2 }],
			headerLength: Infinity,
		});

		expect(errors).toEqual([
			{ field: "headerLength", message: "headerLength must be a finite number" },
		]);
	});

	it("validateParams rejects string for headerLength (wrong type)", () => {
		const errors = validateParams(setHeadersSchema, {
			setHeaderItems: [{ sectionName: "A", sectionStartSlideNumber: 1, sectionEndSlideNumber: 2 }],
			headerLength: "three",
		});

		expect(errors).toEqual([
			{ field: "headerLength", message: "headerLength must be a finite number" },
		]);
	});

	it("validateParams rejects number for inactiveSectionColor (wrong type for string)", () => {
		const errors = validateParams(setHeadersSchema, {
			setHeaderItems: [{ sectionName: "A", sectionStartSlideNumber: 1, sectionEndSlideNumber: 2 }],
			headerLength: 3,
			inactiveSectionColor: 12345,
		});

		expect(errors).toEqual([
			{ field: "inactiveSectionColor", message: "inactiveSectionColor must be a string" },
		]);
	});

	it("validateParams accepts valid input (all optional params omitted)", () => {
		const errors = validateParams(setHeadersSchema, {});

		expect(errors).toEqual([]);
	});
});
