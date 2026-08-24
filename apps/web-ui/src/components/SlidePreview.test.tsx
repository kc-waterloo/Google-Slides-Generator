/**
 * SlidePreview.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { SlidePreview } from "./SlidePreview";
import { functionTemplateLayouts, allFunctionNames } from "@gsg/shared";

describe("SlidePreview", () => {
	it("renders heading for a slide-creating function", () => {
		render(<SlidePreview functionName="createLongQuotesSlides" params={{}} />);
		expect(screen.getByText("Slide Preview")).toBeInTheDocument();
	});

	it("shows the first slide type label by default", () => {
		render(<SlidePreview functionName="createLongQuotesSlides" params={{}} />);
		expect(screen.getByText("Title Slide")).toBeInTheDocument();
	});

	it("renders slide description text", () => {
		render(<SlidePreview functionName="createLongQuotesSlides" params={{}} />);
		expect(screen.getByText("1 per item")).toBeInTheDocument();
	});

	it("navigates between slide types with next button", () => {
		render(<SlidePreview functionName="createLongQuotesSlides" params={{}} />);
		expect(screen.getByText("Title Slide")).toBeInTheDocument();
		fireEvent.click(screen.getByLabelText("Next slide type"));
		expect(screen.getByText("Content Slide")).toBeInTheDocument();
	});

	it("navigates back with previous button", () => {
		render(<SlidePreview functionName="createLongQuotesSlides" params={{}} />);
		fireEvent.click(screen.getByLabelText("Next slide type"));
		expect(screen.getByText("Content Slide")).toBeInTheDocument();
		fireEvent.click(screen.getByLabelText("Previous slide type"));
		expect(screen.getByText("Title Slide")).toBeInTheDocument();
	});

	it("disables previous button on first slide", () => {
		render(<SlidePreview functionName="createLongQuotesSlides" params={{}} />);
		expect(screen.getByLabelText("Previous slide type")).toBeDisabled();
	});

	it("disables next button on last slide", () => {
		render(<SlidePreview functionName="createShortQuotesSlides" params={{}} />);
		expect(screen.getByLabelText("Next slide type")).toBeDisabled();
	});

	it("shows no preview message for non-slide function", () => {
		render(<SlidePreview functionName="replaceAll" params={{}} />);
		expect(screen.getByText("No slide preview available for this function")).toBeInTheDocument();
	});

	it("returns null for null functionName", () => {
		const { container } = render(<SlidePreview functionName={null} params={{}} />);
		expect(container.innerHTML).toBe("");
	});

	it("returns null for unknown functionName", () => {
		const { container } = render(<SlidePreview functionName="doesNotExist" params={{}} />);
		expect(container.innerHTML).toBe("");
	});

	it("renders SVG element in the preview", () => {
		const { container } = render(<SlidePreview functionName="createBulletSlide" params={{}} />);
		const svg = container.querySelector(".slide-preview-svg");
		expect(svg).toBeInTheDocument();
	});

	it("shows live param text for bullet slide title", () => {
		render(<SlidePreview functionName="createBulletSlide" params={{ title: "My Title" }} />);
		const svg = document.querySelector(".slide-preview-svg");
		expect(svg?.textContent).toContain("My Title");
	});

	it("shows live param text for long quotes title", () => {
		render(<SlidePreview functionName="createLongQuotesSlides" params={{ longQuoteItems: [{ title: "Hello" }] }} />);
		const svg = document.querySelector(".slide-preview-svg");
		expect(svg?.textContent).toContain("Hello");
	});

	it("renders color from THEME_COLORS map", () => {
		render(<SlidePreview functionName="createBulletSlide" params={{ title: "Test", titleColor: "ACCENT1" }} />);
		const svg = document.querySelector(".slide-preview-svg");
		expect(svg?.innerHTML).toContain("#4472C4");
	});

	it("uses hex color directly when starts with #", () => {
		render(<SlidePreview functionName="createBulletSlide" params={{ title: "Test", titleColor: "#FF0000" }} />);
		const svg = document.querySelector(".slide-preview-svg");
		expect(svg?.innerHTML).toContain("#FF0000");
	});

	it("returns original color string when not in THEME_COLORS and not hex", () => {
		render(<SlidePreview functionName="createBulletSlide" params={{ title: "Test", titleColor: "rgb(255,0,0)" }} />);
		const svg = document.querySelector(".slide-preview-svg");
		expect(svg?.innerHTML).toContain("rgb(255,0,0)");
	});

	it("shows label for elements that have one", () => {
		render(<SlidePreview functionName="createLongQuotesSlides" params={{}} />);
		expect(document.querySelector(".slide-preview-svg")?.textContent).toContain("Title");
	});

	it("shows message for function in allFunctionNames but without layout", () => {
		render(<SlidePreview functionName="batchSetTextStyle" params={{}} />);
		expect(screen.getByText("No slide preview available for this function")).toBeInTheDocument();
	});

	it("shows message for function with empty slides array", () => {
		const originalBullet = { ...functionTemplateLayouts.createBulletSlide };
		(functionTemplateLayouts as Record<string, { slides: unknown[] }>).emptySlidesTest = {
			...originalBullet,
			slides: [],
		};

		render(<SlidePreview functionName="emptySlidesTest" params={{}} />);
		expect(screen.getByText("No slide preview available for this function")).toBeInTheDocument();

		delete (functionTemplateLayouts as Record<string, unknown>).emptySlidesTest;
	});

	it("returns null when function is in allFunctionNames but not in functionTemplateLayouts", () => {
		expect(allFunctionNames.length).toBeGreaterThan(0);
		const candidate = allFunctionNames.find((name) => !functionTemplateLayouts[name]);
		if (candidate) {
			const { container } = render(<SlidePreview functionName={candidate} params={{}} />);
			expect(container.innerHTML).not.toBe("");
		}
	});

	it("does not crash when params is null", () => {
		const { container } = render(
			<SlidePreview
				functionName="createBulletSlide"
				params={null as unknown as Record<string, unknown>}
			/>,
		);

		expect(container.querySelector(".slide-preview")).toBeInTheDocument();
	});

	it("returns null for empty string functionName", () => {
		const { container } = render(
			<SlidePreview
				functionName=""
				params={{}}
			/>,
		);

		expect(container.innerHTML).toBe("");
	});
});
