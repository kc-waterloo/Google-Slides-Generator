/**
 * CodeOutput.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { CodeOutput } from "./CodeOutput";

describe("CodeOutput", () => {
	const originalClipboard = navigator.clipboard;

	beforeEach(() => {
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn().mockResolvedValue(undefined) },
			writable: true,
		});
	});

	afterEach(() => {
		Object.defineProperty(navigator, "clipboard", {
			value: originalClipboard,
			writable: true,
		});
	});

	it("renders code content inside a pre element", () => {
		const { container } = render(<CodeOutput code='SlidesApp.getActivePresentation()' />);
		const pre = container.querySelector(".code-output");
		expect(pre).toBeInTheDocument();
		expect(pre?.textContent).toBe("SlidesApp.getActivePresentation()");
	});

	it("renders syntax highlighting spans for tokens", () => {
		render(<CodeOutput code='SlidesApp.getActivePresentation()' />);
		const pre = document.querySelector(".code-output");
		expect(pre).toBeInTheDocument();
		expect(pre?.querySelector(".hl-punc")).toBeInTheDocument();
	});

	it("copies code to clipboard when copy button is clicked", async () => {
		const code = "createLongQuotesSlides({ longQuoteItems: [] })";
		render(<CodeOutput code={code} />);
		await fireEvent.click(screen.getByText("Copy to Clipboard"));
		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(code);
	});

	it("shows Copied! toast after copy", async () => {
		render(<CodeOutput code="test" />);
		await act(async () => {
			fireEvent.click(screen.getByText("Copy to Clipboard"));
		});
		await vi.waitFor(() => {
			expect(screen.getByText("Copied!")).toBeInTheDocument();
		});
	});

	it("renders empty code string without crashing", () => {
		const { container } = render(<CodeOutput code="" />);
		const pre = container.querySelector(".code-output");
		expect(pre).toBeInTheDocument();
		expect(pre?.textContent).toBe("");
	});

	it("does not crash when clipboard writeText fails", async () => {
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn().mockRejectedValue(new Error("Clipboard denied")) },
			writable: true,
		});
		render(<CodeOutput code="test code" />);
		await act(async () => {
			fireEvent.click(screen.getByText("Copy to Clipboard"));
		});
		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test code");
	});

	it("shows and hides Copied! toast on timeout", async () => {
		vi.useFakeTimers();
		render(<CodeOutput code="test" />);
		await act(async () => {
			fireEvent.click(screen.getByText("Copy to Clipboard"));
		});
		expect(screen.getByText("Copied!")).toBeInTheDocument();
		await act(() => {
			vi.advanceTimersByTime(4000);
		});
		expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
		vi.useRealTimers();
	});

	it("tokenizes string values with hl-string class", () => {
		render(<CodeOutput code='{"key": "value"}' />);
		const strings = document.querySelectorAll(".hl-string");
		expect(strings.length).toBeGreaterThanOrEqual(2);
		expect(strings[1]!.textContent).toBe("\"value\"");
	});

	it("tokenizes numbers with hl-number class", () => {
		render(<CodeOutput code="42" />);
		expect(document.querySelector(".hl-number")).toBeInTheDocument();
		expect(document.querySelector(".hl-number")!.textContent).toBe("42");
	});

	it("tokenizes keywords (true, false, null) with hl-keyword class", () => {
		render(<CodeOutput code="true false null" />);
		const keywords = document.querySelectorAll(".hl-keyword");
		expect(keywords.length).toBe(3);
	});

	it("tokenizes object keys with hl-key class", () => {
		render(<CodeOutput code="key: value" />);
		expect(document.querySelector(".hl-key")).toBeInTheDocument();
		expect(document.querySelector(".hl-key")!.textContent).toBe("key");
	});

	it("tokenizes punctuation with hl-punc class", () => {
		render(<CodeOutput code="{}()[],:" />);
		const punct = document.querySelectorAll(".hl-punc");
		expect(punct.length).toBeGreaterThanOrEqual(1);
	});

	it("handles special characters in code string", () => {
		render(<CodeOutput code="SlidesApp.ThemeColorType.DARK1" />);
		const pre = document.querySelector(".code-output");
		expect(pre).toBeInTheDocument();
		expect(pre!.textContent).toContain("DARK1");
	});

	it("tokenizes numbers with negative sign", () => {
		render(<CodeOutput code="-42" />);
		const numbers = document.querySelectorAll(".hl-number");
		const negativeNum = Array.from(numbers).find((n) => n.textContent === "-42");
		expect(negativeNum).toBeInTheDocument();
	});

	it("tokenizes decimal numbers", () => {
		render(<CodeOutput code="3.14" />);
		expect(document.querySelector(".hl-number")).toBeInTheDocument();
		expect(document.querySelector(".hl-number")!.textContent).toBe("3.14");
	});

	it("tokenizes code with all token types together", () => {
		render(<CodeOutput code='{name: "test", count: 42}' />);
		expect(document.querySelector(".hl-key")).toBeInTheDocument();
		expect(document.querySelector(".hl-string")).toBeInTheDocument();
		expect(document.querySelector(".hl-number")).toBeInTheDocument();
		expect(document.querySelector(".hl-punc")).toBeInTheDocument();
	});

	it("tokenizes negative decimal numbers", () => {
		render(<CodeOutput code="-3.14" />);
		const numbers = document.querySelectorAll(".hl-number");
		const negativeDecimal = Array.from(numbers).find((n) => n.textContent === "-3.14");
		expect(negativeDecimal).toBeInTheDocument();
	});

	it("falls back to execCommand when clipboard API is unavailable", async () => {
		Object.defineProperty(navigator, "clipboard", { value: undefined, writable: true });
		const execCommand = vi.fn();
		Object.defineProperty(document, "execCommand", { value: execCommand, writable: true });

		render(<CodeOutput code="fallback code" />);
		await act(async () => {
			fireEvent.click(screen.getByText("Copy to Clipboard"));
		});
		expect(execCommand).toHaveBeenCalledWith("copy");
	});

	it("tokenizes string with backslash escape", () => {
		render(<CodeOutput code={"\"\\n\""} />);
		const strings = document.querySelectorAll(".hl-string");
		expect(strings.length).toBe(1);
	});

	it("handles dash followed by non-digit (not a number)", () => {
		render(<CodeOutput code="-a" />);
		const puncts = document.querySelectorAll(".hl-punc");
		expect(puncts.length).toBeGreaterThan(0);
	});

	it("handles dash at end of string", () => {
		render(<CodeOutput code="-" />);
		const punct = document.querySelector(".hl-punc");
		expect(punct).toBeInTheDocument();
		expect(punct!.textContent).toBe("-");
	});

	it("tokenizes negative decimal number", () => {
		render(<CodeOutput code="-3.14" />);
		const numbers = document.querySelectorAll(".hl-number");
		const negativeDecimal = Array.from(numbers).find((n) => n.textContent === "-3.14");
		expect(negativeDecimal).toBeInTheDocument();
	});

	it("tokenizes decimal number with leading digit", () => {
		render(<CodeOutput code="3.14" />);
		const number = document.querySelector(".hl-number");
		expect(number).toBeInTheDocument();
		expect(number!.textContent).toBe("3.14");
	});

	it("handles dash followed by non-digit decimal (edge case)", () => {
		render(<CodeOutput code="-." />);
		expect(document.querySelector(".hl-punc")).toBeInTheDocument();
	});

	it("tokenizes object key with space before colon", () => {
		render(<CodeOutput code="key : value" />);
		const keys = document.querySelectorAll(".hl-key");
		const key = Array.from(keys).find((k) => k.textContent === "key");
		expect(key).toBeInTheDocument();
	});

	it("tokenizes non-object-key identifier (word not followed by colon)", () => {
		render(<CodeOutput code="variableName" />);
		const puncts = document.querySelectorAll(".hl-punc");
		const ident = Array.from(puncts).find((n) => n.textContent === "variableName");
		expect(ident).toBeInTheDocument();
	});

	it("does not crash when code is null", () => {
		const code = null as unknown as string;
		const { container } = render(<CodeOutput code={code} />);
		expect(container.querySelector("pre")).toBeTruthy();
	});

	it("tokenizes negative number with trailing decimal point (no following digits)", () => {
		render(<CodeOutput code="-5." />);
		const number = document.querySelector(".hl-number");
		expect(number).toBeInTheDocument();
		expect(number!.textContent).toBe("-5");
		const periods = document.querySelectorAll(".hl-punc");
		const period = Array.from(periods).find((p) => p.textContent === ".");
		expect(period).toBeInTheDocument();
	});

	it("tokenizes positive number with trailing decimal point (no following digits)", () => {
		render(<CodeOutput code="5." />);
		const number = document.querySelector(".hl-number");
		expect(number).toBeInTheDocument();
		expect(number!.textContent).toBe("5");
	});
});
