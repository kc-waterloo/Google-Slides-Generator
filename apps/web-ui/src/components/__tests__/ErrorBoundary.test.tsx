/**
 * ErrorBoundary.test.tsx
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../ErrorBoundary";

const GoodChild = (): React.ReactElement => <div>All good</div>;

const BadChild = (): React.ReactElement => {
	throw new Error("Test error");
};

describe("ErrorBoundary", () => {
	it("renders children when no error occurs", () => {
		render(
			<ErrorBoundary>
				<GoodChild />
			</ErrorBoundary>,
		);
		expect(screen.getByText("All good")).toBeInTheDocument();
	});

	it("renders default fallback when child throws", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary>
				<BadChild />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		expect(screen.getByText("Test error")).toBeInTheDocument();

		(console.error as ReturnType<typeof vi.fn>).mockRestore();
	});

	it("renders custom fallback when provided", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary fallback={<div>Custom fallback</div>}>
				<BadChild />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Custom fallback")).toBeInTheDocument();
		expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();

		(console.error as ReturnType<typeof vi.fn>).mockRestore();
	});

	it("Try Again button appears and is clickable", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary>
				<BadChild />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		const tryAgainBtn = screen.getByText("Try Again");
		expect(tryAgainBtn).toBeInTheDocument();
		expect(() => fireEvent.click(tryAgainBtn)).not.toThrow();

		(console.error as ReturnType<typeof vi.fn>).mockRestore();
	});

	it("shows default message when error has no message property", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		const ThrowsNoMsg = (): React.ReactElement => {
			throw { name: "TestError" };
		};

		render(
			<ErrorBoundary>
				<ThrowsNoMsg />
			</ErrorBoundary>,
		);

		expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();

		(console.error as ReturnType<typeof vi.fn>).mockRestore();
	});
});
