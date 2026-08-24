/**
 * ParamEditor.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParamEditor } from "./ParamEditor";
import type { FunctionSchema } from "@gsg/shared";

const requiredOnlySchema: FunctionSchema = {
	name: "testFn",
	description: "Test",
	parameters: {
		title: { name: "title", type: "string", optional: false },
		count: { name: "count", type: "number", optional: false },
		active: { name: "active", type: "boolean", optional: false },
	},
};

const optionalOnlySchema: FunctionSchema = {
	name: "testFn",
	description: "Test",
	parameters: {
		color: { name: "color", type: "string", optional: true, defaultValue: "red" },
		fontSize: { name: "fontSize", type: "number", optional: true, defaultValue: 12 },
	},
};

const mixedSchema: FunctionSchema = {
	name: "testFn",
	description: "Test",
	parameters: {
		title: { name: "title", type: "string", optional: false },
		color: { name: "color", type: "string", optional: true, defaultValue: "blue" },
	},
};

const emptySchema: FunctionSchema = {
	name: "emptyFn",
	description: "Empty",
	parameters: {},
};

describe("ParamEditor", () => {
	it("renders required params section with correct count", () => {
		render(
			<ParamEditor
				schema={requiredOnlySchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.getByText("Required (3)")).toBeInTheDocument();
	});

	it("renders optional params section with correct count", () => {
		render(
			<ParamEditor
				schema={optionalOnlySchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.getByText("Optional (2)")).toBeInTheDocument();
	});

	it("shows only required section when there are no optional params", () => {
		render(
			<ParamEditor
				schema={requiredOnlySchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.getByText("Required (3)")).toBeInTheDocument();
		expect(screen.queryByText(/Optional/)).not.toBeInTheDocument();
	});

	it("shows only optional section when there are no required params", () => {
		render(
			<ParamEditor
				schema={optionalOnlySchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.getByText("Optional (2)")).toBeInTheDocument();
		expect(screen.queryByText(/Required/)).not.toBeInTheDocument();
	});

	it("renders both required and optional sections for mixed params", () => {
		render(
			<ParamEditor
				schema={mixedSchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.getByText("Required (1)")).toBeInTheDocument();
		expect(screen.getByText("Optional (1)")).toBeInTheDocument();
	});

	it("renders ParamInput for each parameter", () => {
		render(
			<ParamEditor
				schema={requiredOnlySchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.getByText("title")).toBeInTheDocument();
		expect(screen.getByText("count")).toBeInTheDocument();
		expect(screen.getByText("active")).toBeInTheDocument();
	});

	it("shows only Required section when no optional params", () => {
		render(
			<ParamEditor
				schema={requiredOnlySchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.getByText("Required (3)")).toBeInTheDocument();
		expect(screen.queryByText(/Optional/)).not.toBeInTheDocument();
	});

	it("shows only Optional section when no required params", () => {
		render(
			<ParamEditor
				schema={optionalOnlySchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.getByText("Optional (2)")).toBeInTheDocument();
		expect(screen.queryByText(/Required/)).not.toBeInTheDocument();
	});

	it("renders nothing when schema has zero params", () => {
		render(
			<ParamEditor
				schema={emptySchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.queryByText(/Required/)).not.toBeInTheDocument();
		expect(screen.queryByText(/Optional/)).not.toBeInTheDocument();
	});

	it("renders all six param types in the same schema", async () => {
		const user = userEvent.setup();
		const allTypesSchema: FunctionSchema = {
			name: "allTypes",
			description: "All types",
			parameters: {
				str: { name: "str", type: "string", optional: false },
				num: { name: "num", type: "number", optional: false },
				bool: { name: "bool", type: "boolean", optional: false },
				strArr: { name: "strArr", type: "string[]", optional: true },
				regArr: { name: "regArr", type: "RegExp[]", optional: true },
				objArr: { name: "objArr", type: "object[]", optional: true },
			},
		};

		render(
			<ParamEditor
				schema={allTypesSchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);

		expect(screen.getByText("Required (3)")).toBeInTheDocument();
		expect(screen.getByText("Optional (3)")).toBeInTheDocument();
		expect(screen.getByText("str")).toBeInTheDocument();
		expect(screen.getByText("num")).toBeInTheDocument();
		expect(screen.getByText("bool")).toBeInTheDocument();

		await user.click(screen.getByText("Optional (3)"));

		expect(screen.getByText("strArr")).toBeInTheDocument();
		expect(screen.getByText("regArr")).toBeInTheDocument();
		expect(screen.getByText("objArr")).toBeInTheDocument();
	});

	it("shows error summary with singular 'error' for one validation error", () => {
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: { title: { name: "title", type: "string", optional: false } },
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[{ field: "title", message: "Title is required" }]}
			/>,
		);
		expect(screen.getByText("1 validation error")).toBeInTheDocument();
	});

	it("shows error summary with plural 'errors' for multiple validation errors", () => {
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: { color: { name: "color", type: "string", optional: false } },
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[
					{ field: "color", message: "Color is required" },
					{ field: "color", message: "Invalid format" },
				]}
			/>,
		);
		expect(screen.getByText("2 validation errors")).toBeInTheDocument();
	});

	it("filters parameters and shows no-match message", async () => {
		const user = userEvent.setup();
		render(
			<ParamEditor
				schema={requiredOnlySchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		const filterInput = screen.getByPlaceholderText("Filter parameters...");
		await user.type(filterInput, "zzz");
		expect(screen.getByText(/No parameters match/)).toBeInTheDocument();
	});

	it("shows default value badge when optional param has defaultValue", async () => {
		const user = userEvent.setup();
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						color: { name: "color", type: "string", optional: true, defaultValue: "red" },
					},
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		await user.click(screen.getByText(/Optional/));
		expect(screen.getByText(/default/)).toBeInTheDocument();
	});

	it("shows param description when provided", async () => {
		const user = userEvent.setup();
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						color: {
							name: "color",
							type: "string",
							optional: true,
							description: "The primary color",
						},
					},
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		await user.click(screen.getByText(/Optional/));
		expect(screen.getByText("The primary color")).toBeInTheDocument();
	});

	it("passes existing record array to ArrayEditor for object[] param", async () => {
		const user = userEvent.setup();
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						items: { name: "items", type: "object[]", optional: true },
					},
				}}
				params={{ items: [{ name: "hello" }] }}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		await user.click(screen.getByText(/Optional/));
		expect(screen.getByText("items")).toBeInTheDocument();
	});

	it("calls onChange via error summary scroll-to-field button click", async () => {
		const mockScroll = vi.fn();
		const mockFocus = vi.fn();
		const mockInput = document.createElement("input");
		Object.defineProperty(mockInput, "focus", { value: mockFocus, writable: true });

		const origGetElementById = document.getElementById.bind(document);
		document.getElementById = vi.fn((id: string) => {
			if (id === "param-color") {
				const mockEl = document.createElement("div");
				mockEl.id = "param-color";
				mockEl.querySelector = vi.fn().mockReturnValue(mockInput);
				mockEl.scrollIntoView = mockScroll;
				return mockEl;
			}
			return origGetElementById(id);
		}) as never;

		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: { color: { name: "color", type: "string", optional: false } },
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[{ field: "color", message: "Color is required" }]}
			/>,
		);
		fireEvent.click(screen.getByText("color: Color is required"));
		expect(mockScroll).toHaveBeenCalled();
		expect(mockFocus).toHaveBeenCalled();

		document.getElementById = origGetElementById;
	});

	it("expand all and collapse all toggle sections", async () => {
		const user = userEvent.setup();
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						title: { name: "title", type: "string", optional: false },
						color: { name: "color", type: "string", optional: true },
					},
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.queryByText("color")).not.toBeInTheDocument();

		await user.click(screen.getByTitle("Expand all sections"));
		expect(screen.getByText("color")).toBeInTheDocument();

		await user.click(screen.getByTitle("Collapse all sections"));
		expect(screen.queryByText("color")).not.toBeInTheDocument();
	});

	it("calls onChange when adding item to object[] via ArrayEditor", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						items: {
							name: "items",
							type: "object[]",
							optional: true,
							arrayItemSchema: {
								title: { name: "title", type: "string", optional: false },
							},
						},
					},
				}}
				params={{ items: [{ title: "Hello" }] }}
				onChange={onChange}
				errors={[]}
			/>,
		);
		await user.click(screen.getByText(/Optional/));
		await user.click(screen.getByText("+ Add another"));

		expect(onChange).toHaveBeenCalledWith("items", expect.any(Array));
	});

	it("calls onChange when adding pattern to RegExp[] via RegexpEditor", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						patterns: {
							name: "patterns",
							type: "RegExp[]",
							optional: true,
						},
					},
				}}
				params={{ patterns: [] }}
				onChange={onChange}
				errors={[]}
			/>,
		);
		await user.click(screen.getByText(/Optional/));
		await user.click(screen.getByText("+ Add pattern"));

		expect(onChange).toHaveBeenCalledWith("patterns", expect.any(Array));
	});

	it("shows description for RegExp[] param when provided", async () => {
		const user = userEvent.setup();
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						patterns: {
							name: "patterns",
							type: "RegExp[]",
							optional: true,
							description: "Regex patterns to apply",
						},
					},
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		await user.click(screen.getByText(/Optional/));
		expect(screen.getByText("Regex patterns to apply")).toBeInTheDocument();
	});

	it("handles scrollToField when element does not exist", () => {
		const origGetElementById = document.getElementById.bind(document);
		document.getElementById = vi.fn(() => null) as never;

		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: { missing: { name: "missing", type: "string", optional: false } },
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[{ field: "missing", message: "Required" }]}
			/>,
		);
		fireEvent.click(screen.getByText("missing: Required"));
		expect(document.getElementById).toHaveBeenCalledWith("param-missing");

		document.getElementById = origGetElementById;
	});

	it("shows default value badge for RegExp[] param", async () => {
		const user = userEvent.setup();
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						patterns: {
							name: "patterns",
							type: "RegExp[]",
							optional: true,
							defaultValue: [],
						},
					},
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		await user.click(screen.getByText(/Optional/));
		expect(screen.getByText(/default/)).toBeInTheDocument();
	});

	it("shows required indicator for non-optional object[] param", () => {
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						items: {
							name: "items",
							type: "object[]",
							optional: false,
						},
					},
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.getByText(/\*/)).toBeInTheDocument();
	});

	it("shows required indicator for non-optional RegExp[] param", () => {
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						patterns: {
							name: "patterns",
							type: "RegExp[]",
							optional: false,
						},
					},
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		expect(screen.getByText(/\*/)).toBeInTheDocument();
	});

	it("shows default value badge for object[] param", async () => {
		const user = userEvent.setup();
		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: {
						items: {
							name: "items",
							type: "object[]",
							optional: true,
							defaultValue: [],
						},
					},
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);
		await user.click(screen.getByText(/Optional/));
		expect(screen.getByText(/default/)).toBeInTheDocument();
	});

	it("handles scrollToField when element has no focusable child", () => {
		const origGetElementById = document.getElementById.bind(document);
		document.getElementById = vi.fn(() => {
			const el = document.createElement("div");
			el.id = "param-nofocus";
			el.scrollIntoView = vi.fn();
			return el;
		}) as never;

		render(
			<ParamEditor
				schema={{
					name: "testFn",
					description: "Test",
					parameters: { nofocus: { name: "nofocus", type: "string", optional: false } },
				}}
				params={{}}
				onChange={vi.fn()}
				errors={[{ field: "nofocus", message: "Required" }]}
			/>,
		);
		fireEvent.click(screen.getByText("nofocus: Required"));
		expect(document.getElementById).toHaveBeenCalledWith("param-nofocus");

		document.getElementById = origGetElementById;
	});

	it("does not crash when schema is null", () => {
		const { container } = render(
			<ParamEditor
				schema={null as unknown as FunctionSchema}
				params={{}}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);

		expect(container.textContent).toBe("");
	});

	it("does not crash when params is null", () => {
		const schema = { name: "test", description: "Test", parameters: { title: { name: "title", type: "string", optional: false, description: "Title" } } } as const;

		const { getByText } = render(
			<ParamEditor
				schema={schema}
				params={null as unknown as Record<string, unknown>}
				onChange={vi.fn()}
				errors={[]}
			/>,
		);

		expect(getByText("title")).toBeInTheDocument();
	});
});
