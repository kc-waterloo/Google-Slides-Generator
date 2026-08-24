/**
 * ImportCallDialog.test.tsx
 *
 * Created by Min-Kyu Lee on 02-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ImportCallDialog } from "../ImportCallDialog";
import type { FunctionSchema } from "@gsg/shared";

const mockSchemas: FunctionSchema[] = [
	{
		name: "createLongQuotesSlides",
		description: "Creates long quotes slides",
		parameters: {
			longQuoteItems: {
				name: "longQuoteItems",
				type: "object[]",
				optional: false,
			},
		},
	},
	{
		name: "createShortQuotesSlides",
		description: "Creates short quotes slides",
		parameters: {
			shortQuoteItems: {
				name: "shortQuoteItems",
				type: "object[]",
				optional: false,
			},
		},
	},
];

describe("ImportCallDialog", () => {
	it("renders textarea and parse button", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		expect(screen.getByPlaceholderText(/createLongQuotesSlides/)).toBeInTheDocument();
		expect(screen.getByText("Parse")).toBeInTheDocument();
		expect(screen.getByText("Cancel")).toBeInTheDocument();
	});

	it("shows error for unparseable input", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "not a function call" },
		});
		fireEvent.click(screen.getByText("Parse"));

		expect(screen.getByText(/Could not parse/)).toBeInTheDocument();
	});

	it("shows error for unknown function name", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "unknownFunction({})" },
		});
		fireEvent.click(screen.getByText("Parse"));

		expect(screen.getByText(/Unknown function/)).toBeInTheDocument();
	});

	it("displays parsed result for a known function", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": [] })" },
		});
		fireEvent.click(screen.getByText("Parse"));

		expect(screen.getByText("Import")).toBeInTheDocument();
		expect(screen.getByText("createLongQuotesSlides", { selector: "strong" })).toBeInTheDocument();
	});

	it("shows Import button and Edit button after parsing", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": [] })" },
		});
		fireEvent.click(screen.getByText("Parse"));

		expect(screen.getByText("Import")).toBeInTheDocument();
		expect(screen.getByText("Edit")).toBeInTheDocument();
	});

	it("calls onImport and onClose when Import is clicked", () => {
		const onImport = vi.fn();
		const onClose = vi.fn();

		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={onImport}
				onClose={onClose}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createShortQuotesSlides({ \"shortQuoteItems\": [] })" },
		});
		fireEvent.click(screen.getByText("Parse"));
		fireEvent.click(screen.getByText("Import"));

		expect(onImport).toHaveBeenCalledWith("createShortQuotesSlides", {
			shortQuoteItems: [],
		});
		expect(onClose).toHaveBeenCalled();
	});

	it("returns to edit mode when Edit is clicked", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": [] })" },
		});
		fireEvent.click(screen.getByText("Parse"));
		fireEvent.click(screen.getByText("Edit"));

		expect(screen.getByText("Parse")).toBeInTheDocument();
		expect(screen.queryByText("Import")).not.toBeInTheDocument();
	});

	it("shows param count with singular form for one param", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": [] })" },
		});
		fireEvent.click(screen.getByText("Parse"));

		expect(screen.getByText(/1 param/)).toBeInTheDocument();
	});

	it("shows param count with plural form for multiple params", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": [], \"extra\": \"val\" })" },
		});
		fireEvent.click(screen.getByText("Parse"));

		expect(screen.getByText(/2 params/)).toBeInTheDocument();
	});

	it("shows zero params when parsed function has no params", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({})" },
		});
		fireEvent.click(screen.getByText("Parse"));

		expect(screen.getByText(/0 params/)).toBeInTheDocument();
	});

	it("calls handleParse via Ctrl+Enter shortcut", () => {
		const { container } = render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		const dialog = container.querySelector(".dialog")!;

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": [] })" },
		});

		fireEvent.keyDown(dialog, {
			key: "Enter",
			ctrlKey: true,
		});

		expect(screen.getByText("Import")).toBeInTheDocument();
	});

	it("calls handleConfirmImport via Ctrl+Enter when parsed", () => {
		const onImport = vi.fn();
		const onClose = vi.fn();

		const { container } = render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={onImport}
				onClose={onClose}
			/>,
		);

		const dialog = container.querySelector(".dialog")!;

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": [] })" },
		});

		fireEvent.keyDown(dialog, {
			key: "Enter",
			ctrlKey: true,
		});

		fireEvent.keyDown(dialog, {
			key: "Enter",
			ctrlKey: true,
		});

		expect(onImport).toHaveBeenCalled();
		expect(onClose).toHaveBeenCalled();
	});

	it("closes dialog on overlay click", () => {
		const onClose = vi.fn();

		const { container } = render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={onClose}
			/>,
		);

		const overlay = container.querySelector(".dialog-overlay")!;
		fireEvent.click(overlay);

		expect(onClose).toHaveBeenCalled();
	});

	it("does not close when clicking inside dialog", () => {
		const onClose = vi.fn();

		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={onClose}
			/>,
		);

		fireEvent.click(screen.getByText("Parse"));

		expect(onClose).not.toHaveBeenCalled();
	});

	it("closes with Escape when parsedResult is null", () => {
		const onClose = vi.fn();

		const { container } = render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={onClose}
			/>,
		);

		fireEvent.keyDown(container.querySelector(".dialog")!, {
			key: "Escape",
		});

		expect(onClose).toHaveBeenCalled();
	});

	it("goes to edit mode with Escape when parsedResult is set", () => {
		const { container } = render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		const dialog = container.querySelector(".dialog")!;

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": [] })" },
		});
		fireEvent.click(screen.getByText("Parse"));

		expect(screen.getByText("Import")).toBeInTheDocument();

		fireEvent.keyDown(dialog, {
			key: "Escape",
		});

		expect(screen.getByText("Parse")).toBeInTheDocument();
		expect(screen.queryByText("Import")).not.toBeInTheDocument();
	});

	it("disables parse button for empty input", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		expect(screen.getByText("Parse")).toBeDisabled();
	});

	it("highlights function name in parsed result", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": [] })" },
		});
		fireEvent.click(screen.getByText("Parse"));

		const boldElements = screen.getAllByText(/createLongQuotesSlides/);
		expect(boldElements.length).toBeGreaterThanOrEqual(1);
	});

	it("renders dialog with dialog-header class wrapper", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		expect(screen.getByText("Paste Function Call")).toBeInTheDocument();
	});

	it("handles Meta+Enter keyboard shortcut", () => {
		const { container } = render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		const dialog = container.querySelector(".dialog")!;

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": [] })" },
		});

		fireEvent.keyDown(dialog, {
			key: "Enter",
			metaKey: true,
		});

		expect(screen.getByText("Import")).toBeInTheDocument();
	});

	it("displays string param values with quotes", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": \"hello\" })" },
		});
		fireEvent.click(screen.getByText("Parse"));

		expect(screen.getByText(/"hello"/)).toBeInTheDocument();
	});

	it("displays non-string param values without quotes", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({ \"longQuoteItems\": 42 })" },
		});
		fireEvent.click(screen.getByText("Parse"));

		expect(screen.getByText("42")).toBeInTheDocument();
	});

	it("does nothing on non-modifier Enter keypress", () => {
		const onImport = vi.fn();
		const { container } = render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={onImport}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({})" },
		});
		fireEvent.keyDown(container.querySelector(".dialog")!, { key: "Enter" });
		expect(screen.getByText("Parse")).toBeInTheDocument();
	});

	it("does nothing on Ctrl+A keypress (modifier without Enter)", () => {
		const onImport = vi.fn();
		const { container } = render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={onImport}
				onClose={vi.fn()}
			/>,
		);
		fireEvent.keyDown(container.querySelector(".dialog")!, { key: "a", ctrlKey: true });
		expect(screen.getByText("Paste Function Call")).toBeInTheDocument();
	});

	it("returns to parse view when Edit is clicked", () => {
		render(
			<ImportCallDialog
				schemas={mockSchemas}
				onImport={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/createLongQuotesSlides/), {
			target: { value: "createLongQuotesSlides({})" },
		});
		fireEvent.click(screen.getByText("Parse"));
		expect(screen.getByText("Edit")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Edit"));
		expect(screen.getByText("Parse")).toBeInTheDocument();
	});

	it("does not crash when schemas is empty array", () => {
		const onImport = vi.fn();
		const onClose = vi.fn();

		const { getByPlaceholderText } = render(
			<ImportCallDialog
				schemas={[]}
				onImport={onImport}
				onClose={onClose}
			/>,
		);

		expect(getByPlaceholderText(/createLongQuotesSlides/)).toBeInTheDocument();
	});

	it("does not crash when onImport is null", () => {
		const schemas = [
			{ name: "createBulletSlide", description: "Creates bullet slides", parameters: { title: { name: "title", type: "string", optional: false, description: "Title" } } },
		];

		const { getByText } = render(
			<ImportCallDialog
				schemas={schemas as FunctionSchema[]}
				onImport={null as unknown as (name: string, params: Record<string, unknown>) => void}
				onClose={vi.fn()}
			/>,
		);

		expect(getByText("Parse")).toBeInTheDocument();
	});

	it("does not crash when onClose is null", () => {
		const schemas = [
			{ name: "createBulletSlide", description: "Creates bullet slides", parameters: { title: { name: "title", type: "string", optional: false, description: "Title" } } },
		];

		const { getByText } = render(
			<ImportCallDialog
				schemas={schemas as FunctionSchema[]}
				onImport={vi.fn()}
				onClose={null as unknown as () => void}
			/>,
		);

		expect(getByText("Parse")).toBeInTheDocument();
	});
});
