/**
 * KeyboardShortcuts.test.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

describe("KeyboardShortcuts", () => {
	it("renders the ? button", () => {
		render(<KeyboardShortcuts />);
		const btn = screen.getByText("?");
		expect(btn).toBeInTheDocument();
		expect(btn).toHaveAttribute("title", "Keyboard shortcuts");
	});

	it("clicking opens the dialog with shortcut list", async () => {
		render(<KeyboardShortcuts />);
		await fireEvent.click(screen.getByText("?"));
		expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
		expect(screen.getByText(/Reset all parameters/)).toBeInTheDocument();
	});

	it("Escape closes the dialog", async () => {
		render(<KeyboardShortcuts />);
		await fireEvent.click(screen.getByText("?"));
		expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
		await fireEvent.keyDown(window, { key: "Escape" });
		expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
	});

	it("clicking backdrop closes the dialog", async () => {
		const { container } = render(<KeyboardShortcuts />);
		await fireEvent.click(screen.getByText("?"));
		expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
		const overlay = container.querySelector(".dialog-overlay");
		expect(overlay).toBeInTheDocument();
		await fireEvent.click(overlay!);
		expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
	});

	it("shows correct shortcut text for Escape, Ctrl+Z, etc.", async () => {
		render(<KeyboardShortcuts />);
		await fireEvent.click(screen.getByText("?"));
		expect(screen.getByText("Escape")).toBeInTheDocument();
		expect(screen.getByText("Ctrl+Z / ⌘+Z")).toBeInTheDocument();
		expect(screen.getByText("Ctrl+Shift+Z / ⌘+Shift+Z")).toBeInTheDocument();
		expect(screen.getByText("Ctrl+Enter / ⌘+Enter")).toBeInTheDocument();
		expect(screen.getByText("Ctrl+Enter (in Paste dialog)")).toBeInTheDocument();
	});

	it("clicking close button closes the dialog", async () => {
		render(<KeyboardShortcuts />);
		await fireEvent.click(screen.getByText("?"));
		expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
		const closeBtn = screen.getByLabelText("Close dialog");
		await fireEvent.click(closeBtn);
		expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
	});

	it("clicking inside the dialog does not close it", async () => {
		const { container } = render(<KeyboardShortcuts />);
		await fireEvent.click(screen.getByText("?"));
		expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
		const dialogBody = container.querySelector(".shortcuts-dialog")!;
		await fireEvent.click(dialogBody);
		expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
	});

	it("non-Escape key does not close dialog", async () => {
		render(<KeyboardShortcuts />);
		await fireEvent.click(screen.getByText("?"));
		expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
		await fireEvent.keyDown(window, { key: "Enter" });
		expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
	});
});
