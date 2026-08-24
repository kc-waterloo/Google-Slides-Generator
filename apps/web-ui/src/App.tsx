/**
 * App.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useEffect, useCallback, useRef, useState } from "react";
import { useFunctionForm } from "./hooks/useFunctionForm";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSlideEstimator } from "./hooks/useSlideEstimator";
import { FunctionSelector } from "./components/FunctionSelector";
import { ParamEditor } from "./components/ParamEditor";
import { CodeOutput } from "./components/CodeOutput";
import { CallChain } from "./components/CallChain";
import { CallHistory } from "./components/CallHistory";
import { TemplateValidator } from "./components/TemplateValidator";
import { ImportCallDialog } from "./components/ImportCallDialog";
import { SpreadsheetHeaders } from "./components/SpreadsheetHeaders";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { SlidePreview } from "./components/SlidePreview";
import { DeployButton } from "./components/DeployButton";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { functionSchemas, validateParams, isRecordArray } from "@gsg/shared";
import { usePptTemplate } from "./hooks/usePptTemplate";
import { useDeploy } from "./hooks/useDeploy";
import { callTypedFn } from "./ppt/dispatch";
import { generateSlidesFromTemplate } from "./ppt/pipeline";

const schemas = Object.values(functionSchemas);

const getInitialTheme = (): "light" | "dark" => {
	const stored = localStorage.getItem("gsg-theme");
	if (stored === "light" || stored === "dark") return stored;
	return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const App = (): React.ReactElement => {
	const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
	const [showImportDialog, setShowImportDialog] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [showResetConfirm, setShowResetConfirm] = useState(false);
	const [outputMode, setOutputMode] = useState<"gas" | "pptx">("gas");
	const [isDragging, setIsDragging] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();
	useEffect(() => { return () => clearTimeout(toastTimerRef.current); }, []);

	const showToast = useCallback((msg: string) => {
		setToast(msg);
		clearTimeout(toastTimerRef.current);
		toastTimerRef.current = setTimeout(() => setToast(null), 4000);
	}, []);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("gsg-theme", theme);
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((t) => (t === "dark" ? "light" : "dark"));
	}, []);
	const {
		selectedFunction,
		params,
		errors,
		generatedCode,
		selectFunction,
		setParam,
		resetAll,
		undo,
		redo,
		undoCount,
		redoCount,
		calls,
		activeId,
		setActiveId,
		addCall,
		removeCall,
		moveCallUp,
		moveCallDown,
		moveCallToIndex,
		wrapSlideNumbers,
		setWrapSlideNumbers,
		saveCurrentToHistory,
		historyEntries,
		loadFromHistory,
		clearHistory,
		renameHistoryEntry,
		deleteHistoryEntry,
		importCallString,
		spreadsheetHeaders,
		setSpreadsheetHeaders,
		draftRestored,
		clearDraft,
	} = useFunctionForm(schemas);

	const {
		template: pptTemplate,
		fileName: pptFileName,
		slideCount: pptSlideCount,
		detectedKeys: pptDetectedKeys,
		loadTemplate: pptLoadTemplate,
		loadFromBuffer: pptLoadFromBuffer,
		openFromAdapter: pptOpenFromAdapter,
		saveViaAdapter: pptSaveViaAdapter,
		isElectron: pptIsElectron,
		clearTemplate: pptClearTemplate,
	} = usePptTemplate();

	const deployCtrl = useDeploy();

	const draftShownRef = useRef(false);
	useEffect(() => {
		if (draftRestored && !draftShownRef.current) {
			draftShownRef.current = true;
			setTimeout(() => showToast("Draft restored"), 100);
		}
	}, [draftRestored, showToast]);

	useEffect(() => {
		if (sidebarOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => { document.body.style.overflow = ""; };
	}, [sidebarOpen]);

	useEffect(() => {
		if (!showResetConfirm) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") setShowResetConfirm(false);
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [showResetConfirm]);

	useEffect(() => {
		const handleDragOver = (e: DragEvent) => {
			if (e.dataTransfer?.types.includes("Files")) {
				e.preventDefault();
				setIsDragging(true);
			}
		};
		const handleDragLeave = () => {
			setIsDragging(false);
		};
		const handleDrop = (e: DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const file = e.dataTransfer?.files?.[0];
			if (file?.name.toLowerCase().endsWith(".pptx")) {
				pptLoadTemplate(file)
					.then(() => showToast(`Loaded template: ${file.name}`))
					.catch((err: Error) => showToast(err.message));
			}
		};

		document.addEventListener("dragover", handleDragOver);
		document.addEventListener("dragleave", handleDragLeave);
		document.addEventListener("drop", handleDrop);
		return () => {
			document.removeEventListener("dragover", handleDragOver);
			document.removeEventListener("dragleave", handleDragLeave);
			document.removeEventListener("drop", handleDrop);
		};
	}, [pptLoadTemplate, showToast]);

	useKeyboardShortcuts({
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
	});

	const importRef = useRef<HTMLInputElement>(null);

	const handleExport = useCallback(() => {
		const blob = new Blob([JSON.stringify(calls.map((c) => ({ name: c.name, params: c.params })), null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${selectedFunction?.name ?? "calls"}.json`;
		a.click();
		URL.revokeObjectURL(url);
		clearDraft();
		showToast("Exported calls.json");
	}, [calls, selectedFunction, showToast, clearDraft]);

	const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== "string") { return; }
			try {
				const parsed = JSON.parse(reader.result);
				if (Array.isArray(parsed) && parsed.length > 0) {
					loadFromHistory({ timestamp: Date.now(), label: "Imported", calls: parsed });
					showToast(`Imported ${parsed.length} call${parsed.length !== 1 ? "s" : ""}`);
				}
			} catch {
				showToast("Invalid JSON file");
			}
		};
		reader.readAsText(file);
		e.target.value = "";
	}, [loadFromHistory, showToast]);

	const handleImportCall = useCallback((name: string, importParams: Record<string, unknown>) => {
		const ok = importCallString(name, importParams);
		showToast(ok ? `Imported ${name}() call` : `Unknown function: ${name}`);
	}, [importCallString, showToast]);

	const handleSave = useCallback((label?: string) => {
		saveCurrentToHistory(label);
		clearDraft();
		showToast(label ? `Saved "${label}"` : "Saved to history");
	}, [saveCurrentToHistory, showToast, clearDraft]);

	const totalSlides = useSlideEstimator(selectedFunction, params);

	const pptImportRef = useRef<HTMLInputElement>(null);

	const handleTemplateUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			await pptLoadTemplate(file);
			showToast(`Loaded template: ${file.name}`);
		} catch (err) {
			console.error("[ppt] Template load failed:", err);
			showToast(err instanceof Error ? err.message : "Failed to load template");
		}
		e.target.value = "";
	}, [pptLoadTemplate, showToast]);

	const executePptFunction = useCallback(async (
		name: string,
		buffer: ArrayBuffer,
		callParams: Record<string, unknown>,
	): Promise<ArrayBuffer> => {
		switch (name) {
		case "createBulletSlide": {
			const { createBulletSlide: fn } = await import("./ppt/functions/create-bullet-slide");
			return callTypedFn(fn, buffer, callParams);
		}
		case "createSummarySlide": {
			const { createSummarySlide: fn } = await import("./ppt/functions/create-summary-slide");
			return callTypedFn(fn, buffer, callParams);
		}
		case "createShortQuotesSlides": {
			const { createShortQuotesSlides: fn } = await import("./ppt/functions/create-short-quotes-slides");
			return callTypedFn(fn, buffer, callParams);
		}
		case "createLongQuotesSlides": {
			const { createLongQuotesSlides: fn } = await import("./ppt/functions/create-long-quotes-slides");
			return callTypedFn(fn, buffer, callParams);
		}
		case "setHeaders": {
			const { setHeaders: fn } = await import("./ppt/functions/set-headers");
			return callTypedFn(fn, buffer, callParams);
		}
		case "batchReplaceText": {
			const { batchReplaceText: fn } = await import("./ppt/functions/batch-replace-text");
			return callTypedFn(fn, buffer, callParams);
		}
		case "batchSetTextStyle": {
			const { batchSetTextStyle: fn } = await import("./ppt/functions/batch-set-text-style");
			return callTypedFn(fn, buffer, callParams);
		}
		case "duplicateSlideRange": {
			const { duplicateSlideRange: fn } = await import("./ppt/functions/duplicate-slide-range");
			return callTypedFn(fn, buffer, callParams);
		}
		case "moveSlides": {
			const { moveSlides: fn } = await import("./ppt/functions/move-slides");
			return callTypedFn(fn, buffer, callParams);
		}
		case "applyBackgroundColor": {
			const { applyBackgroundColor: fn } = await import("./ppt/functions/apply-background-color");
			return callTypedFn(fn, buffer, callParams);
		}
		case "createHighlightVariationSlides": {
			const { createHighlightVariationSlides: fn } = await import("./ppt/functions/create-highlight-variation-slides");
			return callTypedFn(fn, buffer, callParams);
		}
		default: {
			const firstKey = pptDetectedKeys[0];
			if (!firstKey) return buffer;
			return generateSlidesFromTemplate(buffer, [
				{
					templateSourceKey: firstKey,
					textReplacements: Object.fromEntries(
						Object.entries(callParams).map(([k, v]) => [k, String(v ?? "")]),
					),
				},
			]);
		}
		}
	}, [pptDetectedKeys]);

	const handleGeneratePptx = useCallback(async () => {
		if (!pptTemplate) {
			showToast("No template loaded");
			return;
		}
		setIsGenerating(true);
		try {
			let currentBuffer = pptTemplate.buffer;
			const chain = calls.length > 0 ? calls : [{ name: selectedFunction?.name ?? "", params }];

			for (const call of chain) {
				currentBuffer = await executePptFunction(call.name, currentBuffer, call.params);
			}

			if (pptIsElectron && pptSaveViaAdapter) {
				const name = `${pptFileName?.replace(/\.pptx$/i, "") ?? "presentation"}.pptx`;
				await pptSaveViaAdapter(currentBuffer, name);
			} else {
				const blob = new Blob([currentBuffer], {
					type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${pptFileName?.replace(/\.pptx$/i, "") ?? "presentation"}-output.pptx`;
				a.click();
				URL.revokeObjectURL(url);
			}
			showToast("Generated .pptx");
		} catch (err) {
			console.error("[ppt] Generation failed:", err);
			showToast(err instanceof Error ? err.message : "Failed to generate .pptx");
		} finally {
			setIsGenerating(false);
		}
	}, [pptTemplate, pptDetectedKeys, pptFileName, pptSaveViaAdapter, pptIsElectron, calls, selectedFunction, params, showToast, executePptFunction]);

	const handleGeneratePptxRef = useRef(handleGeneratePptx);
	handleGeneratePptxRef.current = handleGeneratePptx;

	useEffect(() => {
		if (typeof window === "undefined" || !window.electronAPI) return;

		const removeFileDrop = window.electronAPI.onFileDrop(async (filePath: string) => {
			try {
				const buffer = await window.electronAPI!.readFileBuffer(filePath);
				if (!buffer) {
					showToast("Failed to read file");
					return;
				}
				const name = filePath.split("/").pop() ?? "template.pptx";
				await pptLoadFromBuffer(buffer, name);
				showToast(`Loaded template: ${name}`);
			} catch (err: unknown) {
				console.error("[ppt] File load failed:", err);
				showToast(err instanceof Error ? err.message : "Failed to load file");
			}
		});

		const removeMenuSaveAs = window.electronAPI.onMenuSaveAs(() => {
			handleGeneratePptxRef.current();
		});

		return () => {
			removeFileDrop();
			removeMenuSaveAs();
		};
	}, [pptLoadFromBuffer, showToast]);

	return (
		<div className={`app${sidebarOpen ? " sidebar-open" : ""}`}>
			<aside className="sidebar">
				<div className="sidebar-header">
					<h1 className="sidebar-title">GSG</h1>
					<p className="sidebar-subtitle">Generator</p>
				</div>
				<div className="sidebar-toolbar">
					<button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
						{theme === "dark" ? "☀️ Light" : "🌙 Dark"}
					</button>
					<KeyboardShortcuts />
				</div>
				<CallHistory
					entries={historyEntries}
					onLoad={loadFromHistory}
					onClear={clearHistory}
					onRename={renameHistoryEntry}
					onDelete={deleteHistoryEntry}
				/>
				<SpreadsheetHeaders
					headers={spreadsheetHeaders}
					onHeadersChange={setSpreadsheetHeaders}
				/>
				<FunctionSelector
					schemas={schemas}
					selected={selectedFunction}
					onSelect={selectFunction}
					errorCount={errors.length}
				/>
			</aside>
			{sidebarOpen && (
				<div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
			)}

			<main className="content">
				<div className="mobile-header">
					<button
						className="hamburger"
						onClick={() => setSidebarOpen(!sidebarOpen)}
						aria-label="Toggle sidebar"
						aria-expanded={sidebarOpen}
					>
						<span className="hamburger-line" />
						<span className="hamburger-line" />
						<span className="hamburger-line" />
					</button>
					<div className="mobile-title">GSG</div>
				</div>
				<ErrorBoundary>
					{selectedFunction ? (
						<>
							<div className="content-header">
								<h2>{selectedFunction.name}</h2>
								{selectedFunction.description && (
									<p className="func-desc">{selectedFunction.description}</p>
								)}
								{totalSlides !== null && (
									<p className="func-stats">
										{totalSlides} slide{totalSlides !== 1 ? "s" : ""} total
										{(() => {
											const items = isRecordArray(params["longQuoteItems"]) ? params["longQuoteItems"]
												: isRecordArray(params["shortQuoteItems"]) ? params["shortQuoteItems"]
												: null;
											if (!items || items.length === 0) return null;
											return <>&nbsp;from {items.length} item{items.length !== 1 ? "s" : ""}</>;
										})()}
									</p>
								)}
							</div>

							<section className="panel params-panel">
								<div className="param-header">
									<h3>Parameters</h3>
									<span className="param-header-actions">
										<button className="reset-btn" onClick={undo} disabled={undoCount === 0} title="Undo (Ctrl+Z)">
										Undo
										</button>
										<button className="reset-btn" onClick={redo} disabled={redoCount === 0} title="Redo (Ctrl+Shift+Z)">
										Redo
										</button>
										<button className="reset-btn" onClick={handleExport} title="Export params as JSON">
										Export
										</button>
										<button className="reset-btn" onClick={() => importRef.current?.click()} title="Import params from JSON">
										Import
										</button>
										<button className="reset-btn" onClick={() => setShowImportDialog(true)} title="Paste a function call to edit it">
										Paste
										</button>
										<button className="reset-btn" onClick={() => setShowResetConfirm(true)} title="Reset all to defaults">
										Reset
										</button>
									</span>
								</div>
								<input
									ref={importRef}
									type="file"
									accept=".json"
									style={{ display: "none" }}
									onChange={handleImport}
								/>
								<ParamEditor
									schema={selectedFunction}
									params={params}
									onChange={setParam}
									errors={errors}
									spreadsheetHeaders={spreadsheetHeaders}
								/>
							</section>

							<section className="panel output-panel">
								<div className="output-tabs">
									<button
										className={`output-tab${outputMode === "gas" ? " active" : ""}`}
										onClick={() => setOutputMode("gas")}
									>
									GAS Code
									</button>
									<button
										className={`output-tab${outputMode === "pptx" ? " active" : ""}`}
										onClick={() => setOutputMode("pptx")}
									>
									PowerPoint
									</button>
								</div>
								{outputMode === "gas" && generatedCode && (
									<>
										<h3>Generated Code</h3>
										<label className="slide-number-toggle">
											<input
												type="checkbox"
												checked={wrapSlideNumbers}
												onChange={(e) => setWrapSlideNumbers(e.target.checked)}
											/>
											<span>Wrap numbers in <code>SlideNumber()</code></span>
										</label>
										<CodeOutput code={generatedCode} />
										<p className="keyboard-shortcuts">
										Ctrl+Z undo &middot; Ctrl+Shift+Z redo &middot; Ctrl+Enter copy &middot; Escape reset
										</p>
										<DeployButton
											state={deployCtrl.state}
											generatedCode={generatedCode}
											onDeploy={deployCtrl.deploy}
											onAuthenticate={deployCtrl.authenticate}
											onSignOut={deployCtrl.signOut}
											onReset={deployCtrl.reset}
											clientId={deployCtrl.clientId}
											onClientIdChange={deployCtrl.setClientId}
										/>
									</>
								)}
								{outputMode === "pptx" && (
									<>
										<h3>PowerPoint Output</h3>
										{!pptTemplate ? (
											<div className="ppt-empty">
												<p>Upload a .pptx template to generate PowerPoint output.</p>
												<p className="ppt-hint">Or drag and drop a .pptx file onto this window</p>
												<input
													ref={pptImportRef}
													type="file"
													accept=".pptx"
													style={{ display: "none" }}
													onChange={handleTemplateUpload}
												/>
												<div className="ppt-empty-actions">
													<button className="btn-primary" onClick={() => pptImportRef.current?.click()}>
													Upload .pptx
													</button>
													<button className="reset-btn" onClick={async () => {
														const ok = await pptOpenFromAdapter();
														if (ok) showToast("Template loaded");
													}}>
													Open Template
													</button>
												</div>
											</div>
										) : (
											<div className="ppt-info">
												<p>Template: <strong>{pptFileName}</strong></p>
												<p>Slides: <strong>{pptSlideCount}</strong></p>
												{pptDetectedKeys.length > 0 && (
													<div className="ppt-detected-keys">
														<p>Detected keys:</p>
														<div className="ppt-key-list">
															{pptDetectedKeys.map((key) => (
																<code key={key} className="tv-key">{key}</code>
															))}
														</div>
													</div>
												)}
												<div className="ppt-actions">
													<button className="btn-primary" onClick={handleGeneratePptx} disabled={isGenerating}>
													{isGenerating ? "Generating..." : "Generate .pptx"}
													</button>
													<button className="reset-btn" onClick={pptClearTemplate}>
													Clear
													</button>
												</div>
											</div>
										)}
									</>
								)}
							</section>
							<SlidePreview
								functionName={selectedFunction?.name ?? null}
								params={params}
							/>

							{selectedFunction && calls.length > 1 && (
								<p className="validation-summary">
									{calls.filter((c) => {
										const s = schemas.find((sc) => sc.name === c.name);
										return s && validateParams(s, c.params).length === 0;
									}).length} of {calls.length} calls valid
								</p>
							)}

							<TemplateValidator selectedName={selectedFunction?.name ?? null} />

							<section className="panel chain-panel">
								<h3>Call Chain</h3>
								<CallChain
									calls={calls}
									activeId={activeId}
									onSelect={setActiveId}
									onRemove={removeCall}
									onMoveUp={moveCallUp}
									onMoveDown={moveCallDown}
									onReorder={moveCallToIndex}
									onAdd={addCall}
									onSave={handleSave}
								/>
							</section>
						</>
					) : (
						<div className="panel empty-panel">
							<p className="empty-title">Select a function from the left sidebar</p>
							<p className="empty-text">
							Fill in the parameters, then copy the generated JavaScript call
							into your Google Apps Script editor. Add multiple calls to chain them together.
							</p>
						</div>
					)}
					{showImportDialog && (
						<ImportCallDialog
							schemas={schemas}
							onImport={handleImportCall}
							onClose={() => setShowImportDialog(false)}
						/>
					)}
					{showResetConfirm && (
						<div className="dialog-overlay" onClick={() => setShowResetConfirm(false)} onKeyDown={(e) => {
							if (e.key === "Escape") { e.stopPropagation(); setShowResetConfirm(false); }
						}}>
							<div className="dialog" onClick={(e) => e.stopPropagation()}>
								<div className="dialog-header">
									<h3>Reset All Parameters?</h3>
								</div>
								<div className="dialog-body">
									<p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
									This will clear all current parameters, undo history, and reset to defaults.
									Your draft is saved — you can restore it by refreshing without saving.
									</p>
								</div>
								<div className="dialog-footer">
									<span className="dialog-footer-hint" />
									<div className="dialog-actions">
										<button className="reset-btn" onClick={() => setShowResetConfirm(false)}>Cancel</button>
										<button className="btn-danger" onClick={() => { resetAll(); setShowResetConfirm(false); }}>
										Reset All
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</ErrorBoundary>
			</main>
			{toast && <div className="toast-container">{toast}</div>}
			{isDragging && <div className="drop-overlay">Drop .pptx template here</div>}
		</div>
	);
};
