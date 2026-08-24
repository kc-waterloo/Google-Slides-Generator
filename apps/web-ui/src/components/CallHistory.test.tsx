/**
 * CallHistory.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CallHistory } from "./CallHistory";
import type { HistoryEntry } from "../hooks/useFunctionForm";

const makeEntry = (
	timestamp: number,
	label: string,
	calls?: { name: string; params: Record<string, unknown> }[],
): HistoryEntry => ({
	timestamp,
	label,
	calls: calls ?? [
		{ name: "createLongQuotesSlides", params: {} },
	],
});

describe("CallHistory", () => {
	it("renders nothing when entries are empty", () => {
		const { container } = render(
			<CallHistory
				entries={[]}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(container.innerHTML).toBe("");
	});

	it("toggles open and closed on button click", async () => {
		const entries = [makeEntry(1000, "My Preset")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		const toggle = screen.getByText(/History/);
		expect(screen.queryByText("My Preset")).not.toBeInTheDocument();
		await fireEvent.click(toggle);
		expect(screen.getByText("My Preset")).toBeInTheDocument();
		await fireEvent.click(toggle);
		expect(screen.queryByText("My Preset")).not.toBeInTheDocument();
	});

	it("shows entry count in toggle button", () => {
		const entries = [
			makeEntry(1000, "Preset A"),
			makeEntry(2000, "Preset B"),
		];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(screen.getByText(/History \(2\)/)).toBeInTheDocument();
	});

	it("calls onLoad when a history item is clicked", async () => {
		const onLoad = vi.fn();
		const entry = makeEntry(1000, "My Preset");
		render(
			<CallHistory
				entries={[entry]}
				onLoad={onLoad}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		await fireEvent.click(screen.getByText(/History/));
		await fireEvent.click(screen.getByText("My Preset"));
		expect(onLoad).toHaveBeenCalledWith(entry);
	});

	it("calls onDelete when delete button is clicked", async () => {
		const onDelete = vi.fn();
		const entries = [makeEntry(1000, "My Preset")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={onDelete}
			/>,
		);
		await fireEvent.click(screen.getByText(/History/));
		await fireEvent.click(screen.getByTitle("Delete"));
		expect(onDelete).toHaveBeenCalledWith(1000);
	});

	it("calls onClear when Clear all is clicked", async () => {
		const onClear = vi.fn();
		const entries = [makeEntry(1000, "My Preset")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={onClear}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		await fireEvent.click(screen.getByText(/History/));
		await fireEvent.click(screen.getByText("Clear all"));
		expect(onClear).toHaveBeenCalled();
	});

	it("double-clicking label enters rename mode", async () => {
		const entries = [makeEntry(1000, "Preset")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		await fireEvent.click(screen.getByText(/History/));
		await fireEvent.dblClick(screen.getByText("Preset"));
		const input = screen.getByDisplayValue("Preset");
		expect(input).toBeInTheDocument();
	});

	it("blur after editing commits the rename", async () => {
		const onRename = vi.fn();
		const entries = [makeEntry(1000, "Old")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={onRename}
				onDelete={vi.fn()}
			/>,
		);
		await fireEvent.click(screen.getByText(/History/));
		await fireEvent.dblClick(screen.getByText("Old"));
		const input = screen.getByDisplayValue("Old");
		fireEvent.change(input, { target: { value: "Renamed" } });
		fireEvent.blur(input);
		expect(onRename).toHaveBeenCalledWith(1000, "Renamed");
	});

	it("Enter key in rename mode commits via blur", async () => {
		const user = userEvent.setup();
		const onRename = vi.fn();
		const entries = [makeEntry(1000, "Original")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={onRename}
				onDelete={vi.fn()}
			/>,
		);
		await fireEvent.click(screen.getByText(/History/));
		await fireEvent.dblClick(screen.getByText("Original"));
		const input = screen.getByDisplayValue("Original");
		await user.clear(input);
		await user.type(input, "Entered{Enter}");
		expect(onRename).toHaveBeenCalledWith(1000, "Entered");
	});

	it("does not call onRename when renamed value is empty", async () => {
		const onRename = vi.fn();
		const entries = [makeEntry(1000, "Preset")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={onRename}
				onDelete={vi.fn()}
			/>,
		);
		await fireEvent.click(screen.getByText(/History/));
		await fireEvent.dblClick(screen.getByText("Preset"));
		const input = screen.getByDisplayValue("Preset");
		fireEvent.change(input, { target: { value: "" } });
		fireEvent.blur(input);
		expect(onRename).not.toHaveBeenCalled();
	});

	it("formats time as Just now for recent entries", () => {
		const entries = [makeEntry(Date.now(), "Recent")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText(/History/));
		expect(screen.getByText("Just now")).toBeInTheDocument();
	});

	it("formats time as Xm ago for entries minutes old", () => {
		const fiveMinAgo = Date.now() - 5 * 60 * 1000;
		const entries = [makeEntry(fiveMinAgo, "Old")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText(/History/));
		expect(screen.getByText("5m ago")).toBeInTheDocument();
	});

	it("formats time as Xh ago for entries hours old", () => {
		const threeHoursAgo = Date.now() - 3 * 3600 * 1000;
		const entries = [makeEntry(threeHoursAgo, "Old")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText(/History/));
		expect(screen.getByText("3h ago")).toBeInTheDocument();
	});

	it("Escape key in rename mode cancels without calling onRename", async () => {
		const onRename = vi.fn();
		const entries = [makeEntry(1000, "Original")];
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={onRename}
				onDelete={vi.fn()}
			/>,
		);
		await fireEvent.click(screen.getByText(/History/));
		await fireEvent.dblClick(screen.getByText("Original"));
		const input = screen.getByDisplayValue("Original");
		fireEvent.change(input, { target: { value: "Changed" } });
		fireEvent.keyDown(input, { key: "Escape" });
		expect(onRename).not.toHaveBeenCalled();
		expect(screen.getByText("Original")).toBeInTheDocument();
	});

	it("formats time as date for entries >= 1 day old", () => {
		const twoDaysAgo = Date.now() - 2 * 86400000;
		const entries = [makeEntry(twoDaysAgo, "Old Entry")];
		const expected = new Date(twoDaysAgo).toLocaleDateString();
		render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText(/History/));
		expect(screen.getByText(expected)).toBeInTheDocument();
	});

	it("does not crash when entries is null", () => {
		const entries = null as unknown as HistoryEntry[];
		const { container } = render(
			<CallHistory
				entries={entries}
				onLoad={vi.fn()}
				onClear={vi.fn()}
				onRename={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(container.textContent).toBe("");
	});

	it("does not crash when callbacks are null", () => {
		const entries = [
			{ timestamp: 1, calls: [{ name: "test", params: {} }], label: "Test" },
		] as unknown as HistoryEntry[];
		const { container } = render(
			<CallHistory
				entries={entries}
				onLoad={null as unknown as (entry: HistoryEntry) => void}
				onClear={null as unknown as () => void}
				onRename={null as unknown as (timestamp: number, label: string) => void}
				onDelete={null as unknown as (timestamp: number) => void}
			/>,
		);
		expect(container.textContent).not.toBeNull();
	});
});
