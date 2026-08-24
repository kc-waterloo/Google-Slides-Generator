/**
 * SpreadsheetHeaders.test.tsx
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { SpreadsheetHeaders } from "../SpreadsheetHeaders";

describe("SpreadsheetHeaders", () => {
	it("renders toggle button when closed", () => {
		render(<SpreadsheetHeaders headers={[]} onHeadersChange={vi.fn()} />);
		expect(screen.getByText(/Spreadsheet Headers/)).toBeInTheDocument();
	});

	it("shows header list when toggled open", async () => {
		render(<SpreadsheetHeaders headers={["ColA", "ColB"]} onHeadersChange={vi.fn()} />);
		fireEvent.click(screen.getByText(/Spreadsheet Headers/));
		expect(screen.getByText("ColA")).toBeInTheDocument();
		expect(screen.getByText("ColB")).toBeInTheDocument();
	});

	it("calls onHeadersChange with parsed headers", async () => {
		const onHeadersChange = vi.fn();
		render(<SpreadsheetHeaders headers={[]} onHeadersChange={onHeadersChange} />);
		fireEvent.click(screen.getByText(/Spreadsheet Headers/));
		const textarea = screen.getByRole("textbox");
		fireEvent.change(textarea, { target: { value: "A\nB\tC" } });
		fireEvent.click(screen.getByText("Apply"));
		expect(onHeadersChange).toHaveBeenCalledWith(["A", "B", "C"]);
	});

	it("resets text to current headers when re-opened", () => {
		render(<SpreadsheetHeaders headers={["X", "Y"]} onHeadersChange={vi.fn()} />);
		fireEvent.click(screen.getByText(/Spreadsheet Headers/));
		const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
		expect(textarea.value).toBe("X\nY");
	});

	it("does not crash when headers is null", () => {
		const headers = null as unknown as string[];
		const { container } = render(
			<SpreadsheetHeaders headers={headers} onHeadersChange={vi.fn()} />,
		);
		expect(container.querySelector("button")).toBeTruthy();
	});

	it("does not crash when onHeadersChange is null", () => {
		const { container } = render(
			<SpreadsheetHeaders headers={[]} onHeadersChange={null as unknown as (headers: string[]) => void} />,
		);
		expect(container.querySelector("button")).toBeTruthy();
	});

	it("shows count when headers are present", () => {
		render(
			<SpreadsheetHeaders
				headers={["Title", "Author"]}
				onHeadersChange={vi.fn()}
			/>,
		);
		expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
	});

	it("clicking expands the body with textarea", () => {
		render(
			<SpreadsheetHeaders
				headers={[]}
				onHeadersChange={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText(/Spreadsheet Headers/));
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("clear removes headers and calls onHeadersChange with []", () => {
		const onHeadersChange = vi.fn();
		render(
			<SpreadsheetHeaders
				headers={["A", "B"]}
				onHeadersChange={onHeadersChange}
			/>,
		);
		fireEvent.click(screen.getByText(/Spreadsheet Headers/));
		fireEvent.click(screen.getByText("Clear"));
		expect(onHeadersChange).toHaveBeenCalledWith([]);
	});

	it("shows column reference table after applying headers", () => {
		render(
			<SpreadsheetHeaders
				headers={["Title", "Author"]}
				onHeadersChange={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText(/Spreadsheet Headers/));
		expect(screen.getByText("Column Reference")).toBeInTheDocument();
	});

	it("renders index-number-name rows correctly", () => {
		render(
			<SpreadsheetHeaders
				headers={["Title", "Author", "Date"]}
				onHeadersChange={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText(/Spreadsheet Headers/));
		const refTable = screen.getByText("Column Reference").closest(".spreadsheet-ref");
		expect(refTable).toBeInTheDocument();
		const rows = refTable!.querySelectorAll(".spreadsheet-ref-row");
		expect(rows).toHaveLength(3);
		expect(rows[0]!.querySelector(".spreadsheet-ref-index")!.textContent).toBe("0");
		expect(rows[0]!.querySelector(".spreadsheet-ref-name")!.textContent).toBe("Title");
		expect(rows[1]!.querySelector(".spreadsheet-ref-index")!.textContent).toBe("1");
		expect(rows[1]!.querySelector(".spreadsheet-ref-name")!.textContent).toBe("Author");
		expect(rows[2]!.querySelector(".spreadsheet-ref-index")!.textContent).toBe("2");
		expect(rows[2]!.querySelector(".spreadsheet-ref-name")!.textContent).toBe("Date");
	});
});
