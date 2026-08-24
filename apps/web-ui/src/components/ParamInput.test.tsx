/**
 * ParamInput.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ParamInput } from "./ParamInput";
import type { ParamSchema } from "@gsg/shared";

describe("ParamInput", () => {
	it("renders a text input for string type", () => {
		render(
			<ParamInput
				schema={{ name: "title", type: "string", optional: false }}
				value="Hello"
				onChange={vi.fn()}
			/>,
		);
		const input = screen.getByLabelText(/title/);
		expect(input).toHaveValue("Hello");
	});

	it("renders a number input for number type", () => {
		render(
			<ParamInput
				schema={{ name: "count", type: "number", optional: false }}
				value={42}
				onChange={vi.fn()}
			/>,
		);
		const input = screen.getByLabelText(/count/);
		expect(input).toHaveAttribute("type", "number");
	});

	it("renders a checkbox for boolean type", () => {
		render(
			<ParamInput
				schema={{ name: "active", type: "boolean", optional: false }}
				value={true}
				onChange={vi.fn()}
			/>,
		);
		const input = screen.getByLabelText(/active/);
		expect(input).toHaveAttribute("type", "checkbox");
		expect(input).toBeChecked();
	});

	it("displays description text when provided", () => {
		render(
			<ParamInput
				schema={{
					name: "title",
					type: "string",
					optional: false,
					description: "The main title text",
				}}
				value=""
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("The main title text")).toBeInTheDocument();
	});

	it("shows validation error messages", () => {
		render(
			<ParamInput
				schema={{ name: "title", type: "string", optional: false }}
				value=""
				onChange={vi.fn()}
				errors={["title is required", "title must be at least 3 chars"]}
			/>,
		);
		expect(screen.getByText("title is required")).toBeInTheDocument();
		expect(screen.getByText("title must be at least 3 chars")).toBeInTheDocument();
	});

	it("shows (optional) suffix in label for optional params", () => {
		render(
			<ParamInput
				schema={{ name: "color", type: "string", optional: true, defaultValue: "red" }}
				value=""
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("Color")).toBeInTheDocument();
	});

	it("renders a select for splitMode", () => {
		render(
			<ParamInput
				schema={{ name: "splitMode", type: "string", optional: true, defaultValue: "paragraph" }}
				value="paragraph"
				onChange={vi.fn()}
			/>,
		);
		const select = screen.getByLabelText(/splitMode/);
		expect(select.tagName).toBe("SELECT");
	});

	it("renders a textarea for multiline string values", () => {
		render(
			<ParamInput
				schema={{ name: "quote", type: "string", optional: false }}
				value="Line one\nLine two"
				onChange={vi.fn()}
			/>,
		);
		const textarea = screen.getByLabelText(/quote/);
		expect(textarea.tagName).toBe("TEXTAREA");
	});

	it("renders textarea for multiline text params", () => {
		render(
			<ParamInput
				schema={{ name: "quote", type: "string", optional: false }}
				value="Single line"
				onChange={vi.fn()}
			/>,
		);
		const textarea = screen.getByLabelText(/quote/);
		expect(textarea.tagName).toBe("TEXTAREA");
	});

	it("renders select dropdown for splitMode", () => {
		render(
			<ParamInput
				schema={{ name: "splitMode", type: "string", optional: true, defaultValue: "paragraph" }}
				value="paragraph"
				onChange={vi.fn()}
			/>,
		);
		const select = screen.getByLabelText(/splitMode/);
		expect(select.tagName).toBe("SELECT");
		expect(select.querySelectorAll("option")).toHaveLength(4);
	});

	it("displays optional label with code name", () => {
		render(
			<ParamInput
				schema={{ name: "count", type: "number", optional: true }}
				value={undefined}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("Count")).toBeInTheDocument();
		expect(screen.getByText("count")).toBeInTheDocument();
	});

	it("shows error message when provided", () => {
		render(
			<ParamInput
				schema={{ name: "title", type: "string", optional: false }}
				value=""
				onChange={vi.fn()}
				errors={["title is required"]}
			/>,
		);
		expect(screen.getByText("title is required")).toBeInTheDocument();
	});

	it("renders textarea for value with newlines", () => {
		const value = "line1\nline2\nline3";
		render(
			<ParamInput
				schema={{ name: "quote", type: "string", optional: false }}
				value={value}
				onChange={vi.fn()}
			/>,
		);
		const textarea = document.querySelector("textarea");
		expect(textarea).toBeInTheDocument();
		expect(textarea).toHaveValue(value);
	});

	it("renders number input with undefined value as empty", () => {
		render(
			<ParamInput
				schema={{ name: "count", type: "number", optional: true }}
				value={undefined}
				onChange={vi.fn()}
			/>,
		);
		const input = screen.getByRole("spinbutton") as HTMLInputElement;
		expect(input.value).toBe("");
	});

	it("renders select with all splitMode options", () => {
		render(
			<ParamInput
				schema={{ name: "splitMode", type: "string", optional: true }}
				value="paragraph"
				onChange={vi.fn()}
			/>,
		);
		const select = screen.getByRole("combobox");
		expect(select).toBeInTheDocument();
		const options = select.querySelectorAll("option");
		expect(options.length).toBe(4);
	});

	it("renders boolean checkbox with false value", () => {
		render(
			<ParamInput
				schema={{ name: "matchCase", type: "boolean", optional: true }}
				value={false}
				onChange={vi.fn()}
			/>,
		);
		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toBeInTheDocument();
		expect(checkbox).not.toBeChecked();
	});

	it("renders number input with value 0", () => {
		render(
			<ParamInput
				schema={{ name: "index", type: "number", optional: false }}
				value={0}
				onChange={vi.fn()}
			/>,
		);
		const input = screen.getByLabelText(/index/) as HTMLInputElement;
		expect(input).toHaveAttribute("type", "number");
		expect(input.value).toBe("0");
	});

	it("renders number input with negative value", () => {
		render(
			<ParamInput
				schema={{ name: "offset", type: "number", optional: false }}
				value={-5}
				onChange={vi.fn()}
			/>,
		);
		const input = screen.getByLabelText(/offset/) as HTMLInputElement;
		expect(input.value).toBe("-5");
	});

	it("renders boolean checkbox with undefined value (unchecked)", () => {
		render(
			<ParamInput
				schema={{ name: "flag", type: "boolean", optional: true }}
				value={undefined}
				onChange={vi.fn()}
			/>,
		);
		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).not.toBeChecked();
	});

	it("shows placeholder text when default value exists", () => {
		render(
			<ParamInput
				schema={{ name: "title", type: "string", optional: true, defaultValue: "My Title" }}
				value={undefined}
				onChange={vi.fn()}
			/>,
		);
		const input = screen.getByLabelText(/title/);
		expect(input).toHaveAttribute("placeholder", "default: \"My Title\"");
	});

	it("shows quote preview with multi-paragraph text", () => {
		render(
			<ParamInput
				schema={{ name: "quote", type: "string", optional: false }}
				value={"First paragraph.\n\nSecond paragraph.\n\nThird paragraph."}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText(/3 paragraphs/)).toBeInTheDocument();
		expect(screen.getByText(/4 slides per item/)).toBeInTheDocument();
	});

	it("shows input-error class when errors exist", () => {
		render(
			<ParamInput
				schema={{ name: "bad", type: "string", optional: false }}
				value=""
				onChange={vi.fn()}
				errors={["error text"]}
			/>,
		);
		const input = screen.getByLabelText(/bad/);
		expect(input.className).toContain("input-error");
	});

	it("does not show quote preview for empty text", () => {
		render(
			<ParamInput
				schema={{ name: "quote", type: "string", optional: false }}
				value=""
				onChange={vi.fn()}
			/>,
		);
		expect(screen.queryByText(/chars/)).not.toBeInTheDocument();
		expect(screen.queryByText(/paragraph/)).not.toBeInTheDocument();
	});

	it("does not show quote preview for whitespace-only text", () => {
		const { container } = render(
			<ParamInput
				schema={{ name: "quote", type: "string", optional: false }}
				value="   "
				onChange={vi.fn()}
			/>,
		);
		expect(container.querySelector(".quote-preview")).toBeNull();
	});

	it("shows quote preview with single paragraph (title + 1 content slide)", () => {
		render(
			<ParamInput
				schema={{ name: "quote", type: "string", optional: false }}
				value={"Just one paragraph."}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText(/1 paragraph/)).toBeInTheDocument();
		expect(screen.getByText(/2 slides per item/)).toBeInTheDocument();
	});

	it("renders textarea for multiline text", () => {
		render(
			<ParamInput
				schema={{ name: "body", type: "string", optional: false }}
				value={"Line one\nLine two"}
				onChange={vi.fn()}
			/>,
		);
		const textarea = screen.getByLabelText(/body/);
		expect(textarea.tagName).toBe("TEXTAREA");
	});

	it("calls onChange when boolean checkbox is clicked", () => {
		const onChange = vi.fn();
		render(
			<ParamInput
				schema={{ name: "active", type: "boolean", optional: false }}
				value={false}
				onChange={onChange}
			/>,
		);
		const checkbox = screen.getByLabelText(/active/);
		fireEvent.click(checkbox);
		expect(onChange).toHaveBeenCalledWith(true);
	});

	it("calls onChange when boolean checkbox is unchecked", () => {
		const onChange = vi.fn();
		render(
			<ParamInput
				schema={{ name: "active", type: "boolean", optional: false }}
				value={true}
				onChange={onChange}
			/>,
		);
		const checkbox = screen.getByLabelText(/active/);
		fireEvent.click(checkbox);
		expect(onChange).toHaveBeenCalledWith(false);
	});

	it("shows input-error class on splitMode select when errors exist", () => {
		render(
			<ParamInput
				schema={{ name: "splitMode", type: "string", optional: true }}
				value="paragraph"
				onChange={vi.fn()}
				errors={["splitMode is required"]}
			/>,
		);
		const select = screen.getByRole("combobox");
		expect(select.className).toContain("input-error");
	});

	it("shows column hint for number input with spreadsheetHeaders", () => {
		render(
			<ParamInput
				schema={{ name: "column", type: "number", optional: true }}
				value={1}
				onChange={vi.fn()}
				spreadsheetHeaders={["Name", "Email", "Phone"]}
			/>,
		);
		expect(screen.getByText("Column 1 = Email")).toBeInTheDocument();
	});

	it("select defaults to paragraph when value is empty string", () => {
		render(
			<ParamInput
				schema={{ name: "splitMode", type: "string", optional: true }}
				value=""
				onChange={vi.fn()}
			/>,
		);
		const select = screen.getByRole("combobox");
		expect(select).toHaveValue("paragraph");
	});

	it("clearing number input calls onChange with undefined", () => {
		const onChange = vi.fn();
		render(
			<ParamInput
				schema={{ name: "count", type: "number", optional: true }}
				value={42}
				onChange={onChange}
			/>,
		);
		const input = screen.getByLabelText(/count/) as HTMLInputElement;
		fireEvent.change(input, { target: { value: "" } });
		expect(onChange).toHaveBeenCalledWith(undefined);
	});

	it("truncates long paragraphs in quote preview", () => {
		const longText = "A".repeat(150);
		render(
			<ParamInput
				schema={{ name: "quote", type: "string", optional: false }}
				value={longText}
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText(/…$/)).toBeInTheDocument();
	});

	it("does not crash when schema is null", () => {
		const schema = null as unknown as ParamSchema;
		const { container } = render(
			<ParamInput schema={schema} value="" onChange={vi.fn()} />,
		);
		expect(container.textContent).not.toBeNull();
	});

	it("does not crash when onChange is null", () => {
		const schema: ParamSchema = { name: "test", type: "string", optional: true };
		const { container } = render(
			<ParamInput schema={schema} value="" onChange={null as unknown as (value: unknown) => void} />,
		);
		expect(container.textContent).not.toBeNull();
	});
});
