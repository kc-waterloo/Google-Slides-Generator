/**
 * utils.ts
 *
 * Created by Min-Kyu Lee on 30-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { FunctionSchema } from "@gsg/shared";

export const MAX_HISTORY = 15;
const HISTORY_STORAGE_KEY = "gsg-call-history";
export const DRAFT_STORAGE_KEY = "gsg-draft";

export interface CallEntry {
	id: string;
	name: string;
	params: Record<string, unknown>;
}

export interface HistoryEntry {
	timestamp: number;
	label: string;
	calls: { name: string; params: Record<string, unknown> }[];
}

interface DraftState {
	calls: { id: string; name: string; params: Record<string, unknown> }[];
	activeId: string | null;
	wrapSlideNumbers: boolean;
}

export const buildDefaults = (schema: FunctionSchema): Record<string, unknown> => {
	const defaults: Record<string, unknown> = {};
	for (const [paramName, param] of Object.entries(schema.parameters)) {
		if (param.type === "object[]") {
			defaults[paramName] = [];
		} else {
			defaults[paramName] = param.defaultValue;
		}
	}
	return defaults;
};

export const generateId = (): string => Math.random().toString(36).slice(2, 10);

export const loadHistory = (): HistoryEntry[] => {
	try {
		const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw) as HistoryEntry[];
	} catch {
		return [];
	}
};

export const saveHistory = (entries: HistoryEntry[]): void => {
	try {
		localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
	} catch {
		/* quota exceeded, silently ignore */
	}
};

export const loadDraft = (): DraftState | null => {
	try {
		const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as DraftState;
		if (!Array.isArray(parsed.calls)) return null;
		if ((typeof parsed.activeId !== "string" || parsed.activeId === "") && parsed.activeId !== null) return null;
		if (typeof parsed.wrapSlideNumbers !== "boolean") return null;
		return parsed;
	} catch {
		return null;
	}
};

export const saveDraft = (state: DraftState): void => {
	try {
		localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
	} catch {
		/* quota exceeded, silently ignore */
	}
};

export const loadSpreadsheetHeaders = (): string[] => {
	try {
		const raw = localStorage.getItem("gsg-spreadsheet-headers");
		if (!raw) return [];
		const parsed = JSON.parse(raw) as string[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};
