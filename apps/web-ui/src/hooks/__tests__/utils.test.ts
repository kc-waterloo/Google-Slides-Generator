/**
 * utils.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { buildDefaults, generateId, loadHistory, saveHistory, loadDraft, saveDraft, loadSpreadsheetHeaders } from "../utils";

const mockSchema = {
	name: "test",
	parameters: {
		title: { type: "string", defaultValue: "Default Title" },
		bullets: { type: "object[]", defaultValue: [] },
		count: { type: "number", defaultValue: 5 },
		optional: { type: "string", defaultValue: undefined },
	},
} as never;

describe("buildDefaults", () => {
	it("returns empty array for object[] params", () => {
		const defaults = buildDefaults(mockSchema);
		expect(defaults.bullets).toEqual([]);
	});

	it("uses defaultValue for non-array params", () => {
		const defaults = buildDefaults(mockSchema);
		expect(defaults.title).toBe("Default Title");
		expect(defaults.count).toBe(5);
	});

	it("handles undefined default values", () => {
		const defaults = buildDefaults(mockSchema);
		expect(defaults.optional).toBeUndefined();
	});
});

describe("generateId", () => {
	it("returns a string of 8 characters", () => {
		const id = generateId();
		expect(id).toHaveLength(8);
	});

	it("returns different values on each call", () => {
		const ids = new Set(Array.from({ length: 100 }, () => generateId()));
		expect(ids.size).toBeGreaterThan(1);
	});
});

describe("loadHistory", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns empty array when no history saved", () => {
		expect(loadHistory()).toEqual([]);
	});

	it("returns parsed history entries", () => {
		const entries = [{ timestamp: 1, label: "test", calls: [] }];
		localStorage.setItem("gsg-call-history", JSON.stringify(entries));
		expect(loadHistory()).toEqual(entries);
	});

	it("returns empty array on corrupt data", () => {
		localStorage.setItem("gsg-call-history", "not json");
		expect(loadHistory()).toEqual([]);
	});
});

describe("saveHistory", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("saves entries to localStorage", () => {
		const entries = [{ timestamp: 1, label: "test", calls: [] }];
		saveHistory(entries);
		const raw = localStorage.getItem("gsg-call-history");
		expect(JSON.parse(raw!)).toEqual(entries);
	});

	it("overwrites previous entries", () => {
		saveHistory([{ timestamp: 1, label: "first", calls: [] }]);
		saveHistory([{ timestamp: 2, label: "second", calls: [] }]);
		const raw = JSON.parse(localStorage.getItem("gsg-call-history")!);
		expect(raw).toHaveLength(1);
		expect(raw[0].label).toBe("second");
	});
});

describe("loadDraft", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns null when no draft saved", () => {
		expect(loadDraft()).toBeNull();
	});

	it("returns parsed draft state", () => {
		const draft = { calls: [{ id: "abc", name: "test", params: {} }], activeId: "abc", wrapSlideNumbers: false };
		localStorage.setItem("gsg-draft", JSON.stringify(draft));
		expect(loadDraft()).toEqual(draft);
	});

	it("returns null when calls is not an array", () => {
		localStorage.setItem("gsg-draft", JSON.stringify({ calls: "invalid", activeId: null, wrapSlideNumbers: true }));
		expect(loadDraft()).toBeNull();
	});

	it("returns null when wrapSlideNumbers is missing", () => {
		localStorage.setItem("gsg-draft", JSON.stringify({ calls: [], activeId: null }));
		expect(loadDraft()).toBeNull();
	});

	it("returns null when activeId is missing", () => {
		localStorage.setItem("gsg-draft", JSON.stringify({ calls: [], wrapSlideNumbers: false }));
		expect(loadDraft()).toBeNull();
	});

	it("returns null when activeId is not a string or null", () => {
		localStorage.setItem("gsg-draft", JSON.stringify({ calls: [], activeId: 123, wrapSlideNumbers: true }));
		expect(loadDraft()).toBeNull();
	});

	it("returns null when activeId is empty string", () => {
		localStorage.setItem("gsg-draft", JSON.stringify({ calls: [], activeId: "", wrapSlideNumbers: true }));
		expect(loadDraft()).toBeNull();
	});

	it("returns null on corrupt data", () => {
		localStorage.setItem("gsg-draft", "not json");
		expect(loadDraft()).toBeNull();
	});
});

describe("saveDraft", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("saves draft to localStorage", () => {
		const draft = { calls: [], activeId: null, wrapSlideNumbers: true };
		saveDraft(draft);
		const raw = localStorage.getItem("gsg-draft");
		expect(JSON.parse(raw!)).toEqual(draft);
	});
});

describe("loadSpreadsheetHeaders", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns empty array when no headers saved", () => {
		expect(loadSpreadsheetHeaders()).toEqual([]);
	});

	it("returns parsed headers", () => {
		localStorage.setItem("gsg-spreadsheet-headers", JSON.stringify(["A", "B"]));
		expect(loadSpreadsheetHeaders()).toEqual(["A", "B"]);
	});

	it("returns empty array when saved value is not an array", () => {
		localStorage.setItem("gsg-spreadsheet-headers", JSON.stringify("not array"));
		expect(loadSpreadsheetHeaders()).toEqual([]);
	});

	it("returns empty array on corrupt data", () => {
		localStorage.setItem("gsg-spreadsheet-headers", "not json");
		expect(loadSpreadsheetHeaders()).toEqual([]);
	});
});
