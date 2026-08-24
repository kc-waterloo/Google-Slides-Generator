/**
 * CallChain.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CallChain } from "./CallChain";
import type { CallEntry } from "../hooks/useFunctionForm";

const makeCall = (id: string, name: string): CallEntry => ({
	id,
	name,
	params: {},
});

describe("CallChain", () => {
	it("renders + Add Call button when there are no calls", () => {
		render(
			<CallChain
				calls={[]}
				activeId={null}
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(screen.getByText("+ Add Call")).toBeInTheDocument();
	});

	it("shows Save button when there is exactly 1 call", () => {
		const calls = [makeCall("1", "fnA")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(screen.getByTitle("Save chain to history")).toBeInTheDocument();
	});

	it("does not show Save button when there are no calls", () => {
		render(
			<CallChain
				calls={[]}
				activeId={null}
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(screen.queryByTitle("Save chain to history")).not.toBeInTheDocument();
	});

	it("calls onAdd when add button is clicked", async () => {
		const onAdd = vi.fn();
		render(
			<CallChain
				calls={[]}
				activeId={null}
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={onAdd}
				onSave={vi.fn()}
			/>,
		);
		await fireEvent.click(screen.getByText("+ Add Call"));
		expect(onAdd).toHaveBeenCalled();
	});

	it("renders call chain list when there are multiple calls", () => {
		const calls = [makeCall("1", "createLongQuotesSlides"), makeCall("2", "setHeaders")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(screen.getByText("Call Chain (2)")).toBeInTheDocument();
		expect(screen.getByText("createLongQuotesSlides")).toBeInTheDocument();
		expect(screen.getByText("setHeaders")).toBeInTheDocument();
	});

	it("marks the active call with active class", () => {
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId="2"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		const items = document.querySelectorAll(".call-chain-item");
		expect(items[1]).toHaveClass("active");
		expect(items[0]).not.toHaveClass("active");
	});

	it("calls onSelect when a chain item is clicked", async () => {
		const onSelect = vi.fn();
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={onSelect}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		await fireEvent.click(screen.getByText("fnB"));
		expect(onSelect).toHaveBeenCalledWith("2");
	});

	it("opens save dialog when Save is clicked and commits on input Enter", async () => {
		const onSave = vi.fn();
		const calls = [makeCall("1", "createLongQuotesSlides")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={onSave}
			/>,
		);
		fireEvent.click(screen.getByText("Save"));
		const input = screen.getByPlaceholderText("Name this preset...");
		expect(input).toBeInTheDocument();
		await userEvent.clear(input);
		await userEvent.type(input, "My Preset{Enter}");
		expect(onSave).toHaveBeenCalledWith("My Preset");
	});

	it("calls onRemove when remove button is clicked in a multi-call chain", async () => {
		const onRemove = vi.fn();
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={onRemove}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getAllByTitle("Remove")[0]!);
		expect(onRemove).toHaveBeenCalledWith("1");
	});

	it("calls onMoveUp when up button is clicked", async () => {
		const onMoveUp = vi.fn();
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={onMoveUp}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getAllByTitle("Move up")[1]!);
		expect(onMoveUp).toHaveBeenCalledWith("2");
	});

	it("calls onMoveDown when down button is clicked", async () => {
		const onMoveDown = vi.fn();
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={onMoveDown}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getAllByTitle("Move down")[0]!);
		expect(onMoveDown).toHaveBeenCalledWith("1");
	});

	it("disables move up on first item and move down on last item", () => {
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		const moveUpButtons = screen.getAllByTitle("Move up");
		const moveDownButtons = screen.getAllByTitle("Move down");
		expect(moveUpButtons[0]).toBeDisabled();
		expect(moveDownButtons[1]).toBeDisabled();
	});

	it("displays ? for empty call names", () => {
		const calls = [makeCall("1", ""), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(screen.getByText("Call 1")).toBeInTheDocument();
	});

	it("save dialog cancel button closes dialog", async () => {
		const calls = [makeCall("1", "fnA")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText("Save"));
		expect(screen.getByPlaceholderText("Name this preset...")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Cancel"));
		expect(screen.queryByPlaceholderText("Name this preset...")).not.toBeInTheDocument();
	});

	it("save with empty label calls onSave(undefined)", async () => {
		const onSave = vi.fn();
		const calls = [makeCall("1", "fnA")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={onSave}
			/>,
		);
		fireEvent.click(screen.getByText("Save"));
		const input = screen.getByPlaceholderText("Name this preset...");
		fireEvent.change(input, { target: { value: "   " } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSave).toHaveBeenCalledWith(undefined);
	});

	it("renders all items with correct heading for 6+ calls", () => {
		const calls = Array.from({ length: 6 }, (_, i) => makeCall(`${i + 1}`, `fn${i + 1}`));
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(screen.getByText("Call Chain (6)")).toBeInTheDocument();
		for (let i = 0; i < 6; i++) {
			expect(screen.getByText(`fn${i + 1}`)).toBeInTheDocument();
		}
	});

	it("does not mark any item active when activeId is null", () => {
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId={null}
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		const items = document.querySelectorAll(".call-chain-item");
		expect(items).toHaveLength(2);
		items.forEach((item) => {
			expect(item).not.toHaveClass("active");
		});
	});

	it("does not mark any item active when activeId does not match", () => {
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId="non-existent"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		const items = document.querySelectorAll(".call-chain-item");
		expect(items).toHaveLength(2);
		items.forEach((item) => {
			expect(item).not.toHaveClass("active");
		});
	});

	it("sets auto-label for mixed named and unnamed calls", () => {
		const calls = [
			makeCall("1", "createLongQuotesSlides"),
			makeCall("2", ""),
			makeCall("3", "setHeaders"),
		];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText("Save"));
		const input = screen.getByPlaceholderText("Name this preset...") as HTMLInputElement;
		expect(input.value).toBe("createLongQuotesSlides + Call 2 + setHeaders");
	});

	it("commits save via dialog Save button click", async () => {
		const onSave = vi.fn();
		const calls = [makeCall("1", "createLongQuotesSlides"), makeCall("2", "setHeaders")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={onSave}
			/>,
		);
		fireEvent.click(screen.getByText("Save"));
		const saveDialogBtn = screen.getAllByText("Save")[1]!;
		fireEvent.change(screen.getByPlaceholderText("Name this preset..."), { target: { value: "My Preset" } });
		fireEvent.click(saveDialogBtn);
		expect(onSave).toHaveBeenCalledWith("My Preset");
	});

	it("displays index numbering (1., 2., 3.) for each call", () => {
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB"), makeCall("3", "fnC")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		const indices = document.querySelectorAll(".chain-index");
		expect(indices).toHaveLength(3);
		expect(indices[0]).toHaveTextContent("1.");
		expect(indices[1]).toHaveTextContent("2.");
		expect(indices[2]).toHaveTextContent("3.");
	});

	it("transitions from full view to compact view when calls drop from 2 to 1", () => {
		const { rerender } = render(
			<CallChain
				calls={[makeCall("1", "fnA"), makeCall("2", "fnB")]}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(screen.getByText("Call Chain (2)")).toBeInTheDocument();

		rerender(
			<CallChain
				calls={[makeCall("1", "fnA")]}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(screen.getByText("+ Add Call")).toBeInTheDocument();
		expect(screen.getByTitle("Save chain to history")).toBeInTheDocument();
	});

	it("save dialog Escape key closes dialog", async () => {
		const calls = [makeCall("1", "fnA")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText("Save"));
		const input = screen.getByPlaceholderText("Name this preset...");
		fireEvent.keyDown(input, { key: "Escape" });
		expect(screen.queryByPlaceholderText("Name this preset...")).not.toBeInTheDocument();
	});

	it("reorders calls via drag and drop", () => {
		const onReorder = vi.fn();
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		const dataTransfer = { effectAllowed: "", dropEffect: "", setData: vi.fn() };
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onReorder={onReorder}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		const items = document.querySelectorAll(".call-chain-item");
		fireEvent.dragStart(items[0]!, { dataTransfer });
		fireEvent.dragOver(items[1]!, { dataTransfer });
		fireEvent.drop(items[1]!, { dataTransfer });
		fireEvent.dragEnd(items[0]!);
		expect(onReorder).toHaveBeenCalledWith(0, 1);
	});

	it("selects call when Enter is pressed on item", () => {
		const onSelect = vi.fn();
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={onSelect}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		fireEvent.keyDown(screen.getAllByText("fnB")[0]!, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledWith("2");
	});

	it("selects call when Space is pressed on item", () => {
		const onSelect = vi.fn();
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId={null}
				onSelect={onSelect}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		fireEvent.keyDown(screen.getByText("fnB"), { key: " " });
		expect(onSelect).toHaveBeenCalledWith("2");
	});

	it("does not call onSelect when non-Enter/non-Space key is pressed", () => {
		const onSelect = vi.fn();
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={onSelect}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		fireEvent.keyDown(screen.getByText("fnB"), { key: "Escape" });
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("does not call onReorder when dragging and dropping on same index", () => {
		const onReorder = vi.fn();
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		const dataTransfer = { effectAllowed: "", dropEffect: "", setData: vi.fn() };
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onReorder={onReorder}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		const items = document.querySelectorAll(".call-chain-item");
		fireEvent.dragStart(items[0]!, { dataTransfer });
		fireEvent.drop(items[0]!, { dataTransfer });
		fireEvent.dragEnd(items[0]!);
		expect(onReorder).not.toHaveBeenCalled();
	});

	it("does not call onReorder when onReorder is undefined", () => {
		const calls = [makeCall("1", "fnA"), makeCall("2", "fnB")];
		const dataTransfer = { effectAllowed: "", dropEffect: "", setData: vi.fn() };
		render(
			<CallChain
				calls={calls}
				activeId="1"
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onReorder={undefined}
				onAdd={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		const items = document.querySelectorAll(".call-chain-item");
		fireEvent.dragStart(items[0]!, { dataTransfer });
		fireEvent.dragOver(items[1]!, { dataTransfer });
		fireEvent.drop(items[1]!, { dataTransfer });
		fireEvent.dragEnd(items[0]!);
	});

	it("does not crash when onAdd is null", () => {
		const calls = [
			{ id: "1", name: "Call 1", params: {} },
		];

		const { getByText } = render(
			<CallChain
				calls={calls}
				activeId={null}
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={null as unknown as () => void}
				onSave={vi.fn()}
			/>,
		);

		expect(getByText("+ Add Call")).toBeInTheDocument();
	});

	it("does not crash when onSave is null", () => {
		const calls = [
			{ id: "1", name: "Call 1", params: {} },
		];

		const { getByText } = render(
			<CallChain
				calls={calls}
				activeId={null}
				onSelect={vi.fn()}
				onRemove={vi.fn()}
				onMoveUp={vi.fn()}
				onMoveDown={vi.fn()}
				onAdd={vi.fn()}
				onSave={null as unknown as (label?: string) => void}
			/>,
		);

		expect(getByText("Save")).toBeInTheDocument();
	});
});
