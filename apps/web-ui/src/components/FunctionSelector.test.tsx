/**
 * FunctionSelector.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FunctionSelector } from "./FunctionSelector";
import type { FunctionSchema } from "@gsg/shared";

const makeSchema = (name: string): FunctionSchema => ({
	name,
	description: `Description for ${name}`,
	parameters: {},
});

const schemas: FunctionSchema[] = [
	makeSchema("createLongQuotesSlides"),
	makeSchema("createShortQuotesSlides"),
	makeSchema("setHeaders"),
	makeSchema("replaceAll"),
];

describe("FunctionSelector", () => {
	it("renders all schemas as buttons", () => {
		const onSelect = vi.fn();
		render(
			<FunctionSelector
				schemas={schemas}
				selected={null}
				onSelect={onSelect}
				errorCount={0}
			/>,
		);
		schemas.forEach((s) => {
			expect(screen.getByText(s.name)).toBeInTheDocument();
		});
	});

	it("calls onSelect when a function button is clicked", async () => {
		const onSelect = vi.fn();
		render(
			<FunctionSelector
				schemas={schemas}
				selected={null}
				onSelect={onSelect}
				errorCount={0}
			/>,
		);
		await fireEvent.click(screen.getByText("setHeaders"));
		expect(onSelect).toHaveBeenCalledWith(schemas[2]);
	});

	it("filters the list when search query is typed", async () => {
		const user = userEvent.setup();
		render(
			<FunctionSelector
				schemas={schemas}
				selected={null}
				onSelect={vi.fn()}
				errorCount={0}
			/>,
		);
		const input = screen.getByPlaceholderText("Filter functions...");
		await user.type(input, "long");
		expect(screen.getByText("createLongQuotesSlides")).toBeInTheDocument();
		expect(screen.queryByText("replaceAll")).not.toBeInTheDocument();
	});

	it("shows no-match message when search has no results", async () => {
		const user = userEvent.setup();
		render(
			<FunctionSelector
				schemas={schemas}
				selected={null}
				onSelect={vi.fn()}
				errorCount={0}
			/>,
		);
		await user.type(screen.getByPlaceholderText("Filter functions..."), "zzzzz");
		expect(screen.getByText(/No functions match/)).toBeInTheDocument();
	});

	it("shows error badge on selected function when errorCount > 0", () => {
		render(
			<FunctionSelector
				schemas={schemas}
				selected={schemas[0]!}
				onSelect={vi.fn()}
				errorCount={3}
			/>,
		);
		const badge = screen.getByText("3");
		expect(badge).toHaveClass("error-badge");
	});

	it("does not show error badge when errorCount is 0", () => {
		render(
			<FunctionSelector
				schemas={schemas}
				selected={schemas[0]!}
				onSelect={vi.fn()}
				errorCount={0}
			/>,
		);
		expect(screen.queryByText("3")).not.toBeInTheDocument();
	});

	it("clearing search restores all functions", async () => {
		const user = userEvent.setup();
		render(
			<FunctionSelector
				schemas={schemas}
				selected={null}
				onSelect={vi.fn()}
				errorCount={0}
			/>,
		);
		const input = screen.getByPlaceholderText("Filter functions...");
		await user.type(input, "long");
		expect(screen.queryByText("replaceAll")).not.toBeInTheDocument();
		await user.clear(input);
		schemas.forEach((s) => {
			expect(screen.getByText(s.name)).toBeInTheDocument();
		});
	});

	it("search is case-insensitive", async () => {
		const user = userEvent.setup();
		render(
			<FunctionSelector
				schemas={schemas}
				selected={null}
				onSelect={vi.fn()}
				errorCount={0}
			/>,
		);
		await user.type(screen.getByPlaceholderText("Filter functions..."), "SETHEADERS");
		expect(screen.getByText("setHeaders")).toBeInTheDocument();
		expect(screen.queryByText("replaceAll")).not.toBeInTheDocument();
	});

	it("search with whitespace prefix still filters", async () => {
		const user = userEvent.setup();
		render(
			<FunctionSelector
				schemas={schemas}
				selected={null}
				onSelect={vi.fn()}
				errorCount={0}
			/>,
		);
		await user.type(screen.getByPlaceholderText("Filter functions..."), "  long  ");
		expect(screen.getByText("createLongQuotesSlides")).toBeInTheDocument();
	});

	it("renders empty state with zero schemas", () => {
		const { container } = render(
			<FunctionSelector
				schemas={[]}
				selected={null}
				onSelect={vi.fn()}
				errorCount={0}
			/>,
		);
		expect(container.querySelector(".function-grid")?.children.length ?? 0).toBe(0);
	});

	it("does not crash when onSelect is null", () => {
		const schemas = [
			{ name: "createBulletSlide", description: "Creates bullet slides", parameters: { title: { name: "title", type: "string" as const, optional: false, description: "Title" } } },
		];

		const { getByText } = render(
			<FunctionSelector
				schemas={schemas as FunctionSchema[]}
				selected={null}
				onSelect={null as unknown as (schema: FunctionSchema) => void}
				errorCount={0}
			/>,
		);

		expect(getByText("createBulletSlide")).toBeInTheDocument();
	});

	it("does not crash when schemas is null", () => {
		const { container } = render(
			<FunctionSelector
				schemas={null as unknown as FunctionSchema[]}
				selected={null}
				onSelect={vi.fn()}
				errorCount={0}
			/>,
		);

		expect(container.textContent).toBe("");
	});
});
