/**
 * useFunctionForm.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { FunctionSchema } from "@gsg/shared";
import { validateParams, generateCallString, toRegExpParams } from "@gsg/shared";
import {
	MAX_HISTORY,
	DRAFT_STORAGE_KEY,
	buildDefaults,
	generateId,
	loadHistory,
	saveHistory,
	loadDraft,
	saveDraft,
	loadSpreadsheetHeaders,
} from "./utils";

import type { CallEntry, HistoryEntry } from "./utils";
export type { CallEntry, HistoryEntry };

export const useFunctionForm = (schemas: FunctionSchema[]) => {
	const initialDraft = useRef(loadDraft());

	const draft = initialDraft.current;
	const [calls, setCalls] = useState<CallEntry[]>(draft?.calls ?? []);
	const [activeId, setActiveId] = useState<string | null>(draft?.activeId ?? null);
	const [undoCount, setUndoCount] = useState(0);
	const [redoCount, setRedoCount] = useState(0);
	const [wrapSlideNumbers, setWrapSlideNumbers] = useState(draft?.wrapSlideNumbers ?? false);
	const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(loadHistory);
	const historyRef = useRef<{ id: string; name: string; params: Record<string, unknown> }[][]>([[]]);
	const historyIdxRef = useRef(0);

	const draftRestored = draft !== null && draft.calls.length > 0;

	useEffect(() => {
		const timer = setTimeout(() => {
			if (calls.length > 0) {
				saveDraft({ calls, activeId, wrapSlideNumbers });
			} else {
				localStorage.removeItem(DRAFT_STORAGE_KEY);
			}
		}, 500);
		return () => clearTimeout(timer);
	}, [calls, activeId, wrapSlideNumbers]);

	const clearDraft = useCallback(() => {
		localStorage.removeItem(DRAFT_STORAGE_KEY);
	}, []);

	const pushHistory = useCallback((next: { id: string; name: string; params: Record<string, unknown> }[]) => {
		const idx = historyIdxRef.current;
		historyRef.current = historyRef.current.slice(0, idx + 1);
		historyRef.current.push(next);
		if (historyRef.current.length > MAX_HISTORY) {
			historyRef.current.shift();
		}
		historyIdxRef.current = historyRef.current.length - 1;
		setUndoCount(historyIdxRef.current);
		setRedoCount(0);
	}, []);

	const activeCall = useMemo(
		() => calls.find((c) => c.id === activeId) ?? null,
		[calls, activeId],
	);

	const selectedFunction = useMemo(
		() => schemas.find((s) => s.name === activeCall?.name) ?? null,
		[schemas, activeCall],
	);

	const params = activeCall?.params ?? {};

	const selectFunction = useCallback((schema: FunctionSchema) => {
		const defaults = buildDefaults(schema);
		const id = activeCall?.id ?? generateId();
		const newCalls = activeCall
			? calls.map((c) => (c.id === id ? { ...c, name: schema.name, params: defaults } : c))
			: [...calls, { id, name: schema.name, params: defaults }];

		setCalls(newCalls);
		setActiveId(id);
		historyRef.current = [newCalls.map((c) => ({ id: c.id, name: c.name, params: c.params }))];
		historyIdxRef.current = 0;
		setUndoCount(0);
		setRedoCount(0);
	}, [calls, activeCall]);

	const setParam = useCallback((name: string, value: unknown) => {
		if (!activeId) return;
		const next = calls.map((c) =>
			c.id === activeId ? { ...c, params: { ...c.params, [name]: value } } : c,
		);
		setCalls(next);
		pushHistory(next.map((c) => ({ id: c.id, name: c.name, params: c.params })));
	}, [activeId, calls, pushHistory]);

	const resetAll = useCallback(() => {
		if (selectedFunction && activeId) {
			const defaults = buildDefaults(selectedFunction);
			const next = calls.map((c) =>
				c.id === activeId ? { ...c, params: defaults } : c,
			);
			setCalls(next);
			pushHistory(next.map((c) => ({ id: c.id, name: c.name, params: c.params })));
		}
	}, [selectedFunction, activeId, calls, pushHistory]);

	const undo = useCallback(() => {
		const idx = historyIdxRef.current;
		if (idx <= 0) return;
		historyIdxRef.current = idx - 1;
		const restored = historyRef.current[idx - 1]!;
		setCalls(restored);
		setUndoCount(historyIdxRef.current);
		setRedoCount((prev) => prev + 1);
	}, []);

	const redo = useCallback(() => {
		const idx = historyIdxRef.current;
		if (idx >= historyRef.current.length - 1) return;
		historyIdxRef.current = idx + 1;
		const restored = historyRef.current[idx + 1]!;
		setCalls(restored);
		setUndoCount(historyIdxRef.current);
		setRedoCount((prev) => prev - 1);
	}, []);

	const addCall = useCallback(() => {
		const id = generateId();
		const next = [...calls, { id, name: "", params: {} }];
		setCalls(next);
		setActiveId(id);
		pushHistory(next.map((c) => ({ id: c.id, name: c.name, params: c.params })));
	}, [calls, pushHistory]);

	const removeCall = useCallback((id: string) => {
		if (!window.confirm("Remove this call from the chain?")) return;

		const idx = calls.findIndex((c) => c.id === id);
		const next = calls.filter((c) => c.id !== id);

		setCalls(next);
		if (activeId === id) {
			const newIdx = Math.min(idx, next.length - 1);
			setActiveId(next[newIdx]?.id ?? null);
		}
		pushHistory(next.map((c) => ({ id: c.id, name: c.name, params: c.params })));
	}, [activeId, calls, pushHistory]);

	const moveCallUp = useCallback((id: string) => {
		const idx = calls.findIndex((c) => c.id === id);
		if (idx <= 0) return;
		const next = [...calls];
		[next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
		setCalls(next);
		pushHistory(next.map((c) => ({ id: c.id, name: c.name, params: c.params })));
	}, [calls, pushHistory]);

	const moveCallDown = useCallback((id: string) => {
		const idx = calls.findIndex((c) => c.id === id);
		if (idx >= calls.length - 1) return;
		const next = [...calls];
		[next[idx], next[idx + 1]] = [next[idx + 1]!, next[idx]!];
		setCalls(next);
		pushHistory(next.map((c) => ({ id: c.id, name: c.name, params: c.params })));
	}, [calls, pushHistory]);

	const moveCallToIndex = useCallback((fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) return;
		const next = [...calls];
		const [item] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, item!);
		setCalls(next);
		pushHistory(next.map((c) => ({ id: c.id, name: c.name, params: c.params })));
	}, [calls, pushHistory]);

	const errors = useMemo(() => {
		if (!selectedFunction) return [];
		return validateParams(selectedFunction, params);
	}, [selectedFunction, params]);

	const generatedCode = useMemo(() => {
		const parts: string[] = [];
		for (const call of calls) {
			const schema = schemas.find((s) => s.name === call.name);
			if (!schema) continue;
			const hasErrors = validateParams(schema, call.params).length > 0;
			if (hasErrors) continue;
			parts.push(
				generateCallString(call.name, toRegExpParams(schema, call.params), 2, wrapSlideNumbers),
			);
		}
		return parts.length > 0 ? parts.join("\n\n") : null;
	}, [calls, schemas, wrapSlideNumbers]);

	const saveCurrentToHistory = useCallback((label?: string) => {
		if (calls.length === 0) return;
		const entry: HistoryEntry = {
			timestamp: Date.now(),
			label: (label ?? calls.map((c) => c.name || "?").join(" + ")) || "Untitled",
			calls: calls.map((c) => ({ name: c.name, params: c.params })),
		};
		const next = [entry, ...historyEntries].slice(0, MAX_HISTORY);
		setHistoryEntries(next);
		saveHistory(next);
	}, [calls, historyEntries]);

	const loadFromHistory = useCallback((entry: HistoryEntry) => {
		const loaded = entry.calls.map((c) => ({
			id: generateId(),
			name: c.name,
			params: c.params,
		}));
		setCalls(loaded);
		setActiveId(loaded[0]?.id ?? null);
		historyRef.current = [loaded.map((c) => ({ id: c.id, name: c.name, params: c.params }))];
		historyIdxRef.current = 0;
		setUndoCount(0);
		setRedoCount(0);
	}, []);

	const clearHistory = useCallback(() => {
		if (!window.confirm("Clear all saved history?")) return;
		setHistoryEntries([]);
		saveHistory([]);
	}, []);

	const renameHistoryEntry = useCallback((timestamp: number, label: string) => {
		const next = historyEntries.map((e) =>
			e.timestamp === timestamp ? { ...e, label } : e,
		);
		setHistoryEntries(next);
		saveHistory(next);
	}, [historyEntries]);

	const deleteHistoryEntry = useCallback((timestamp: number) => {
		const next = historyEntries.filter((e) => e.timestamp !== timestamp);
		setHistoryEntries(next);
		saveHistory(next);
	}, [historyEntries]);

	const importCallString = useCallback((name: string, importParams: Record<string, unknown>): boolean => {
		const schema = schemas.find((s) => s.name === name);
		if (!schema) return false;

		const id = generateId();
		const sanitized: Record<string, unknown> = {};
		for (const [key, param] of Object.entries(schema.parameters)) {
			const val = importParams[key];
			if (val === undefined) {
				sanitized[key] = param.type === "object[]" ? [] : param.defaultValue;
			} else {
				sanitized[key] = val;
			}
		}

		const newCalls = [...calls, { id, name, params: sanitized }];
		setCalls(newCalls);
		setActiveId(id);
		historyRef.current = [newCalls.map((c) => ({ id: c.id, name: c.name, params: c.params }))];
		historyIdxRef.current = 0;
		setUndoCount(0);
		setRedoCount(0);
		return true;
	}, [calls, schemas]);

	const [spreadsheetHeaders, setSpreadsheetHeaders] = useState<string[]>(loadSpreadsheetHeaders);

	return {
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
		activeCall,
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
	} as const;
};
