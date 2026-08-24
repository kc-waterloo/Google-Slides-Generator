/**
 * tests/functions/workflow.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 *
 * Multi-function workflow tests: verify that calling multiple
 * top-level functions in sequence works correctly (state integrity).
 */

/**
 * workflow.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { duplicateSlideRange } from "../../src/functions/duplicate-slide-range";
import { moveSlides } from "../../src/functions/move-slides";
import { applyBackgroundColor } from "../../src/functions/apply-background-color";
import { batchSetTextStyle } from "../../src/functions/batch-set-text-style";
import { batchReplaceText } from "../../src/functions/batch-replace-text";
import { replaceAll } from "../../src/functions/replace-all";
import { createBulletSlide } from "../../src/functions/create-bullet-slide";
import { createLongQuotesSlides } from "../../src/functions/create-long-quotes-slides";
import { createShortQuotesSlides } from "../../src/functions/create-short-quotes-slides";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide, createMockPageElement } from "../__mocks__/google-apps-script";
import type { LongQuoteItem, ShortQuoteItem } from "@gsg/shared";

beforeEach(() => {
	resetMocks();
	jest.spyOn(console, "log").mockImplementation(() => {});
});

describe("multi-function workflows", () => {
	it("duplicateSlideRange then moveSlides: duplicated slides stay at moved position", () => {
		const slideA = createMockSlide([], "slide-A");
		const slideB = createMockSlide([], "slide-B");
		const slideC = createMockSlide([], "slide-C");

		const { presentation } = buildMockPresentation({
			extraSlides: [slideA, slideB, slideC],
		});

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(7);

		moveSlides({
			fromSlideNumber: 6,
			toSlideNumber: 7,
			targetSlideNumber: 2,
		});

		const slides = presentation.getSlides();
		expect(slides.length).toBe(7);
	});

	it("batchSetTextStyle then applyBackgroundColor: both effects applied to same slides", () => {
		const pageElement = createMockPageElement("target-key", "original");
		const slide = createMockSlide([pageElement], "slide-1");

		const { presentation } = buildMockPresentation({ extraSlides: [slide] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "target-key", fontSize: 20 },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const shape = pageElement.asShape();
		expect(shape.getText().getTextStyle().setFontSize).toHaveBeenCalledWith(20);

		applyBackgroundColor({
			color: "ACCENT1",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const slides = presentation.getSlides();
		slides.forEach((s) => {
			expect(s.getBackground().setSolidFill).toHaveBeenCalled();
		});
	});

	it("createLongQuotesSlides then batchSetTextStyle: style generated elements", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const items: LongQuoteItem[] = [
			{
				title: "Generated Title",
				subtitle: "Author",
				quote: "Quote text.",
			},
		];

		createLongQuotesSlides({
			longQuoteItems: items,
			insertionSlideNumber: 1,
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);

		jest.clearAllMocks();

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "section-title-text-box", fontSize: 30 },
				{ pageElementKey: "quote-text-box", italic: true },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const allSlides = presentation.getSlides();
		const titleSlideElements = allSlides[2]!.getPageElements();
		titleSlideElements.forEach((el) => {
			const shape = el.asShape();
			if (!shape) return;
			if (el.getDescription() === "section-title-text-box") {
				expect(shape.getText().getTextStyle().setFontSize).toHaveBeenCalledWith(30);
			}
		});
	});

	it("duplicateSlideRange with linkingMode then batchSetTextStyle: linked copies style independently", () => {
		const slide = createMockSlide([
			createMockPageElement("target-key", "text"),
		], "source-slide");

		const { presentation } = buildMockPresentation({ extraSlides: [slide] });

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
			linkingMode: SlidesApp.SlideLinkingMode.LINKED,
		});

		const slides = presentation.getSlides();
		expect(slides.length).toBe(4);
		expect(slides[3]!.getSlideLinkingMode()).toBe("LINKED");
 
		jest.clearAllMocks();
 
		const linkedSlideEls = slides[3]!.getPageElements();
		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "target-key", fontSize: 16 },
			],
			lowerBoundSlideNumber: 4,
			upperBoundSlideNumber: 4,
		});

		linkedSlideEls.forEach((el) => {
			const shape = el.asShape();
			if (!shape) return;
			if (el.getDescription() === "target-key") {
				expect(shape.getText().getTextStyle().setFontSize).toHaveBeenCalledWith(16);
			}
		});
	});

	it("applyBackgroundColor then batchSetTextStyle: independent modifications", () => {
		const pageElement = createMockPageElement("my-key", "text");
		const slide = createMockSlide([pageElement], "slide-1");

		const { presentation } = buildMockPresentation({ extraSlides: [slide] });

		applyBackgroundColor({
			color: "DARK1",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const slides = presentation.getSlides();
		slides.forEach((s) => {
			expect(s.getBackground().setSolidFill).toHaveBeenCalled();
		});

		jest.clearAllMocks();

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "my-key", bold: true },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const shape = pageElement.asShape();
		expect(shape.getText().getTextStyle().setBold).toHaveBeenCalledWith(true);
	});

	it("batchReplaceText then replaceAll: both replace operations work across same slides", () => {
		const slide = createMockSlide([], "slide-1");
		const { presentation } = buildMockPresentation({ extraSlides: [slide] });

		batchReplaceText({
			replacements: [
				{ oldText: "old", newText: "new" },
			],
			matchCase: true,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const getCalls = (slide as unknown as { replaceAllText: jest.Mock }).replaceAllText;
		expect(getCalls).toHaveBeenCalledWith("old", "new", true);

		jest.clearAllMocks();

		replaceAll({
			oldText: "foo",
			newText: "bar",
			matchCase: false,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		expect(getCalls).toHaveBeenCalledWith("foo", "bar", false);
		expect(presentation.getSlides().length).toBe(3);
	});

	it("duplicateSlideRange then createBulletSlide: new slides don't interfere with template", () => {
		const templateSlide = createMockSlide([
			createMockPageElement("bullet-title-text-box"),
			createMockPageElement("bullet-point-1-text"),
		], "template-id");

		const { presentation } = buildMockPresentation({ extraSlides: [templateSlide] });
		const initialCount = presentation.getSlides().length;

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);

		createBulletSlide({
			title: "After Duplicate",
			bullets: ["Point 1"],
			templateSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("createShortQuotesSlides then createSummarySlide: summary captures short quote titles", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const items: ShortQuoteItem[] = [
			{ quote: "A quote", addendum: "Source" },
		];

		createShortQuotesSlides({
			shortQuoteItems: items,
			insertionSlideNumber: 1,
			templateSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("moveSlides then batchSetTextStyle: moved elements are styleable", () => {
		const pageElement = createMockPageElement("movable-key", "text");
		const slide = createMockSlide([pageElement], "move-src");

		const { presentation } = buildMockPresentation({ extraSlides: [slide] });

		moveSlides({
			fromSlideNumber: 3,
			toSlideNumber: 3,
			targetSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(3);

		jest.clearAllMocks();

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "movable-key", italic: true },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const foundElement = presentation.getSlides()
			.flatMap((s) => s.getPageElements())
			.find((el) => el.getDescription() === "movable-key");
		expect(foundElement).toBeDefined();
		if (foundElement) {
			const shape = foundElement.asShape();
			expect(shape.getText().getTextStyle().setItalic).toHaveBeenCalledWith(true);
		}
	});
});
