/**
 * App.integration.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { createMockStorage } from "./utils/test-utils";

beforeEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	vi.stubGlobal("localStorage", createMockStorage());

	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});

	document.documentElement.removeAttribute("data-theme");
});

describe("App integration", () => {
	it("full flow: select replaceAll, fill params, see generated code", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByText("replaceAll"));

		expect(screen.getAllByText("replaceAll").length).toBeGreaterThanOrEqual(2);

		await user.click(screen.getByText("Optional (5)"));

		const oldTextInput = screen.getByLabelText(/oldText/);
		await user.clear(oldTextInput);
		await user.type(oldTextInput, "Hello");

		const newTextInput = screen.getByLabelText(/newText/);
		await user.clear(newTextInput);
		await user.type(newTextInput, "World");

		const upperBoundInput = screen.getByLabelText(/upperBoundSlideNumber/);
		await user.clear(upperBoundInput);
		await user.type(upperBoundInput, "10");

		expect(screen.getByText("Generated Code")).toBeInTheDocument();

		const codePanel = screen.getByText("Generated Code").closest("section")!;
		expect(within(codePanel).getByText(/replaceAll/)).toBeInTheDocument();
		expect(within(codePanel).getByText(/Hello/)).toBeInTheDocument();
	});

	it("multi-call chain: add call and switch between calls", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByText("replaceAll"));
		await user.click(screen.getByText("Optional (5)"));

		const oldTextInput = screen.getByLabelText(/oldText/);
		await user.clear(oldTextInput);
		await user.type(oldTextInput, "First call param");

		await user.click(screen.getByTitle("Add another call"));

		await user.click(screen.getByText("setHeaders"));

		await vi.waitFor(() => {
			expect(screen.queryByLabelText(/oldText/)).not.toBeInTheDocument();
			expect(screen.getByText("Sets header bars on a range of slides")).toBeInTheDocument();
		});

		const updatedChainPanel = screen.getByText("Call Chain").closest("section")!;
		await user.click(within(updatedChainPanel).getByText("replaceAll"));

		await user.click(screen.getByText("Optional (5)"));

		expect(screen.getByLabelText(/oldText/)).toBeInTheDocument();
		expect(screen.getByDisplayValue("First call param")).toBeInTheDocument();

		expect(screen.getByText("Generated Code")).toBeInTheDocument();
	});

	it("theme toggle switches between light and dark", async () => {
		const user = userEvent.setup();
		render(<App />);

		expect(screen.getByText("☀️ Light")).toBeInTheDocument();

		await user.click(screen.getByText("☀️ Light"));

		expect(screen.getByText("🌙 Dark")).toBeInTheDocument();
		expect(document.documentElement.getAttribute("data-theme")).toBe("light");

		await user.click(screen.getByText("🌙 Dark"));

		expect(screen.getByText("☀️ Light")).toBeInTheDocument();
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	it("import/export round-trip updates params", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByText("replaceAll"));
		await user.click(screen.getByText("Optional (5)"));

		const oldTextInput = screen.getByLabelText(/oldText/);
		await user.clear(oldTextInput);
		await user.type(oldTextInput, "Original");

		const createObjectURLSpy = vi
			.spyOn(URL, "createObjectURL")
			.mockReturnValue("blob:test");

		await user.click(screen.getByTitle("Export params as JSON"));
		expect(createObjectURLSpy).toHaveBeenCalled();
		createObjectURLSpy.mockRestore();

		const mockFileReader: {
			readAsText: ReturnType<typeof vi.fn>;
			onload: (() => void) | null;
			result: string;
		} = {
			readAsText: vi.fn(),
			onload: null,
			result: JSON.stringify([
				{ name: "replaceAll", params: { oldText: "Imported", newText: "World" } },
			]),
		};
		vi.stubGlobal("FileReader", function () {
			return mockFileReader;
		});

		await user.click(screen.getByTitle("Import params from JSON"));

		const fileInput = document.querySelector(
			"input[type=\"file\"]",
		) as HTMLInputElement;
		fireEvent.change(fileInput, {
			target: {
				files: [
					new File(
						["[{\"name\":\"replaceAll\",\"params\":{\"oldText\":\"Imported\",\"newText\":\"World\"}}]"],
						"test.json",
						{ type: "application/json" },
					),
				],
			},
		});

		expect(mockFileReader.readAsText).toHaveBeenCalled();

		mockFileReader.onload!();

		await vi.waitFor(() => {
			expect(screen.getByDisplayValue("Imported")).toBeInTheDocument();
		});

		vi.unstubAllGlobals();
	});

	it("CallHistory saves and restores params", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByText("replaceAll"));
		await user.click(screen.getByText("Optional (5)"));

		const oldTextInput = screen.getByLabelText(/oldText/);
		await user.clear(oldTextInput);
		await user.type(oldTextInput, "saved value");

		await user.click(screen.getByTitle("Save chain to history"));

		await user.type(
			screen.getByPlaceholderText("Name this preset..."),
			"{Enter}",
		);

		expect(screen.getByText(/History \(1\)/)).toBeInTheDocument();

		await user.click(screen.getByText(/History \(1\)/));

		const historyRoot = document.querySelector(".call-history") as HTMLElement;
		await user.click(within(historyRoot).getByText("replaceAll"));

		await vi.waitFor(() => {
			expect(screen.getByDisplayValue("saved value")).toBeInTheDocument();
		});
	});

	it("shows ppt upload buttons when switching to PowerPoint tab with no template", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByText("replaceAll"));

		const pptTab = screen.getByText("PowerPoint");
		await user.click(pptTab);

		expect(screen.getByText("Upload .pptx")).toBeInTheDocument();
		expect(screen.getByText("Open Template")).toBeInTheDocument();
		expect(screen.getByText(/Or drag and drop/)).toBeInTheDocument();
	});

	it("reset confirm dialog overlay click closes the dialog without resetting", () => {
		render(<App />);

		expect(screen.queryByText("Reset All Parameters?")).not.toBeInTheDocument();

		fireEvent.keyDown(window, { key: "Escape" });
		expect(screen.getByText("Reset All Parameters?")).toBeInTheDocument();

		const overlay = document.querySelector(".dialog-overlay")!;
		fireEvent.click(overlay);

		expect(screen.queryByText("Reset All Parameters?")).not.toBeInTheDocument();
	});

	it("TemplateValidator shows expected keys for createLongQuotesSlides", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByText("createLongQuotesSlides"));

		expect(screen.getByText("Template Requirements")).toBeInTheDocument();

		expect(screen.getByText("section-title-text-box")).toBeInTheDocument();
		expect(screen.getByText("section-subtitle-text-box")).toBeInTheDocument();
		expect(screen.getByText("quote-text-box")).toBeInTheDocument();
		expect(screen.getByText("addendum-text-box")).toBeInTheDocument();

		await user.click(screen.getAllByText("▸")[1]!);

		const checkerInput = screen.getByPlaceholderText(
			"e.g. quote-text-box, addendum-text-box, section-title-text-box",
		);
		expect(checkerInput).toBeInTheDocument();

		await user.type(checkerInput, "quote-text-box, section-title-text-box");

		await vi.waitFor(() => {
			const found = document.querySelectorAll(".tv-result.tv-found");
			expect(found.length).toBeGreaterThanOrEqual(1);
			expect(found[0]).toHaveTextContent("section-title-text-box");
		});
	});

	it("paste flow end-to-end: ImportCallDialog creates real function call", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByText("createBulletSlide"));

		await user.click(screen.getByTitle("Paste a function call to edit it"));

		const textarea = screen.getByPlaceholderText(/createLongQuotesSlides/);
		fireEvent.change(textarea, {
			target: {
				value: "createLongQuotesSlides({ longQuoteItems: [{ title: \"Test Title\", subtitle: \"Test Sub\", quote: \"Test quote text\" }] })",
			},
		});

		await user.click(screen.getByText("Parse"));

		const dialog = document.querySelector(".dialog") as HTMLElement;
		expect(within(dialog).getByText("Import")).toBeInTheDocument();

		await user.click(within(dialog).getByText("Import"));

		expect(
			screen.getByRole("heading", { level: 2, name: "createLongQuotesSlides" }),
		).toBeInTheDocument();

		await user.click(screen.getByText(/Optional/));

		await vi.waitFor(() => {
			expect(screen.getByDisplayValue("Test Title")).toBeInTheDocument();
		});

		expect(screen.getByText("Generated Code")).toBeInTheDocument();
		const codePanel = screen.getByText("Generated Code").closest("section")!;
		expect(within(codePanel).getByText(/createLongQuotesSlides/)).toBeInTheDocument();
	});

	it("removes a call from the chain and reverts view", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByText("replaceAll"));
		await user.click(screen.getByText("Optional (5)"));

		const oldTextInput = screen.getByLabelText(/oldText/);
		await user.clear(oldTextInput);
		await user.type(oldTextInput, "FirstCall");

		await user.click(screen.getByTitle("Add another call"));

		await user.click(screen.getByText("setHeaders"));

		const chainSection = screen.getByText("Call Chain").closest("section")!;
		expect(within(chainSection).getByText("replaceAll")).toBeInTheDocument();
		expect(within(chainSection).getByText("setHeaders")).toBeInTheDocument();

		const removeButtons = within(chainSection).getAllByTitle("Remove");
		await user.click(removeButtons[0]!);

		await vi.waitFor(() => {
			expect(chainSection.querySelectorAll(".call-chain-item")).toHaveLength(0);
		});
	});

	it("deletes a history entry from CallHistory", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByText("replaceAll"));
		await user.click(screen.getByText("Optional (5)"));

		const oldTextInput = screen.getByLabelText(/oldText/);
		await user.clear(oldTextInput);
		await user.type(oldTextInput, "delete test");

		await user.click(screen.getByTitle("Save chain to history"));

		await user.type(
			screen.getByPlaceholderText("Name this preset..."),
			"{Enter}",
		);

		expect(screen.getByText(/History \(1\)/)).toBeInTheDocument();

		await user.click(screen.getByText(/History \(1\)/));

		const historyRoot = document.querySelector(".call-history") as HTMLElement;
		await user.click(within(historyRoot).getByTitle("Delete"));

		await vi.waitFor(() => {
			expect(screen.queryByText(/History/)).not.toBeInTheDocument();
		});
	});
});
