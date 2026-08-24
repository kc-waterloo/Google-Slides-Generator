/**
 * ArrayEditor.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ArrayEditor } from "./ArrayEditor";
import type { ParamSchema } from "@gsg/shared";

const arraySchema: ParamSchema = {
	name: "longQuoteItems",
	type: "object[]",
	optional: true,
	description: "Array of quote items",
	arrayItemSchema: {
		title: { name: "title", type: "string", optional: false },
		subtitle: { name: "subtitle", type: "string", optional: false },
		quote: { name: "quote", type: "string", optional: false },
	},
};

describe("ArrayEditor", () => {
	it("renders add button when values is empty", () => {
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[]}
				onChange={vi.fn()}
			/>,
		);
		const addBtn = document.querySelector(".array-add-btn");
		expect(addBtn).toBeInTheDocument();
		expect(addBtn).toHaveTextContent(/Add longQuote/);
	});

	it("calls onChange with a new item when add is clicked", () => {
		const onChange = vi.fn();
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[]}
				onChange={onChange}
			/>,
		);
		fireEvent.click(document.querySelector(".array-add-btn")!);
		expect(onChange).toHaveBeenCalledWith([
			{ title: undefined, subtitle: undefined, quote: undefined },
		]);
	});

	it("renders + Add another button on the last item when values exist", () => {
		const values = [{ title: "Hello", subtitle: "World", quote: "Test" }];
		render(
			<ArrayEditor
				schema={arraySchema}
				values={values}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("+ Add another")).toBeInTheDocument();
	});

	it("renders item header with label derived from title", () => {
		const values = [{ title: "Chapter 1", subtitle: "", quote: "" }];
		render(
			<ArrayEditor
				schema={arraySchema}
				values={values}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("#1: Chapter 1")).toBeInTheDocument();
	});

	it("calls onChange with item removed when remove is clicked", () => {
		const values = [
			{ title: "A", subtitle: "", quote: "" },
			{ title: "B", subtitle: "", quote: "" },
		];
		const onChange = vi.fn();
		render(
			<ArrayEditor
				schema={arraySchema}
				values={values}
				onChange={onChange}
			/>,
		);
		const removeButtons = screen.getAllByText("Remove");
		fireEvent.click(removeButtons[0]!);
		expect(onChange).toHaveBeenCalledWith([
			{ title: "B", subtitle: "", quote: "" },
		]);
	});

	it("calls onChange with duplicated item when duplicate is clicked", () => {
		const values = [{ title: "A", subtitle: "Sub", quote: "Quote" }];
		const onChange = vi.fn();
		render(
			<ArrayEditor
				schema={arraySchema}
				values={values}
				onChange={onChange}
			/>,
		);
		fireEvent.click(screen.getByText("Duplicate"));
		expect(onChange).toHaveBeenCalledWith([
			{ title: "A", subtitle: "Sub", quote: "Quote" },
			{ title: "A", subtitle: "Sub", quote: "Quote" },
		]);
	});

	it("duplicates an item", () => {
		const values = [
			{ title: "First", subtitle: "", quote: "" },
			{ title: "Second", subtitle: "", quote: "" },
		];
		const onChange = vi.fn();
		render(
			<ArrayEditor
				schema={arraySchema}
				values={values}
				onChange={onChange}
			/>,
		);
		const duplicateButtons = screen.getAllByText("Duplicate");
		fireEvent.click(duplicateButtons[0]!);
		expect(onChange).toHaveBeenCalledWith([
			{ title: "First", subtitle: "", quote: "" },
			{ title: "First", subtitle: "", quote: "" },
			{ title: "Second", subtitle: "", quote: "" },
		]);
	});

	const splitSchema: ParamSchema = {
		name: "splitItems",
		type: "object[]",
		optional: true,
		arrayItemSchema: {
			title: { name: "title", type: "string", optional: false },
			splitMode: { name: "splitMode", type: "string", optional: true, defaultValue: "paragraph" },
			splitMaxChars: { name: "splitMaxChars", type: "number", optional: true, defaultValue: 500 },
		},
	};

	it("displays splitMaxChars field only when splitMode is char-count", () => {
		const { rerender } = render(
			<ArrayEditor
				schema={splitSchema}
				values={[{ title: "Test", splitMode: "paragraph", splitMaxChars: 500 }]}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.queryByLabelText(/splitMaxChars/)).not.toBeInTheDocument();
		expect(screen.getByLabelText(/splitMode/)).toBeInTheDocument();

		rerender(
			<ArrayEditor
				schema={splitSchema}
				values={[{ title: "Test", splitMode: "char-count", splitMaxChars: 500 }]}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByLabelText(/splitMaxChars/)).toBeInTheDocument();
	});

	it("sets correct header label from quote field", () => {
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ title: undefined, subtitle: "", quote: "Famous last words" }]}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("#1: Famous last words")).toBeInTheDocument();
	});

	it("shows Bulk import button when values exist", () => {
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ title: "T", subtitle: "", quote: "" }]}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("Bulk import")).toBeInTheDocument();
	});

	it("removing last item shows empty state add button again", () => {
		const onChange = vi.fn();
		const { rerender } = render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ title: "Only", subtitle: "", quote: "" }]}
				onChange={onChange}
			/>,
		);

		fireEvent.click(screen.getByText("Remove"));
		expect(onChange).toHaveBeenCalledWith([]);

		rerender(
			<ArrayEditor
				schema={arraySchema}
				values={[]}
				onChange={onChange}
			/>,
		);
		expect(screen.getByText(/Add longQuote/)).toBeInTheDocument();
	});

	it("header label falls back to sectionName when title and quote missing", () => {
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ title: undefined, subtitle: "", quote: undefined, sectionName: "Intro" }]}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("#1: Intro")).toBeInTheDocument();
	});

	it("header label uses default format when none of title/quote/sectionName present", () => {
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ subtitle: "Only" }]}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("Item #1")).toBeInTheDocument();
	});

	it("nested arrayItemSchema with custom fields renders ParamInput for each", () => {
		const nestedSchema: ParamSchema = {
			name: "customItems",
			type: "object[]",
			optional: true,
			arrayItemSchema: {
				key: { name: "key", type: "string", optional: false, description: "A key" },
				value: { name: "value", type: "number", optional: false, description: "A value" },
			},
		};

		render(
			<ArrayEditor
				schema={nestedSchema}
				values={[{ key: "hello", value: 42 }]}
				onChange={vi.fn()}
			/>,
		);

		expect(screen.getByText("A key")).toBeInTheDocument();
		expect(screen.getByText("A value")).toBeInTheDocument();
		expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
		expect(screen.getByDisplayValue("42")).toBeInTheDocument();
	});

	it("handleBulkImport with whitespace-only text does not call onChange", () => {
		const onChange = vi.fn();
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ title: "Existing", subtitle: "Item", quote: "Yes" }]}
				onChange={onChange}
			/>,
		);
		onChange.mockClear();

		fireEvent.click(screen.getByText("Bulk import"));

		const textarea = document.querySelector(".bulk-import-input")!;
		fireEvent.change(textarea, { target: { value: "   \n  \n   " } });

		fireEvent.click(screen.getByText(/Import.*items/));
		expect(onChange).not.toHaveBeenCalled();
	});

	it("parses TSV bulk import and calls onChange with parsed items", () => {
		const onChange = vi.fn();
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ title: "Existing", subtitle: "Item", quote: "Yes" }]}
				onChange={onChange}
			/>,
		);

		fireEvent.click(screen.getByText("Bulk import"));

		const textarea = document.querySelector(".bulk-import-input")!;
		fireEvent.change(textarea, {
			target: { value: "Title1\tSub1\tQuote1\nTitle2\tSub2\tQuote2" },
		});

		fireEvent.click(screen.getByText(/Import.*items/));

		expect(onChange).toHaveBeenCalledWith([
			{ title: "Existing", subtitle: "Item", quote: "Yes" },
			{ title: "Title1", subtitle: "Sub1", quote: "Quote1" },
			{ title: "Title2", subtitle: "Sub2", quote: "Quote2" },
		]);
	});

	it("disables import button when bulk textarea is empty", () => {
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ title: "T", subtitle: "", quote: "" }]}
				onChange={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByText("Bulk import"));

		const importBtn = screen.getByText(/Import.*items/);
		expect(importBtn).toBeDisabled();

		const textarea = document.querySelector(".bulk-import-input")!;
		fireEvent.change(textarea, {
			target: { value: "New\tItem\tQuote" },
		});
		expect(importBtn).not.toBeDisabled();

		fireEvent.change(textarea, {
			target: { value: "" },
		});
		expect(importBtn).toBeDisabled();
	});

	it("displays validation errors passed via errors prop", () => {
		const errors = [
			{ field: "longQuoteItems[0].title", message: "Title is required" },
			{ field: "longQuoteItems[0].quote", message: "Quote is too long" },
		];

		render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ title: "", subtitle: "", quote: "" }]}
				onChange={vi.fn()}
				errors={errors}
			/>,
		);

		expect(screen.getByText("Title is required")).toBeInTheDocument();
		expect(screen.getByText("Quote is too long")).toBeInTheDocument();
		expect(document.querySelectorAll(".field-error").length).toBe(2);
	});

	it("calls onChange with updated value when editing a field in an item", () => {
		const onChange = vi.fn();
		const values = [{ title: "Hello", subtitle: "World", quote: "Original" }];
		render(
			<ArrayEditor
				schema={arraySchema}
				values={values}
				onChange={onChange}
			/>,
		);
		const titleInput = screen.getByDisplayValue("Hello");
		fireEvent.change(titleInput, { target: { value: "Changed" } });
		expect(onChange).toHaveBeenCalledWith([
			{ title: "Changed", subtitle: "World", quote: "Original" },
		]);
	});

	it("bulk import with empty whitespace-only text does not call onChange", () => {
		const onChange = vi.fn();
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ title: "Existing", subtitle: "Item", quote: "Yes" }]}
				onChange={onChange}
			/>,
		);
		expect(onChange).toHaveBeenCalledTimes(0);
		fireEvent.click(screen.getByText("Bulk import"));
		const textarea = document.querySelector(".bulk-import-input")!;
		fireEvent.change(textarea, { target: { value: "   \n  \n  " } });
		fireEvent.click(screen.getByText(/Import.*items/));
		expect(onChange).toHaveBeenCalledTimes(0);
	});

	it("adds empty item when no arrayItemSchema exists", () => {
		const onChange = vi.fn();
		const noItemSchema = {
			name: "longQuoteItems",
			type: "object[]",
			optional: true,
		} as const;
		render(
			<ArrayEditor
				schema={noItemSchema}
				values={[]}
				onChange={onChange}
			/>,
		);
		fireEvent.click(screen.getByText(/Add longQuote/));
		expect(onChange).toHaveBeenCalledWith([{}]);
	});

	it("edits a specific item without affecting other items in multi-item array", () => {
		const onChange = vi.fn();
		const values = [
			{ title: "First", subtitle: "A", quote: "Q1" },
			{ title: "Second", subtitle: "B", quote: "Q2" },
		];
		render(
			<ArrayEditor
				schema={arraySchema}
				values={values}
				onChange={onChange}
			/>,
		);
		const titleInputs = screen.getAllByDisplayValue("First");
		const firstTitle = titleInputs[0]!;
		fireEvent.change(firstTitle, { target: { value: "Changed" } });
		expect(onChange).toHaveBeenCalledWith([
			{ title: "Changed", subtitle: "A", quote: "Q1" },
			{ title: "Second", subtitle: "B", quote: "Q2" },
		]);
	});

	it("renders correct input types for boolean and number fields in arrayItemSchema", () => {
		const mixedSchema = {
			name: "mixedItems",
			type: "object[]",
			optional: true,
			arrayItemSchema: {
				label: { name: "label", type: "string", optional: false },
				count: { name: "count", type: "number", optional: false },
				active: { name: "active", type: "boolean", optional: false },
			},
		} as const;

		render(
			<ArrayEditor
				schema={mixedSchema}
				values={[{ label: "Test", count: 5, active: true }]}
				onChange={vi.fn()}
			/>,
		);

		expect(screen.getByLabelText(/label/)).toBeInTheDocument();
		expect(screen.getByLabelText(/label/).tagName).toBe("INPUT");
		expect(screen.getByLabelText(/label/)).toHaveAttribute("type", "text");

		expect(screen.getByLabelText(/count/)).toHaveAttribute("type", "number");

		expect(screen.getByLabelText(/active/)).toHaveAttribute("type", "checkbox");
		expect(screen.getByLabelText(/active/)).toBeChecked();
	});

	it("bulk import with no arrayItemSchema renders hint and imports items", () => {
		const onChange = vi.fn();
		const noItemSchema = {
			name: "noItems",
			type: "object[]",
			optional: true,
		} as const;

		render(
			<ArrayEditor
				schema={noItemSchema}
				values={[{ title: "Existing" }]}
				onChange={onChange}
			/>,
		);
		onChange.mockClear();

		fireEvent.click(screen.getByText("Bulk import"));
		expect(document.querySelector(".bulk-import-input")).toBeInTheDocument();

		const textarea = document.querySelector(".bulk-import-input")!;
		fireEvent.change(textarea, { target: { value: "Line1\nLine2" } });
		fireEvent.click(screen.getByText(/Import.*items/));
		expect(onChange).toHaveBeenCalledWith([
			{ title: "Existing" },
			{},
			{},
		]);
	});

	it("bulk import TSV line with fewer columns than fields uses empty string fallback", () => {
		const onChange = vi.fn();
		render(
			<ArrayEditor
				schema={arraySchema}
				values={[{ title: "Existing", subtitle: "Item", quote: "Yes" }]}
				onChange={onChange}
			/>,
		);
		onChange.mockClear();

		fireEvent.click(screen.getByText("Bulk import"));

		const textarea = document.querySelector(".bulk-import-input")!;
		fireEvent.change(textarea, {
			target: { value: "OnlyTitle" },
		});

		fireEvent.click(screen.getByText(/Import.*items/));
		expect(onChange).toHaveBeenCalledWith([
			{ title: "Existing", subtitle: "Item", quote: "Yes" },
			{ title: "OnlyTitle", subtitle: "", quote: "" },
		]);
	});

	it("does not crash when values is null", () => {
		const schema = { name: "items", type: "object[]" as const, optional: false, arrayItemSchema: { title: { name: "title", type: "string" as const, optional: false } } };

		const { getByText } = render(
			<ArrayEditor
				schema={schema}
				values={null as unknown as Record<string, unknown>[]}
				onChange={vi.fn()}
			/>,
		);

		expect(getByText(/\+ Add/)).toBeInTheDocument();
	});
});
