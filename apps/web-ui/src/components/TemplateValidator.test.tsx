/**
 * TemplateValidator.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateValidator } from "./TemplateValidator";

describe("TemplateValidator", () => {
	it("renders nothing when selectedName is null", () => {
		const { container } = render(<TemplateValidator selectedName={null} />);
		expect(container.innerHTML).toBe("");
	});

	it("renders nothing for unknown function name", () => {
		const { container } = render(
			<TemplateValidator selectedName="nonexistentFn" />,
		);
		expect(container.innerHTML).toBe("");
	});

	it("shows template requirements with expected keys for createLongQuotesSlides", () => {
		render(<TemplateValidator selectedName="createLongQuotesSlides" />);
		expect(screen.getByText("Template Requirements")).toBeInTheDocument();
		expect(screen.getByText("Title slide:")).toBeInTheDocument();
		expect(screen.getByText("Content slide:")).toBeInTheDocument();
		expect(screen.getByText("section-title-text-box")).toBeInTheDocument();
		expect(screen.getByText("addendum-text-box")).toBeInTheDocument();
	});

	it("shows no-template message for applyBackgroundColor", () => {
		render(<TemplateValidator selectedName="applyBackgroundColor" />);
		expect(screen.getByText("This function doesn't need template slides.")).toBeInTheDocument();
	});

	it("expands detailed view when toggle is clicked", async () => {
		render(<TemplateValidator selectedName="createLongQuotesSlides" />);
		expect(screen.queryByText(/Paste your template/)).not.toBeInTheDocument();
		await fireEvent.click(screen.getByText("▸"));
		expect(screen.getByText(/Paste your template/)).toBeInTheDocument();
	});

	it("shows all results as found when all required keys are entered", async () => {
		const user = userEvent.setup();
		render(<TemplateValidator selectedName="createShortQuotesSlides" />);
		await fireEvent.click(screen.getByText("▸"));
		await user.type(
			screen.getByPlaceholderText(/e\.g\./),
			"quote-text-box, addendum-text-box",
		);
		const results = document.querySelectorAll(".tv-result");
		expect(results).toHaveLength(2);
		results.forEach((r) => expect(r).toHaveClass("tv-found"));
	});

	it("shows some results as missing when some keys are missing", async () => {
		const user = userEvent.setup();
		render(<TemplateValidator selectedName="createLongQuotesSlides" />);
		await fireEvent.click(screen.getByText("▸"));
		await user.type(screen.getByPlaceholderText(/e\.g\./), "quote-text-box");
		const missingIcons = document.querySelectorAll(".tv-missing");
		expect(missingIcons.length).toBeGreaterThan(0);
		const foundIcons = document.querySelectorAll(".tv-found");
		expect(foundIcons.length).toBeGreaterThan(0);
	});

	it("shows template keys with groups for createLongQuotesSlides", () => {
		render(<TemplateValidator selectedName="createLongQuotesSlides" />);
		expect(screen.getByText("Title slide:")).toBeInTheDocument();
		expect(screen.getByText("Content slide:")).toBeInTheDocument();
		expect(screen.getByText("section-title-text-box")).toBeInTheDocument();
		expect(screen.getByText("section-subtitle-text-box")).toBeInTheDocument();
		expect(screen.getByText("quote-text-box")).toBeInTheDocument();
		expect(screen.getByText("addendum-text-box")).toBeInTheDocument();
	});

	it("shows template keys for setHeaders", () => {
		render(<TemplateValidator selectedName="setHeaders" />);
		expect(screen.getByText("Header border:")).toBeInTheDocument();
		expect(screen.getByText("Section labels:")).toBeInTheDocument();
		expect(screen.getByText("top-bar-border-key")).toBeInTheDocument();
		expect(screen.getByText("top-bar-topic-1-of-N-text")).toBeInTheDocument();
	});

	it("shows template keys for createSummarySlide", () => {
		render(<TemplateValidator selectedName="createSummarySlide" />);
		expect(screen.getByText("Summary slide:")).toBeInTheDocument();
		expect(screen.getByText("summary-title-text")).toBeInTheDocument();
		expect(screen.getByText("summary-item-1-text")).toBeInTheDocument();
	});

	it("shows template keys for createHighlightVariationSlides", () => {
		render(<TemplateValidator selectedName="createHighlightVariationSlides" />);
		expect(screen.getByText("Point slides:")).toBeInTheDocument();
		expect(screen.getByText("point-1-of-N-text-box")).toBeInTheDocument();
		expect(screen.getByText("point-1-of-N-number-indicator-text-box")).toBeInTheDocument();
	});

	it("shows no-template message for batchReplaceText", () => {
		render(<TemplateValidator selectedName="batchReplaceText" />);
		expect(screen.getByText("This function doesn't need template slides.")).toBeInTheDocument();
	});

	it("shows no-template message for moveSlides", () => {
		render(<TemplateValidator selectedName="moveSlides" />);
		expect(screen.getByText("This function doesn't need template slides.")).toBeInTheDocument();
	});

	it("toggle collapses and re-expands", async () => {
		render(<TemplateValidator selectedName="createShortQuotesSlides" />);
		await fireEvent.click(screen.getByText("▸"));
		expect(screen.getByPlaceholderText(/e\.g\./)).toBeInTheDocument();
		await fireEvent.click(screen.getByText("▾"));
		expect(screen.queryByPlaceholderText(/e\.g\./)).not.toBeInTheDocument();
		await fireEvent.click(screen.getByText("▸"));
		expect(screen.getByPlaceholderText(/e\.g\./)).toBeInTheDocument();
	});

	it("checker input with no match shows all missing", async () => {
		const user = userEvent.setup();
		render(<TemplateValidator selectedName="createShortQuotesSlides" />);
		await fireEvent.click(screen.getByText("▸"));
		await user.type(screen.getByPlaceholderText(/e\.g\./), "no-match-key");
		const missingIcons = document.querySelectorAll(".tv-missing");
		expect(missingIcons.length).toBeGreaterThan(0);
		expect(document.querySelectorAll(".tv-found").length).toBe(0);
	});

	it("checker input with whitespace padding matches trimmed keys", async () => {
		const user = userEvent.setup();
		render(<TemplateValidator selectedName="createShortQuotesSlides" />);
		await fireEvent.click(screen.getByText("▸"));
		await user.type(
			screen.getByPlaceholderText(/e\.g\./),
			"  quote-text-box  ,  addendum-text-box  ",
		);
		const foundIcons = document.querySelectorAll(".tv-found");
		expect(foundIcons.length).toBe(2);
	});

	it("checker input with comma-space splitting handles multiple separators", async () => {
		const user = userEvent.setup();
		render(<TemplateValidator selectedName="createLongQuotesSlides" />);
		await fireEvent.click(screen.getByText("▸"));
		await user.type(
			screen.getByPlaceholderText(/e\.g\./),
			"section-title-text-box, section-subtitle-text-box, quote-text-box, addendum-text-box",
		);
		const foundIcons = document.querySelectorAll(".tv-found");
		expect(foundIcons.length).toBe(4);
	});

	it("clearing checker input removes results", async () => {
		const user = userEvent.setup();
		render(<TemplateValidator selectedName="createShortQuotesSlides" />);
		await fireEvent.click(screen.getByText("▸"));
		const input = screen.getByPlaceholderText(/e\.g\./);
		await user.type(input, "quote-text-box");
		expect(document.querySelectorAll(".tv-result").length).toBeGreaterThan(0);
		await user.clear(input);
		expect(document.querySelectorAll(".tv-result").length).toBe(0);
	});

	it("skips '...' keys when iterating expectedKeys in checker mode", async () => {
		const user = userEvent.setup();
		render(<TemplateValidator selectedName="createBulletSlide" />);
		await fireEvent.click(screen.getByText("▸"));
		await user.type(
			screen.getByPlaceholderText(/e\.g\./),
			"bullet-title-text-box",
		);
		const results = document.querySelectorAll(".tv-result");
		expect(results.length).toBeGreaterThan(0);
		const foundIcons = document.querySelectorAll(".tv-found");
		expect(foundIcons.length).toBe(1);
	});

	it("handles case-insensitive matching", async () => {
		const user = userEvent.setup();
		render(<TemplateValidator selectedName="createShortQuotesSlides" />);
		await fireEvent.click(screen.getByText("▸"));
		await user.type(
			screen.getByPlaceholderText(/e\.g\./),
			"QUOTE-TEXT-BOX, ADDENDUM-TEXT-BOX",
		);
		const foundIcons = document.querySelectorAll(".tv-found");
		expect(foundIcons.length).toBe(2);
	});
});
