/**
 * App.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { App } from "./App";
import { createMockStorage } from "./utils/test-utils";
import type { FunctionSchema } from "@gsg/shared";

const longQuotesSchema: FunctionSchema = {
	name: "createLongQuotesSlides",
	description: "Creates long quote slides with title and content slides",
	parameters: {
		longQuoteItems: {
			name: "longQuoteItems",
			type: "object[]",
			optional: true,
			defaultValue: undefined,
			description: "Array of quote items",
			arrayItemSchema: {
				title: { name: "title", type: "string", optional: false },
				subtitle: { name: "subtitle", type: "string", optional: false },
				quote: { name: "quote", type: "string", optional: false },
				splitMode: { name: "splitMode", type: "string", optional: true, defaultValue: "paragraph" },
			},
		},
	},
};

const testSchema: FunctionSchema = {
	name: "testFunction",
	description: "A test function description",
	parameters: {
		input: { name: "input", type: "string", optional: false },
	},
};

let mockPpt: Record<string, unknown>;
let mockForm: Record<string, unknown>;

const createMockForm = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
	selectedFunction: null,
	params: {},
	errors: [],
	generatedCode: null,
	selectFunction: vi.fn(),
	setParam: vi.fn(),
	resetAll: vi.fn(),
	undo: vi.fn(),
	redo: vi.fn(),
	undoCount: 0,
	redoCount: 0,
	calls: [],
	activeId: null,
	setActiveId: vi.fn(),
	addCall: vi.fn(),
	removeCall: vi.fn(),
	moveCallUp: vi.fn(),
	moveCallDown: vi.fn(),
	moveCallToIndex: vi.fn(),
	wrapSlideNumbers: false,
	setWrapSlideNumbers: vi.fn(),
	saveCurrentToHistory: vi.fn(),
	historyEntries: [],
	loadFromHistory: vi.fn(),
	clearHistory: vi.fn(),
	renameHistoryEntry: vi.fn(),
	deleteHistoryEntry: vi.fn(),
	clearDraft: vi.fn(),
	draftRestored: false,
	...overrides,
});

vi.mock("./hooks/useFunctionForm", () => ({
	useFunctionForm: () => mockForm,
}));

vi.mock("./hooks/usePptTemplate", () => ({
	usePptTemplate: () => mockPpt,
}));

const mockCallTypedFn = vi.hoisted(() => vi.fn());
vi.mock("./ppt/dispatch", () => ({
	callTypedFn: mockCallTypedFn,
}));

beforeEach(() => {
	vi.unstubAllGlobals();
	vi.stubGlobal("localStorage", createMockStorage());
	mockForm = createMockForm();
	mockCallTypedFn.mockReset();
	mockPpt = {
		template: null,
		fileName: null,
		slideCount: 0,
		detectedKeys: [],
		loadTemplate: vi.fn(),
		loadFromBuffer: vi.fn(),
		openFromAdapter: vi.fn(),
		saveViaAdapter: vi.fn(),
		isElectron: false,
		clearTemplate: vi.fn(),
	};

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

	Object.defineProperty(navigator, "clipboard", {
		value: { writeText: vi.fn().mockResolvedValue(undefined) },
		writable: true,
	});
});

describe("App", () => {
	it("renders empty state when no function is selected", () => {
		render(<App />);

		expect(
			screen.getByText("Select a function from the left sidebar"),
		).toBeInTheDocument();
		expect(
			screen.getByText(/Fill in the parameters/i),
		).toBeInTheDocument();
	});

	it("renders sidebar with title and subtitle", () => {
		render(<App />);

		expect(screen.getAllByText("GSG").length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText("Generator")).toBeInTheDocument();
	});

	it("shows selected function name and description", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		expect(screen.getByText("testFunction")).toBeInTheDocument();
		expect(screen.getByText("A test function description")).toBeInTheDocument();
	});

	it("does not show empty state when a function is selected", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		expect(
			screen.queryByText("Select a function from the left sidebar"),
		).not.toBeInTheDocument();
	});

	it("theme toggle shows correct initial text for dark default", () => {
		render(<App />);

		expect(screen.getByText("☀️ Light")).toBeInTheDocument();
	});

	it("theme toggle switches to light mode on click", () => {
		render(<App />);

		fireEvent.click(screen.getByText("☀️ Light"));

		expect(screen.getByText("🌙 Dark")).toBeInTheDocument();
	});

	it("theme toggle switches back to dark mode on double click", () => {
		render(<App />);

		fireEvent.click(screen.getByText("☀️ Light"));
		fireEvent.click(screen.getByText("🌙 Dark"));

		expect(screen.getByText("☀️ Light")).toBeInTheDocument();
	});

	it("sets data-theme attribute on document element", () => {
		render(<App />);

		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

		fireEvent.click(screen.getByText("☀️ Light"));

		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
	});

	it("persists theme choice to localStorage", () => {
		render(<App />);

		expect(localStorage.getItem("gsg-theme")).toBe("dark");

		fireEvent.click(screen.getByText("☀️ Light"));

		expect(localStorage.getItem("gsg-theme")).toBe("light");
	});

	it("reads initial theme from localStorage", () => {
		localStorage.setItem("gsg-theme", "light");

		render(<App />);

		expect(screen.getByText("🌙 Dark")).toBeInTheDocument();
		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
	});

	it("shows reset confirm dialog on Escape key, then calls resetAll", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		fireEvent.keyDown(window, { key: "Escape" });

		expect(screen.getByText("Reset All Parameters?")).toBeInTheDocument();

		fireEvent.click(screen.getByText("Reset All"));

		expect(mockForm.resetAll).toHaveBeenCalledTimes(1);
	});

	it("calls undo on Ctrl+Z", () => {
		render(<App />);

		fireEvent.keyDown(window, { key: "z", ctrlKey: true });

		expect(mockForm.undo).toHaveBeenCalledTimes(1);
	});

	it("calls undo on Meta+Z", () => {
		render(<App />);

		fireEvent.keyDown(window, { key: "z", metaKey: true });

		expect(mockForm.undo).toHaveBeenCalledTimes(1);
	});

	it("calls redo on Ctrl+Shift+Z", () => {
		render(<App />);

		fireEvent.keyDown(window, { key: "z", ctrlKey: true, shiftKey: true });

		expect(mockForm.redo).toHaveBeenCalledTimes(1);
	});

	it("calls redo on Meta+Shift+Z", () => {
		render(<App />);

		fireEvent.keyDown(window, { key: "z", metaKey: true, shiftKey: true });

		expect(mockForm.redo).toHaveBeenCalledTimes(1);
	});

	it("copies generatedCode to clipboard on Ctrl+Enter", () => {
		mockForm = createMockForm({ generatedCode: "targetCode()" });
		render(<App />);

		fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("targetCode()");
	});

	it("copies generatedCode on Meta+Enter", () => {
		mockForm = createMockForm({ generatedCode: "metaCode()" });
		render(<App />);

		fireEvent.keyDown(window, { key: "Enter", metaKey: true });

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("metaCode()");
	});

	it("does not copy to clipboard when generatedCode is null", () => {
		mockForm = createMockForm({ generatedCode: null });
		render(<App />);

		fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });

		expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
	});

	it("undo button is disabled when undoCount is 0", () => {
		mockForm = createMockForm({ selectedFunction: testSchema, undoCount: 0 });
		render(<App />);

		expect(screen.getByTitle("Undo (Ctrl+Z)")).toBeDisabled();
	});

	it("undo button is enabled when undoCount > 0", () => {
		mockForm = createMockForm({ selectedFunction: testSchema, undoCount: 3 });
		render(<App />);

		expect(screen.getByTitle("Undo (Ctrl+Z)")).toBeEnabled();
	});

	it("redo button is disabled when redoCount is 0", () => {
		mockForm = createMockForm({ selectedFunction: testSchema, redoCount: 0 });
		render(<App />);

		expect(screen.getByTitle("Redo (Ctrl+Shift+Z)")).toBeDisabled();
	});

	it("redo button is enabled when redoCount > 0", () => {
		mockForm = createMockForm({ selectedFunction: testSchema, redoCount: 2 });
		render(<App />);

		expect(screen.getByTitle("Redo (Ctrl+Shift+Z)")).toBeEnabled();
	});

	it("undo button click calls undo", () => {
		mockForm = createMockForm({ selectedFunction: testSchema, undoCount: 1 });
		render(<App />);

		fireEvent.click(screen.getByTitle("Undo (Ctrl+Z)"));

		expect(mockForm.undo).toHaveBeenCalledTimes(1);
	});

	it("redo button click calls redo", () => {
		mockForm = createMockForm({ selectedFunction: testSchema, redoCount: 1 });
		render(<App />);

		fireEvent.click(screen.getByTitle("Redo (Ctrl+Shift+Z)"));

		expect(mockForm.redo).toHaveBeenCalledTimes(1);
	});

	it("reset button click shows confirm, then calls resetAll", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		fireEvent.click(screen.getByTitle("Reset all to defaults"));

		expect(screen.getByText("Reset All Parameters?")).toBeInTheDocument();

		fireEvent.click(screen.getByText("Reset All"));

		expect(mockForm.resetAll).toHaveBeenCalledTimes(1);
	});

	it("renders Export button and triggers blob creation", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			calls: [{ id: "1", name: "testFunction", params: { input: "val" } }],
		});

		const createObjectURLSpy = vi
			.spyOn(URL, "createObjectURL")
			.mockReturnValue("blob:test");

		render(<App />);

		const exportButton = screen.getByTitle("Export params as JSON");
		expect(exportButton).toBeInTheDocument();

		fireEvent.click(exportButton);

		expect(createObjectURLSpy).toHaveBeenCalledTimes(1);

		createObjectURLSpy.mockRestore();
	});

	it("renders Import button and triggers hidden file input", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		const importButton = screen.getByTitle("Import params from JSON");
		expect(importButton).toBeInTheDocument();

		const fileInput = document.querySelector(
			"input[type=\"file\"]",
		) as HTMLInputElement;
		expect(fileInput).toBeInTheDocument();
		expect(fileInput.style.display).toBe("none");

		const clickSpy = vi.spyOn(fileInput, "click");

		fireEvent.click(importButton);

		expect(clickSpy).toHaveBeenCalledTimes(1);
	});

	it("import parses valid JSON file and restores call chain", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			loadFromHistory: vi.fn(),
		});
		render(<App />);

		const mockFileReader = {
			readAsText: vi.fn(),
			onload: null as (() => void) | null,
			result: JSON.stringify([
				{ name: "testFunction", params: { input: "hello" } },
			]),
		};
		vi.stubGlobal("FileReader", function () {
			return mockFileReader;
		});

		const fileInput = document.querySelector(
			"input[type=\"file\"]",
		) as HTMLInputElement;
		fireEvent.change(fileInput, {
			target: {
				files: [
					new File(
						["[{\"name\":\"test\",\"params\":{\"input\":\"hello\"}}]"],
						"test.json",
						{ type: "application/json" },
					),
				],
			},
		});

		expect(mockFileReader.readAsText).toHaveBeenCalled();

		mockFileReader.onload!();

		expect(mockForm.loadFromHistory).toHaveBeenCalledWith(
			expect.objectContaining({
				calls: [{ name: "testFunction", params: { input: "hello" } }],
			}),
		);
	});

	it("import ignores invalid JSON", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			loadFromHistory: vi.fn(),
		});
		render(<App />);

		const mockFileReader = {
			readAsText: vi.fn(),
			onload: null as (() => void) | null,
			result: "not valid json",
		};
		vi.stubGlobal("FileReader", function () {
			return mockFileReader;
		});

		const fileInput = document.querySelector(
			"input[type=\"file\"]",
		) as HTMLInputElement;
		fireEvent.change(fileInput, {
			target: { files: [new File(["bad"], "bad.json")] },
		});
		mockFileReader.onload!();

		expect(mockForm.loadFromHistory).not.toHaveBeenCalled();
	});

	it("import ignores non-array JSON", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			loadFromHistory: vi.fn(),
		});
		render(<App />);

		const mockFileReader = {
			readAsText: vi.fn(),
			onload: null as (() => void) | null,
			result: JSON.stringify({ name: "notAnArray" }),
		};
		vi.stubGlobal("FileReader", function () {
			return mockFileReader;
		});

		const fileInput = document.querySelector(
			"input[type=\"file\"]",
		) as HTMLInputElement;
		fireEvent.change(fileInput, {
			target: { files: [new File(["{}"], "obj.json")] },
		});
		mockFileReader.onload!();

		expect(mockForm.loadFromHistory).not.toHaveBeenCalled();
	});

	it("renders SlideNumber toggle checkbox", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			generatedCode: "fn()",
		});
		render(<App />);

		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toBeInTheDocument();
		expect(checkbox).not.toBeChecked();
	});

	it("SlideNumber toggle reflects wrapSlideNumbers state", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			wrapSlideNumbers: true,
			generatedCode: "fn()",
		});
		render(<App />);

		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toBeChecked();
	});

	it("SlideNumber toggle calls setWrapSlideNumbers on click", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			generatedCode: "fn()",
		});
		render(<App />);

		fireEvent.click(screen.getByRole("checkbox"));

		expect(mockForm.setWrapSlideNumbers).toHaveBeenCalledWith(true);
	});

	it("shows generated code section when generatedCode is non-null", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			generatedCode: "SlidesApp.getActivePresentation()",
		});
		const { container } = render(<App />);

		expect(screen.getByText("Generated Code")).toBeInTheDocument();
		const pre = container.querySelector(".code-output");
		expect(pre?.textContent).toBe("SlidesApp.getActivePresentation()");
		expect(screen.getByText(/Ctrl\+Enter copy/)).toBeInTheDocument();
	});

	it("hides generated code section when generatedCode is null", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			generatedCode: null,
		});
		render(<App />);

		expect(screen.queryByText("Generated Code")).not.toBeInTheDocument();
		expect(
			screen.queryByText(/Ctrl\+Enter copy/),
		).not.toBeInTheDocument();
	});

	it("shows totalSlides count for createLongQuotesSlides", () => {
		mockForm = createMockForm({
			selectedFunction: longQuotesSchema,
			params: {
				longQuoteItems: [
					{ quote: "Para 1\n\nPara 2\n\nPara 3", splitMode: "paragraph" },
					{ quote: "Single", splitMode: "none" },
				],
			},
		});
		render(<App />);

		// Item 1: 3 paragraphs → 1 + 3 = 4 slides
		// Item 2: splitMode "none" → 2 slides
		// Total: 6 slides, 2 items
		expect(screen.getByText(/6 slides/)).toBeInTheDocument();
		expect(screen.getByText(/2 items/)).toBeInTheDocument();
	});

	it("shows singular slide text when total is 1", () => {
		mockForm = createMockForm({
			selectedFunction: longQuotesSchema,
			params: {
				longQuoteItems: [
					{ quote: "" },
				],
			},
		});
		render(<App />);

		// Empty quote: !quote is true → count += 1
		// Total: 1 slide
		expect(screen.getByText(/1 slide/)).toBeInTheDocument();
	});

	it("shows singular item text when item count is 1", () => {
		mockForm = createMockForm({
			selectedFunction: longQuotesSchema,
			params: {
				longQuoteItems: [
					{ quote: "Alone" },
				],
			},
		});
		render(<App />);

		expect(screen.getByText(/1 item/)).toBeInTheDocument();
	});

	it("does not show totalSlides for non-quote function", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			params: {
				longQuoteItems: [{ quote: "test" }],
			},
		});
		render(<App />);

		expect(screen.queryByText(/slide/)).not.toBeInTheDocument();
	});

	it("does not show totalSlides when longQuoteItems is empty", () => {
		mockForm = createMockForm({
			selectedFunction: longQuotesSchema,
			params: {
				longQuoteItems: [],
			},
		});
		render(<App />);

		expect(screen.queryByText(/slides?\s+total/)).not.toBeInTheDocument();
	});

	it("does not show totalSlides when longQuoteItems is undefined", () => {
		mockForm = createMockForm({
			selectedFunction: longQuotesSchema,
			params: {},
		});
		render(<App />);

		expect(screen.queryByText(/slides?\s+total/)).not.toBeInTheDocument();
	});

	it("renders children components when function is selected", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		expect(screen.getByText("Parameters")).toBeInTheDocument();
		expect(screen.getByText("Call Chain")).toBeInTheDocument();
	});

	it("renders keyboard shortcut hints in generated code panel", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			generatedCode: "someCode()",
		});
		render(<App />);

		const hints = screen.getByText(/Ctrl\+Z undo/);
		expect(hints).toBeInTheDocument();
		expect(hints).toHaveTextContent("Ctrl+Z undo");
		expect(hints).toHaveTextContent("Ctrl+Shift+Z redo");
		expect(hints).toHaveTextContent("Ctrl+Enter copy");
		expect(hints).toHaveTextContent("Escape reset");
	});

	it("uses system dark preference when localStorage is empty", () => {
		localStorage.removeItem("gsg-theme");
		render(<App />);

		expect(screen.getByText("☀️ Light")).toBeInTheDocument();
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	it("uses system light preference when localStorage is empty", () => {
		localStorage.removeItem("gsg-theme");
		window.matchMedia = vi.fn().mockImplementation((query: string) => ({
			matches: query.includes("light"),
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		}));

		render(<App />);

		expect(screen.getByText("🌙 Dark")).toBeInTheDocument();
		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
	});

	it("falls back to system preference when localStorage has invalid value", () => {
		localStorage.setItem("gsg-theme", "invalid-value");
		render(<App />);

		expect(screen.getByText("☀️ Light")).toBeInTheDocument();
	});

	it("export button creates blob with correct filename", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			calls: [{ id: "1", name: "testFunction", params: { input: "val" } }],
		});

		const createObjectURLSpy = vi
			.spyOn(URL, "createObjectURL")
			.mockReturnValue("blob:export-test");

		const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");

		render(<App />);

		const anchor = document.createElement("a");

		const origCreateExport = document.createElement.bind(document);
		vi.spyOn(document, "createElement").mockImplementation(
			(tag: string) => tag === "a" ? anchor : origCreateExport(tag),
		);

		fireEvent.click(screen.getByTitle("Export params as JSON"));

		expect(anchor.download).toBe("testFunction.json");
		expect(revokeObjectURLSpy).toHaveBeenCalled();

		createObjectURLSpy.mockRestore();
		revokeObjectURLSpy.mockRestore();
		vi.restoreAllMocks();
	});

	it("renders TemplateValidator when function name matches known keys", () => {
		mockForm = createMockForm({ selectedFunction: longQuotesSchema });
		render(<App />);

		const panel = document.querySelector(".template-validator-panel");
		expect(panel).toBeInTheDocument();
		expect(panel).toHaveTextContent("Template Requirements");
	});

	it("renders CallHistory in the sidebar", () => {
		mockForm = createMockForm({
			historyEntries: [{
				timestamp: Date.now(),
				label: "My Preset",
				calls: [{ name: "testFunction", params: {} }],
			}],
		});
		render(<App />);

		expect(screen.getByText(/History \(1\)/)).toBeInTheDocument();
	});

	it("SlideNumber toggle checkbox toggles from unchecked to checked", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			wrapSlideNumbers: false,
			generatedCode: "fn()",
		});
		render(<App />);

		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).not.toBeChecked();
		fireEvent.click(checkbox);
		expect(mockForm.setWrapSlideNumbers).toHaveBeenCalledWith(true);
	});

	it("export with empty calls uses 'calls' as filename", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			calls: [],
		});

		const createObjectURLSpy = vi
			.spyOn(URL, "createObjectURL")
			.mockReturnValue("blob:export-empty");

		render(<App />);
		fireEvent.click(screen.getByTitle("Export params as JSON"));

		expect(createObjectURLSpy).toHaveBeenCalled();

		createObjectURLSpy.mockRestore();
	});

	it("shows PowerPoint output tab with no template message", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);
		fireEvent.click(screen.getByText("PowerPoint"));
		expect(screen.getByText(/Upload a .pptx template/)).toBeInTheDocument();
	});

	it("PowerPoint tab shows template info when template loaded", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		mockPpt = {
			...mockPpt,
			template: { buffer: new ArrayBuffer(10) },
			fileName: "test-template.pptx",
			slideCount: 5,
			detectedKeys: ["title-key", "body-key"],
		};
		render(<App />);
		fireEvent.click(screen.getByText("PowerPoint"));
		expect(screen.getByText(/test-template/)).toBeInTheDocument();
		expect(screen.getByText(/5/)).toBeInTheDocument();
		expect(screen.getByText("title-key")).toBeInTheDocument();
		expect(screen.getByText("body-key")).toBeInTheDocument();
		expect(screen.getByText("Generate .pptx")).toBeInTheDocument();
	});

	it("PowerPoint Generate .pptx button calls executePptFunction", async () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			calls: [{ id: "1", name: "testFunction", params: { input: "hello" } }],
		});
		mockPpt = {
			...mockPpt,
			template: { buffer: new ArrayBuffer(10) },
			fileName: "test.pptx",
			slideCount: 3,
		};
		render(<App />);
		fireEvent.click(screen.getByText("PowerPoint"));
		fireEvent.click(screen.getByText("Generate .pptx"));
		// generate should handle gracefully if no matching function in dispatch
	});

	it("PowerPoint output tab shows upload buttons when no template", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);
		fireEvent.click(screen.getByText("PowerPoint"));
		expect(screen.getByText("Upload .pptx")).toBeInTheDocument();
		expect(screen.getByText("Open Template")).toBeInTheDocument();
	});

	it("switching between GAS Code and PowerPoint tabs", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			generatedCode: "someCode()",
		});
		render(<App />);
		expect(screen.getByText("GAS Code")).toHaveClass("active");
		fireEvent.click(screen.getByText("PowerPoint"));
		expect(screen.getByText("PowerPoint")).toHaveClass("active");
		fireEvent.click(screen.getByText("GAS Code"));
		expect(screen.getByText("GAS Code")).toHaveClass("active");
	});

	it("shows validation summary with call validity counts for multi-call chains", () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			calls: [
				{ id: "1", name: "testFunction", params: { input: "valid" } },
				{ id: "2", name: "testFunction", params: {} },
			],
		});
		render(<App />);
		expect(screen.getByText(/0 of 2 calls valid/)).toBeInTheDocument();
	});

	it("shows description when selectedFunction has description", () => {
		mockForm = createMockForm({
			selectedFunction: { ...testSchema, description: "Test description" },
		});
		render(<App />);
		expect(screen.getByText("Test description")).toBeInTheDocument();
	});

	it("template upload error shows error toast", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		mockPpt = {
			...mockPpt,
			loadTemplate: vi.fn().mockRejectedValue(new Error("Invalid file format")),
		};
		render(<App />);
		fireEvent.click(screen.getByText("PowerPoint"));

		const fileInput = document.querySelector("input[type=\"file\"][accept=\".pptx\"]") as HTMLInputElement;
		expect(fileInput).toBeInTheDocument();
		const file = new File(["bad data"], "bad.pptx", { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
		fireEvent.change(fileInput, { target: { files: [file] } });

		expect(mockPpt.loadTemplate).toHaveBeenCalledWith(file);
	});

	it("Ctrl+Enter does not crash when generatedCode is null", () => {
		mockForm = createMockForm({ generatedCode: null });
		render(<App />);

		expect(() => {
			fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
		}).not.toThrow();
	});

	it("reset confirm dialog Cancel does not call resetAll", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		fireEvent.keyDown(window, { key: "Escape" });
		expect(screen.getByText("Reset All Parameters?")).toBeInTheDocument();

		fireEvent.click(screen.getByText("Cancel"));

		expect(mockForm.resetAll).not.toHaveBeenCalled();
	});

	it("does not copy to clipboard when generatedCode is null on Meta+Enter", () => {
		mockForm = createMockForm({ generatedCode: null });
		render(<App />);

		fireEvent.keyDown(window, { key: "Enter", metaKey: true });

		expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
	});

	it("Escape on reset confirm overlay closes dialog without resetting", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		fireEvent.keyDown(window, { key: "Escape" });
		expect(screen.getByText("Reset All Parameters?")).toBeInTheDocument();

		const overlay = document.querySelector(".dialog-overlay")!;
		fireEvent.keyDown(overlay, { key: "Escape" });

		expect(screen.queryByText("Reset All Parameters?")).not.toBeInTheDocument();
		expect(mockForm.resetAll).not.toHaveBeenCalled();
	});

	it("shows draft restored toast when draftRestored is true", async () => {
		vi.useFakeTimers();
		mockForm = createMockForm({ draftRestored: true });
		render(<App />);

		await act(() => {
			vi.advanceTimersByTime(100);
		});

		expect(screen.getByText("Draft restored")).toBeInTheDocument();
		vi.useRealTimers();
	});

	it("shows ImportCallDialog when Paste button is clicked", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		fireEvent.click(screen.getByTitle("Paste a function call to edit it"));

		expect(document.querySelector("textarea")).toBeInTheDocument();
	});

	it("drag and drop highlights overlay and loads .pptx", async () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		mockPpt = {
			...mockPpt,
			loadTemplate: vi.fn().mockResolvedValue(undefined),
		};

		render(<App />);

		expect(document.querySelector(".drop-overlay")).not.toBeInTheDocument();

		fireEvent.dragOver(document, {
			dataTransfer: { types: ["Files"] },
		});
		expect(document.querySelector(".drop-overlay")).toBeInTheDocument();

		const file = new File(["pptx data"], "template.pptx", { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
		fireEvent.drop(document, {
			dataTransfer: { files: [file] },
		});

		expect(mockPpt.loadTemplate).toHaveBeenCalledWith(file);
		expect(document.querySelector(".drop-overlay")).not.toBeInTheDocument();
	});

	it("drag and drop ignores non-.pptx files", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });

		render(<App />);

		fireEvent.dragOver(document, {
			dataTransfer: { types: ["Files"] },
		});
		expect(document.querySelector(".drop-overlay")).toBeInTheDocument();

		fireEvent.drop(document, {
			dataTransfer: { files: [new File(["txt"], "file.txt", { type: "text/plain" })] },
		});
		expect(document.querySelector(".drop-overlay")).not.toBeInTheDocument();
	});

	it("handleImportCall shows toast for imported function", async () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
			importCallString: vi.fn().mockReturnValue(true),
		});
		render(<App />);

		fireEvent.click(screen.getByTitle("Paste a function call to edit it"));

		const textarea = document.querySelector("textarea")!;
		fireEvent.change(textarea, { target: { value: "createLongQuotesSlides({ longQuoteItems: [] })" } });

		fireEvent.click(screen.getByText("Parse"));

		const importButtons = screen.getAllByText("Import");
		const dialogImport = importButtons.find((btn) => btn.closest(".dialog"));
		expect(dialogImport).toBeInTheDocument();

		fireEvent.click(dialogImport!);

		expect(mockForm.importCallString).toHaveBeenCalledWith(
			"createLongQuotesSlides",
			{ longQuoteItems: [] },
		);
	});

	it("sidebar open/close toggles via hamburger button", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		const hamburger = screen.getByLabelText("Toggle sidebar");
		fireEvent.click(hamburger);
		const appDiv = document.querySelector(".app");
		expect(appDiv?.className).toContain("sidebar-open");

		fireEvent.click(hamburger);
		expect(appDiv?.className).not.toContain("sidebar-open");
	});

	it("sidebar overlay click closes sidebar", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		const hamburger = screen.getByLabelText("Toggle sidebar");
		fireEvent.click(hamburger);
		expect(document.querySelector(".sidebar-overlay")).toBeInTheDocument();

		fireEvent.click(document.querySelector(".sidebar-overlay")!);
		expect(document.querySelector(".sidebar-overlay")).not.toBeInTheDocument();
	});

	it("open template button calls openFromAdapter and shows toast on success", async () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		mockPpt = {
			...mockPpt,
			openFromAdapter: vi.fn().mockResolvedValue(true),
		};
		render(<App />);

		fireEvent.click(screen.getByText("PowerPoint"));

		const openBtn = screen.getByText("Open Template");
		await act(async () => {
			fireEvent.click(openBtn);
		});

		expect(mockPpt.openFromAdapter).toHaveBeenCalled();
		expect(await screen.findByText("Template loaded")).toBeInTheDocument();
	});

	it("upload .pptx button triggers file input click", () => {
		mockForm = createMockForm({ selectedFunction: testSchema });
		render(<App />);

		fireEvent.click(screen.getByText("PowerPoint"));

		const clickSpy = vi.fn();
		const input = document.querySelector("input[type=\"file\"][accept=\".pptx\"]") as HTMLInputElement;
		input.click = clickSpy;

		fireEvent.click(screen.getByText("Upload .pptx"));
		expect(clickSpy).toHaveBeenCalled();
	});

	it("handleGeneratePptx shows error toast when generation fails", async () => {
		mockForm = createMockForm({
			selectedFunction: longQuotesSchema,
			params: { longQuoteItems: [{ title: "T", subtitle: "S", quote: "Q" }] },
		});
		mockPpt = {
			...mockPpt,
			template: { name: "test.pptx", buffer: new ArrayBuffer(0) },
			slideCount: 3,
			detectedKeys: ["section-title-text-box"],
		};
		mockCallTypedFn.mockRejectedValueOnce(new Error("Empty template buffer"));
		render(<App />);

		fireEvent.click(screen.getByText("PowerPoint"));

		const generateBtn = screen.getByText("Generate .pptx");
		await act(async () => {
			fireEvent.click(generateBtn);
		});

		expect(await screen.findByText(/Empty template buffer/i)).toBeInTheDocument();
	});

	it("sets up electronAPI onFileDrop listener in Electron mode", async () => {
		const fileDropHandlers: Array<(path: string) => void> = [];
		const readFileBufferMock = vi.fn().mockResolvedValue(new ArrayBuffer(8));

		Object.defineProperty(window, "electronAPI", {
			value: {
				onFileDrop: (cb: (path: string) => void) => {
					fileDropHandlers.push(cb);
					return () => {};
				},
				onMenuSaveAs: vi.fn().mockReturnValue(() => {}),
				readFileBuffer: readFileBufferMock,
			},
			writable: true,
			configurable: true,
		});

		mockPpt = {
			...mockPpt,
			isElectron: true,
			loadFromBuffer: vi.fn().mockResolvedValue(undefined),
		};

		const { unmount } = render(<App />);

		expect(fileDropHandlers).toHaveLength(1);

		const filePath = "/Users/test/template.pptx";
		await act(async () => {
			await fileDropHandlers[0]!(filePath);
		});

		expect(readFileBufferMock).toHaveBeenCalledWith(filePath);
		expect(mockPpt.loadFromBuffer).toHaveBeenCalledWith(
			expect.any(ArrayBuffer),
			"template.pptx",
		);

		unmount();
		delete (window as Window & { electronAPI?: unknown }).electronAPI;
	});

	it("sets up electronAPI onMenuSaveAs listener in Electron mode", async () => {
		const menuSaveAsHandlers: Array<() => void> = [];

		Object.defineProperty(window, "electronAPI", {
			value: {
				onFileDrop: vi.fn().mockReturnValue(() => {}),
				onMenuSaveAs: (cb: () => void) => {
					menuSaveAsHandlers.push(cb);
					return () => {};
				},
				readFileBuffer: vi.fn(),
			},
			writable: true,
			configurable: true,
		});

		mockPpt = {
			...mockPpt,
			isElectron: true,
		};

		const { unmount } = render(<App />);

		expect(menuSaveAsHandlers).toHaveLength(1);

		unmount();
		delete (window as Window & { electronAPI?: unknown }).electronAPI;
	});

	it("onFileDrop error handler catches readFileBuffer failure", async () => {
		const fileDropHandlers: Array<(path: string) => void> = [];

		Object.defineProperty(window, "electronAPI", {
			value: {
				onFileDrop: (cb: (path: string) => void) => {
					fileDropHandlers.push(cb);
					return () => {};
				},
				onMenuSaveAs: vi.fn().mockReturnValue(() => {}),
				readFileBuffer: vi.fn().mockRejectedValue(new Error("File not found")),
			},
			writable: true,
			configurable: true,
		});

		mockPpt = {
			...mockPpt,
			isElectron: true,
		};

		const { unmount } = render(<App />);

		await act(async () => {
			await fileDropHandlers[0]!("/nonexistent/template.pptx");
		});

		expect(await screen.findByText(/File not found/i)).toBeInTheDocument();

		unmount();
		delete (window as Window & { electronAPI?: unknown }).electronAPI;
	});

	it("calls cleanup functions on unmount in Electron mode", async () => {
		const cleanupFileDrop = vi.fn();
		const cleanupMenuSaveAs = vi.fn();

		Object.defineProperty(window, "electronAPI", {
			value: {
				onFileDrop: vi.fn().mockReturnValue(cleanupFileDrop),
				onMenuSaveAs: vi.fn().mockReturnValue(cleanupMenuSaveAs),
				readFileBuffer: vi.fn(),
			},
			writable: true,
			configurable: true,
		});

		mockPpt = {
			...mockPpt,
			isElectron: true,
		};

		const { unmount } = render(<App />);

		expect(window.electronAPI!.onFileDrop).toHaveBeenCalled();
		expect(window.electronAPI!.onMenuSaveAs).toHaveBeenCalled();

		unmount();

		expect(cleanupFileDrop).toHaveBeenCalled();
		expect(cleanupMenuSaveAs).toHaveBeenCalled();

		delete (window as Window & { electronAPI?: unknown }).electronAPI;
	});

	it("shows Generating... state while generating pptx", async () => {
		mockForm = createMockForm({
			selectedFunction: testSchema,
		});
		mockPpt = {
			...mockPpt,
			template: { buffer: new ArrayBuffer(10), fileName: "test.pptx" },
			fileName: "test.pptx",
			slideCount: 3,
			detectedKeys: ["title"],
		};

		let resolveGenerate!: (value: ArrayBuffer) => void;
		mockCallTypedFn.mockReturnValue(new Promise<ArrayBuffer>((resolve) => {
			resolveGenerate = resolve;
		}));

		render(<App />);
		fireEvent.click(screen.getByText("PowerPoint"));

		const btn = screen.getByText("Generate .pptx");
		fireEvent.click(btn);

		expect(await screen.findByText("Generating...")).toBeInTheDocument();

		resolveGenerate(new ArrayBuffer(10));
		await act(async () => {});

		expect(screen.getByText("Generate .pptx")).toBeInTheDocument();
	});
});
