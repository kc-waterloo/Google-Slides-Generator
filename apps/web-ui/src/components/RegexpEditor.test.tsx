/**
 * RegexpEditor.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RegexpEditor } from "./RegexpEditor";

describe("RegexpEditor", () => {
	describe("empty state", () => {
		it("renders Add pattern button", () => {
			render(
				<RegexpEditor
					values={[]}
					onChange={vi.fn()}
				/>,
			);
			const btn = document.querySelector(".array-add-btn");
			expect(btn).toBeInTheDocument();
			expect(btn).toHaveTextContent("+ Add pattern");
		});

		it("renders no RegexRow components when values is empty", () => {
			const { container } = render(
				<RegexpEditor
					values={[]}
					onChange={vi.fn()}
				/>,
			);
			expect(container.querySelectorAll(".regexp-row")).toHaveLength(0);
		});

		it("calls onChange with empty string when Add pattern is clicked", () => {
			const onChange = vi.fn();
			render(
				<RegexpEditor
					values={[]}
					onChange={onChange}
				/>,
			);
			fireEvent.click(document.querySelector(".array-add-btn")!);
			expect(onChange).toHaveBeenCalledWith([""]);
		});
	});

	describe("toolbar", () => {
		it("renders Help button", () => {
			render(
				<RegexpEditor
					values={[]}
					onChange={vi.fn()}
				/>,
			);
			expect(screen.getByText("Help")).toBeInTheDocument();
		});

		it("toggles cheatsheet visibility on Help button click", () => {
			render(
				<RegexpEditor
					values={[]}
					onChange={vi.fn()}
				/>,
			);
			expect(document.querySelector(".regexp-cheatsheet")).not.toBeInTheDocument();

			fireEvent.click(screen.getByText("Help"));
			expect(document.querySelector(".regexp-cheatsheet")).toBeInTheDocument();
			expect(screen.getByText("Hide")).toBeInTheDocument();

			fireEvent.click(screen.getByText("Hide"));
			expect(document.querySelector(".regexp-cheatsheet")).not.toBeInTheDocument();
			expect(screen.getByText("Help")).toBeInTheDocument();
		});

		it("renders cheatsheet table with 10 entries", () => {
			render(
				<RegexpEditor
					values={[]}
					onChange={vi.fn()}
				/>,
			);
			fireEvent.click(screen.getByText("Help"));

			const codes = document.querySelectorAll(".regexp-code");
			expect(codes).toHaveLength(10);
			expect(codes[0]).toHaveTextContent("/./");
			expect(codes[9]).toHaveTextContent("/[abc]/");
		});

		it("renders all 5 common pattern buttons", () => {
			render(
				<RegexpEditor
					values={[]}
					onChange={vi.fn()}
				/>,
			);

			expect(screen.getByText("Starts with")).toBeInTheDocument();
			expect(screen.getByText("Contains")).toBeInTheDocument();
			expect(screen.getByText("Ends with")).toBeInTheDocument();
			expect(screen.getByText("Digits")).toBeInTheDocument();
			expect(screen.getByText("Word boundary")).toBeInTheDocument();
		});

		it("common pattern buttons have correct title attributes", () => {
			render(
				<RegexpEditor
					values={[]}
					onChange={vi.fn()}
				/>,
			);

			expect(screen.getByTitle("^Chapter")).toBeInTheDocument();
			expect(screen.getByTitle("Topic")).toBeInTheDocument();
			expect(screen.getByTitle("Section$")).toBeInTheDocument();
			expect(screen.getByTitle("^\\d+")).toBeInTheDocument();
			expect(screen.getByTitle("\\bDraft\\b")).toBeInTheDocument();
		});

		it("calls onChange with pattern when common pattern button is clicked", () => {
			const onChange = vi.fn();
			render(
				<RegexpEditor
					values={[]}
					onChange={onChange}
				/>,
			);

			fireEvent.click(screen.getByText("Starts with"));
			expect(onChange).toHaveBeenCalledWith(["^Chapter"]);

			fireEvent.click(screen.getByText("Contains"));
			expect(onChange).toHaveBeenCalledWith(["Topic"]);

			fireEvent.click(screen.getByText("Ends with"));
			expect(onChange).toHaveBeenCalledWith(["Section$"]);

			fireEvent.click(screen.getByText("Digits"));
			expect(onChange).toHaveBeenCalledWith(["^\\d+"]);

			fireEvent.click(screen.getByText("Word boundary"));
			expect(onChange).toHaveBeenCalledWith(["\\bDraft\\b"]);
		});
	});

	describe("rendering values", () => {
		it("renders a RegexRow for each value", () => {
			const values = ["^Chapter", "Topic"];
			render(
				<RegexpEditor
					values={values}
					onChange={vi.fn()}
				/>,
			);
			const rows = document.querySelectorAll(".regexp-row");
			expect(rows).toHaveLength(2);
		});

		it("displays pattern text in input fields", () => {
			const values = ["^Chapter", "Topic"];
			render(
				<RegexpEditor
					values={values}
					onChange={vi.fn()}
				/>,
			);
			const inputs = document.querySelectorAll<HTMLInputElement>(".regexp-row-main input[type='text']");
			expect(inputs).toHaveLength(2);
			expect(inputs[0]).toHaveValue("^Chapter");
			expect(inputs[1]).toHaveValue("Topic");
		});

		it("renders RegExp instance values using .source", () => {
			const values = [/^\d+/];
			render(
				<RegexpEditor
					values={values}
					onChange={vi.fn()}
				/>,
			);
			const input = document.querySelector<HTMLInputElement>(".regexp-row-main input[type='text']");
			expect(input).toHaveValue("^\\d+");
		});

		it("renders null/undefined values as empty string", () => {
			const values = [null, undefined];
			render(
				<RegexpEditor
					values={values}
					onChange={vi.fn()}
				/>,
			);
			const inputs = document.querySelectorAll<HTMLInputElement>(".regexp-row-main input[type='text']");
			expect(inputs[0]).toHaveValue("");
			expect(inputs[1]).toHaveValue("");
		});
	});

	describe("updating values", () => {
		it("calls onChange with updated value when pattern input changes", () => {
			const onChange = vi.fn();
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={onChange}
				/>,
			);
			const input = document.querySelector<HTMLInputElement>(".regexp-row-main input[type='text']")!;
			fireEvent.change(input, { target: { value: "^NewPattern" } });
			expect(onChange).toHaveBeenCalledWith(["^NewPattern"]);
		});

		it("calls onChange with value removed when Remove is clicked", () => {
			const onChange = vi.fn();
			const values = ["^Chapter", "Topic", "Section$"];
			render(
				<RegexpEditor
					values={values}
					onChange={onChange}
				/>,
			);
			const removeButtons = screen.getAllByText("Remove");
			expect(removeButtons).toHaveLength(3);

			fireEvent.click(removeButtons[1]!);
			expect(onChange).toHaveBeenCalledWith(["^Chapter", "Section$"]);
		});

		it("calls onChange with appended value when Add pattern is clicked with existing values", () => {
			const onChange = vi.fn();
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={onChange}
				/>,
			);
			fireEvent.click(document.querySelector(".array-add-btn")!);
			expect(onChange).toHaveBeenCalledWith(["^Chapter", ""]);
		});
	});

	describe("validation", () => {
		it("shows no error for a valid regex", () => {
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			expect(screen.queryByText("Invalid regular expression")).not.toBeInTheDocument();
		});

		it("shows error message for an invalid regex", () => {
			render(
				<RegexpEditor
					values={["["]}
					onChange={vi.fn()}
				/>,
			);
			expect(screen.getByText("Invalid regular expression")).toBeInTheDocument();
		});

		it("does not show error for empty string value", () => {
			render(
				<RegexpEditor
					values={[""]}
					onChange={vi.fn()}
				/>,
			);
			expect(screen.queryByText("Invalid regular expression")).not.toBeInTheDocument();
		});

		it("applies input-error class to invalid regex input", () => {
			render(
				<RegexpEditor
					values={["["]}
					onChange={vi.fn()}
				/>,
			);
			const input = document.querySelector<HTMLInputElement>(".regexp-row-main input[type='text']")!;
			expect(input.className).toContain("input-error");
		});

		it("does not apply input-error class to valid regex input", () => {
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			const input = document.querySelector<HTMLInputElement>(".regexp-row-main input[type='text']")!;
			expect(input.className).not.toContain("input-error");
		});
	});

	describe("test string behavior", () => {
		it("shows test string input for a valid regex", () => {
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input");
			expect(testInput).toBeInTheDocument();
			expect(testInput).toHaveAttribute("placeholder", "Test string...");
		});

		it("does not show test string input for an invalid regex", () => {
			render(
				<RegexpEditor
					values={["["]}
					onChange={vi.fn()}
				/>,
			);
			expect(document.querySelector(".regexp-test")).not.toBeInTheDocument();
		});

		it("shows hint when test string is empty", () => {
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			expect(
				screen.getByText("Type a test string above to see matches"),
			).toBeInTheDocument();
		});

		it("shows ✓ matches when test string matches the pattern", () => {
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			fireEvent.change(testInput, { target: { value: "Chapter 1" } });
			expect(screen.getByText("✓ matches")).toBeInTheDocument();
		});

		it("shows ✗ no match when test string does not match", () => {
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			fireEvent.change(testInput, { target: { value: "Topic" } });
			expect(screen.getByText("✗ no match")).toBeInTheDocument();
		});

		it("shows — dash when test string is empty", () => {
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			expect(screen.getByText("—")).toBeInTheDocument();
		});

		it("applies match-ok class to test input on match", () => {
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			fireEvent.change(testInput, { target: { value: "Chapter 1" } });
			expect(testInput.className).toContain("match-ok");
		});

		it("applies match-fail class to test input on no match", () => {
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			fireEvent.change(testInput, { target: { value: "Topic" } });
			expect(testInput.className).toContain("match-fail");
		});

		it("does not apply match-ok or match-fail to test input when empty", () => {
			render(
				<RegexpEditor
					values={["^Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			expect(testInput.className).not.toContain("match-ok");
			expect(testInput.className).not.toContain("match-fail");
		});
	});

	describe("Preview component", () => {
		it("shows No matches found when test string has no matches", () => {
			render(
				<RegexpEditor
					values={["Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			fireEvent.change(testInput, { target: { value: "No match here" } });
			expect(screen.getByText("No matches found")).toBeInTheDocument();
		});

		it("renders highlighted matches for matching test string", () => {
			render(
				<RegexpEditor
					values={["Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			fireEvent.change(testInput, { target: { value: "Chapter 1 and Chapter 2" } });

			const marks = document.querySelectorAll<HTMLElement>(".regexp-mark");
			expect(marks).toHaveLength(2);
			expect(marks[0]).toHaveTextContent("Chapter");
			expect(marks[1]).toHaveTextContent("Chapter");
		});

		it("renders non-matching text between highlights", () => {
			render(
				<RegexpEditor
					values={["Chapter"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			fireEvent.change(testInput, { target: { value: "Chapter 1" } });

			const preview = document.querySelector(".regexp-preview")!;
			expect(preview.textContent).toContain("Chapter");
			expect(preview.textContent).toContain(" 1");
		});

		it("handles end-of-string match correctly", () => {
			render(
				<RegexpEditor
					values={["test"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			fireEvent.change(testInput, { target: { value: "test" } });

			const marks = document.querySelectorAll<HTMLElement>(".regexp-mark");
			expect(marks).toHaveLength(1);
			expect(marks[0]).toHaveTextContent("test");
		});

		it("handles no match correctly with global flag", () => {
			render(
				<RegexpEditor
					values={["\\d+"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			fireEvent.change(testInput, { target: { value: "abc" } });
			expect(screen.getByText("No matches found")).toBeInTheDocument();
		});

		it("handles multiple matches with digits pattern", () => {
			render(
				<RegexpEditor
					values={["\\d+"]}
					onChange={vi.fn()}
				/>,
			);
			const testInput = document.querySelector<HTMLInputElement>(".regexp-test input")!;
			fireEvent.change(testInput, { target: { value: "abc123def456" } });

			const marks = document.querySelectorAll<HTMLElement>(".regexp-mark");
			expect(marks).toHaveLength(2);
			expect(marks[0]).toHaveTextContent("123");
			expect(marks[1]).toHaveTextContent("456");
		});
	});

	it("removing last pattern returns to empty state", () => {
		const onChange = vi.fn();
		const { rerender } = render(
			<RegexpEditor
				values={["^Chapter"]}
				onChange={onChange}
			/>,
		);

		fireEvent.click(screen.getByText("Remove"));

		rerender(
			<RegexpEditor
				values={[]}
				onChange={onChange}
			/>,
		);
		expect(document.querySelector(".array-add-btn")).toHaveTextContent("+ Add pattern");
	});

	it("shows + Add pattern button when values exist", () => {
		render(
			<RegexpEditor
				values={[/test/]}
				onChange={vi.fn()}
			/>,
		);
		const addBtn = document.querySelector(".array-add-btn")!;
		expect(addBtn).toHaveTextContent("+ Add pattern");
	});

	describe("interaction with multiple values", () => {
		it("displays correct match/fail per row independently", () => {
			const values = ["^Chapter", "Topic"];
			render(
				<RegexpEditor
					values={values}
					onChange={vi.fn()}
				/>,
			);
			const testInputs = document.querySelectorAll<HTMLInputElement>(".regexp-test input");
			expect(testInputs).toHaveLength(2);

			fireEvent.change(testInputs[0]!, { target: { value: "Chapter 1" } });
			fireEvent.change(testInputs[1]!, { target: { value: "No topic" } });

			const results = document.querySelectorAll<HTMLElement>(".regexp-result");
			expect(results[0]).toHaveTextContent("✓ matches");
			expect(results[1]).toHaveTextContent("✗ no match");
		});

		it("updates one pattern without affecting others in multi-item array", () => {
			const onChange = vi.fn();
			render(
				<RegexpEditor
					values={["^Chapter", "Topic", "Section$"]}
					onChange={onChange}
				/>,
			);
			const inputs = document.querySelectorAll<HTMLInputElement>(".regexp-row-main input[type='text']");
			fireEvent.change(inputs[1]!, { target: { value: "UpdatedTopic" } });
			expect(onChange).toHaveBeenCalledWith(["^Chapter", "UpdatedTopic", "Section$"]);
		});

		it("each row has its own remove button", () => {
			const values = ["^Chapter", "Topic", "Section$"];
			const onChange = vi.fn();
			render(
				<RegexpEditor
					values={values}
					onChange={onChange}
				/>,
			);
			const removeButtons = screen.getAllByText("Remove");
			expect(removeButtons).toHaveLength(3);

			fireEvent.click(removeButtons[2]!);
			expect(onChange).toHaveBeenCalledWith(["^Chapter", "Topic"]);
		});
	});

	it("does not crash when values is null", () => {
		const values = null as unknown as unknown[];
		const { container } = render(
			<RegexpEditor values={values} onChange={vi.fn()} />,
		);
		expect(container.querySelector("button")).toBeTruthy();
	});

	it("does not crash when onChange is null", () => {
		const { container } = render(
			<RegexpEditor values={[]} onChange={null as unknown as (values: unknown[]) => void} />,
		);
		expect(container.querySelector("button")).toBeTruthy();
	});
});

describe("regex literal input", () => {
	it("treats /pattern/flags input as a regex literal in the match preview", () => {
		render(
			<RegexpEditor
				values={["/^chapter/i"]}
				onChange={vi.fn()}
			/>,
		);
		const testInput = document.querySelector(".regexp-test input")!;
		fireEvent.change(testInput, { target: { value: "Chapter 1" } });
		expect(screen.getByText("✓ matches")).toBeInTheDocument();
	});

	it("renders a RegExp value with its flags", () => {
		render(
			<RegexpEditor
				values={[/^chapter/i]}
				onChange={vi.fn()}
			/>,
		);
		expect(document.querySelector(".regexp-row input")).toHaveValue("/^chapter/i");
	});

	it("highlights every match, not just the first", () => {
		render(
			<RegexpEditor
				values={["a"]}
				onChange={vi.fn()}
			/>,
		);
		const testInput = document.querySelector(".regexp-test input")!;
		fireEvent.change(testInput, { target: { value: "aba" } });
		expect(document.querySelectorAll(".regexp-mark")).toHaveLength(2);
	});
});
