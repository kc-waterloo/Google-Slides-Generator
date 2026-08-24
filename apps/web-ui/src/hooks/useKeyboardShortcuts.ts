/**
 * useKeyboardShortcuts.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useCallback, useEffect } from "react";

export interface UseKeyboardShortcutsOptions {
	showImportDialog: boolean;
	showResetConfirm: boolean;
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	setShowResetConfirm: (open: boolean) => void;
	resetAll: () => void;
	undo: () => void;
	redo: () => void;
	generatedCode: string | null;
	showToast: (msg: string) => void;
}

export const useKeyboardShortcuts = ({
	showImportDialog,
	showResetConfirm,
	sidebarOpen,
	setSidebarOpen,
	setShowResetConfirm,
	resetAll,
	undo,
	redo,
	generatedCode,
	showToast,
}: UseKeyboardShortcutsOptions): void => {
	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if (e.key === "Escape") {
			if (showImportDialog || showResetConfirm) return;
			if (sidebarOpen) { setSidebarOpen(false); return; }
			setShowResetConfirm(true);
			return;
		}
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
			e.preventDefault();
			if (e.shiftKey) {
				redo();
			} else {
				undo();
			}
			return;
		}
		if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
			if (generatedCode) {
				e.preventDefault();
				try {
					if (navigator.clipboard?.writeText) {
						navigator.clipboard.writeText(generatedCode).then(
							() => showToast("Copied to clipboard"),
							() => showToast("Failed to copy"),
						);
					} else {
						const textarea = document.createElement("textarea");
						textarea.value = generatedCode;
						textarea.style.position = "fixed";
						textarea.style.opacity = "0";
						document.body.appendChild(textarea);
						textarea.select();
						document.execCommand("copy");
						document.body.removeChild(textarea);
						showToast("Copied to clipboard");
					}
				} catch {
					showToast("Failed to copy");
				}
			}
		}
	}, [resetAll, generatedCode, undo, redo, showToast, showImportDialog, sidebarOpen, showResetConfirm]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
};
