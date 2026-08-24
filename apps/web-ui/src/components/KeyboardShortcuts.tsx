/**
 * KeyboardShortcuts.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState, useEffect } from "react";

const SHORTCUTS = [
	{ keys: "Escape", action: "Reset all parameters to defaults" },
	{ keys: "Ctrl+Z / ⌘+Z", action: "Undo last change" },
	{ keys: "Ctrl+Shift+Z / ⌘+Shift+Z", action: "Redo last undo" },
	{ keys: "Ctrl+Enter / ⌘+Enter", action: "Copy generated code to clipboard" },
	{ keys: "Ctrl+Enter (in Paste dialog)", action: "Parse and import pasted call" },
];

export const KeyboardShortcuts = (): React.ReactElement => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpen(false);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [open]);

	return (
		<>
			<button
				className="reset-btn"
				onClick={() => setOpen(true)}
				title="Keyboard shortcuts"
				aria-label="Keyboard shortcuts"
			>
				?
			</button>
			{open && (
				<div className="dialog-overlay" onClick={() => setOpen(false)}>
					<div
						className="dialog shortcuts-dialog"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="dialog-header">
							<h3>Keyboard Shortcuts</h3>
							<button className="dialog-close" onClick={() => setOpen(false)} aria-label="Close dialog">&times;</button>
						</div>
						<div className="dialog-body">
							<div className="shortcuts-table">
								{SHORTCUTS.map((s, i) => (
									<div key={i} className="shortcut-row">
										<kbd className="shortcut-keys">{s.keys}</kbd>
										<span className="shortcut-action">{s.action}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
