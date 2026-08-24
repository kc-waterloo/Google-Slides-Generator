/**
 * tests/functions/create-bullet-slide.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { createBulletSlide } from "../../src/functions/create-bullet-slide";
import { createBulletSlideSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide, createMockPageElement, getMockShapeState } from "../__mocks__/google-apps-script";

beforeEach(() => {
	resetMocks();
});

describe("createBulletSlide", () => {
	it("creates a slide with title and bullets", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box"),
			createMockPageElement("bullet-point-1-text"),
			createMockPageElement("bullet-point-2-text"),
		], "template-bullet-id");

		const { presentation } = buildMockPresentation({
			extraSlides: [templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createBulletSlide({
			title: "Test Title",
			bullets: ["Bullet 1", "Bullet 2"],
			templateSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("returns early when no presentation is active", () => {
		expect(() => {
			createBulletSlide({
				title: "Test",
				bullets: ["Bullet"],
				templateSlideNumber: null,
				insertionSlideNumber: 1,
			});
		}).not.toThrow();
	});

	it("returns early when template slide is not found", () => {
		buildMockPresentation();

		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		createBulletSlide({
			title: "Test",
			bullets: ["Bullet"],
			templateSlideNumber: 99,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("uses custom override keys", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("custom-title"),
			createMockPageElement("custom-bullet-1-text"),
		], "template-custom-id");

		const { presentation } = buildMockPresentation({
			extraSlides: [templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createBulletSlide({
			title: "Custom",
			bullets: ["Point 1"],
			templateSlideNumber: null,
			insertionSlideNumber: 1,
			overrideTitleTextBoxKey: "custom-title",
			overrideBulletPrefix: "custom-bullet-",
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("handles empty bullets array", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box"),
		], "template-empty-id");

		const { presentation } = buildMockPresentation({
			extraSlides: [templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createBulletSlide({
			title: "Empty Bullets",
			bullets: [],
			templateSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("handles empty title string", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box"),
			createMockPageElement("bullet-point-1-text"),
		], "template-empty-id");

		const { presentation } = buildMockPresentation({
			extraSlides: [templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createBulletSlide({
			title: "",
			bullets: ["Bullet 1"],
			templateSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("uses auto-detected template when templateSlideNumber is null", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box"),
			createMockPageElement("bullet-point-1-text"),
		], "template-id");

		const { presentation } = buildMockPresentation({
			extraSlides: [templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createBulletSlide({
			title: "Auto Detect",
			bullets: ["Point 1"],
			templateSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("handles single bullet", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box"),
			createMockPageElement("bullet-point-1-text"),
		], "template-id");

		const { presentation } = buildMockPresentation({
			extraSlides: [templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createBulletSlide({
			title: "Single Bullet",
			bullets: ["Only bullet"],
			templateSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("handles many bullets exceeding template slots", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box"),
			createMockPageElement("bullet-point-1-text"),
			createMockPageElement("bullet-point-2-text"),
		], "template-id");

		buildMockPresentation({
			extraSlides: [templateSlide],
		});

		expect(() => {
			createBulletSlide({
				title: "Many Bullets",
				bullets: ["A", "B", "C", "D", "E"],
				templateSlideNumber: null,
				insertionSlideNumber: 1,
			});
		}).not.toThrow();
	});

	it("applies text style params to title and bullets", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box", "Original Title"),
			createMockPageElement("bullet-point-1-text", "Original Bullet"),
		], "template-style-id");

		const { presentation } = buildMockPresentation({
			extraSlides: [templateSlide],
		});

		jest.spyOn(console, "log").mockImplementation(() => {});

		createBulletSlide({
			title: "Styled Title",
			bullets: ["Styled Bullet"],
			templateSlideNumber: null,
			insertionSlideNumber: 1,
			titleItalic: true,
			bulletItalic: true,
			titleStrikethrough: true,
			bulletStrikethrough: true,
			titleUnderline: true,
			bulletUnderline: true,
			titleFontSize: 36,
			bulletFontSize: 18,
		});

		const newSlide = presentation.getSlides()[0]!;
		const titleEl = newSlide.getPageElements().find(
			el => el.getDescription() === "bullet-title-text-box"
		)!;
		const bulletEl = newSlide.getPageElements().find(
			el => el.getDescription() === "bullet-point-1-text"
		)!;

		const titleState = getMockShapeState(titleEl.asShape());
		const bulletState = getMockShapeState(bulletEl.asShape());

		expect(titleState.text).toBe("Styled Title");
		expect(titleState.italic).toBe(true);
		expect(titleState.strikethrough).toBe(true);
		expect(titleState.underline).toBe(true);
		expect(titleState.fontSize).toBe(36);

		expect(bulletState.text).toBe("Styled Bullet");
		expect(bulletState.italic).toBe(true);
		expect(bulletState.strikethrough).toBe(true);
		expect(bulletState.underline).toBe(true);
		expect(bulletState.fontSize).toBe(18);
	});

	it("does not set text style params when not provided", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box", "Original Title"),
			createMockPageElement("bullet-point-1-text", "Original Bullet"),
		], "template-default-id");

		const { presentation } = buildMockPresentation({
			extraSlides: [templateSlide],
		});

		jest.spyOn(console, "log").mockImplementation(() => {});

		createBulletSlide({
			title: "Default Title",
			bullets: ["Default Bullet"],
			templateSlideNumber: null,
			insertionSlideNumber: 1,
		});

		const newSlide = presentation.getSlides()[0]!;
		const titleEl = newSlide.getPageElements().find(
			el => el.getDescription() === "bullet-title-text-box"
		)!;
		const bulletEl = newSlide.getPageElements().find(
			el => el.getDescription() === "bullet-point-1-text"
		)!;

		const titleState = getMockShapeState(titleEl.asShape());
		const bulletState = getMockShapeState(bulletEl.asShape());

		expect(titleState.italic).toBe(false);
		expect(titleState.strikethrough).toBe(false);
		expect(titleState.underline).toBe(false);
		expect(titleState.fontSize).toBeNull();

		expect(bulletState.italic).toBe(false);
		expect(bulletState.strikethrough).toBe(false);
		expect(bulletState.underline).toBe(false);
		expect(bulletState.fontSize).toBeNull();
	});

	it("uses destructured defaults when called without optional params", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box"),
			createMockPageElement("bullet-point-1-text"),
		], "template-id");

		buildMockPresentation({
			extraSlides: [templateSlide],
		});

		jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => {
			createBulletSlide({ title: "Test", bullets: ["A"] } as never);
		}).not.toThrow();
	});

	it("handles copy failure gracefully", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box"),
			createMockPageElement("bullet-point-1-text"),
		], "template-id");

		const { presentation } = buildMockPresentation({
			extraSlides: [templateSlide],
		});

		presentation.insertSlide = jest.fn(() => null) as never;

		expect(() => {
			createBulletSlide({
				title: "Fail Title",
				bullets: ["Fail bullet"],
				templateSlideNumber: null,
				insertionSlideNumber: 1,
			});
		}).not.toThrow();
	});

	it("validateParams rejects missing required params with exact errors", () => {
		const errors = validateParams(createBulletSlideSchema, {});

		expect(errors).toEqual([
			{ field: "title", message: "title is required" },
			{ field: "bullets", message: "bullets is required" },
		]);
	});

	it("validateParams rejects wrong type for title (number instead of string)", () => {
		const errors = validateParams(createBulletSlideSchema, {
			title: 123,
			bullets: ["Point"],
		});

		expect(errors).toEqual([
			{ field: "title", message: "title must be a string" },
		]);
	});

	it("validateParams rejects wrong type for bullets (string instead of string[])", () => {
		const errors = validateParams(createBulletSlideSchema, {
			title: "Test",
			bullets: "not-an-array",
		});

		expect(errors).toEqual([
			{ field: "bullets", message: "bullets must be an array" },
		]);
	});

	it("validateParams rejects NaN for insertionSlideNumber", () => {
		const errors = validateParams(createBulletSlideSchema, {
			title: "Test",
			bullets: ["Point"],
			insertionSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for insertionSlideNumber", () => {
		const errors = validateParams(createBulletSlideSchema, {
			title: "Test",
			bullets: ["Point"],
			insertionSlideNumber: Infinity,
		});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber must be a finite number" },
		]);
	});

	it("validateParams accepts valid input", () => {
		const errors = validateParams(createBulletSlideSchema, {
			title: "Test",
			bullets: ["Point 1", "Point 2"],
			templateSlideNumber: null,
			insertionSlideNumber: 5,
		});

		expect(errors).toEqual([]);
	});
});
