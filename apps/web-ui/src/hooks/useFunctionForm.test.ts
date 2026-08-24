/**
 * useFunctionForm.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { renderHook, act } from "@testing-library/react";
import type { FunctionSchema } from "@gsg/shared";
import { useFunctionForm } from "./useFunctionForm";
import { createMockStorage } from "../utils/test-utils";

const testSchema: FunctionSchema = {
	name: "testFunction",
	description: "A test function",
	parameters: {
		name: { name: "name", type: "string", optional: false, description: "Name field" },
		count: { name: "count", type: "number", optional: true, defaultValue: 5, description: "Count field" },
		items: {
			name: "items",
			type: "object[]",
			optional: true,
			defaultValue: [],
			arrayItemSchema: {
				title: { name: "title", type: "string", optional: false },
			},
		},
		flags: { name: "flags", type: "string[]", optional: true },
	},
};

let timeCounter = 1000;

beforeAll(() => {
	vi.spyOn(Date, "now").mockImplementation(() => timeCounter++);
	vi.stubGlobal("localStorage", createMockStorage());
});

afterAll(() => {
	vi.restoreAllMocks();
});

describe("useFunctionForm", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("selectFunction creates a call with defaults", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});

		expect(result.current.calls).toHaveLength(1);
		expect(result.current.calls[0]!.name).toBe("testFunction");
		expect(result.current.params.name).toBeUndefined();
		expect(result.current.params.count).toBe(5);
		expect(result.current.params.items).toEqual([]);
	});

	it("setParam updates the active call's params", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.setParam("name", "hello");
		});

		expect(result.current.params.name).toBe("hello");
	});

	it("resetAll restores defaults", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.setParam("name", "hello");
		});
		act(() => {
			result.current.resetAll();
		});

		expect(result.current.params.name).toBeUndefined();
		expect(result.current.params.count).toBe(5);
		expect(result.current.params.items).toEqual([]);
	});

	it("addCall adds an empty call and sets it active", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		const initialActiveId = result.current.activeId;

		act(() => {
			result.current.addCall();
		});

		expect(result.current.calls).toHaveLength(2);
		expect(result.current.activeId).not.toBe(initialActiveId);
		expect(result.current.calls[1]!.name).toBe("");
		expect(result.current.calls[1]!.params).toEqual({});
	});

	it("removeCall removes a call", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		const firstId = result.current.calls[0]!.id;

		act(() => {
			result.current.addCall();
		});
		act(() => {
			result.current.removeCall(firstId);
		});

		expect(result.current.calls).toHaveLength(1);
	});

	it("moveCallUp and moveCallDown reorder calls", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.addCall();
		});
		act(() => {
			result.current.addCall();
		});

		const ids = result.current.calls.map((c) => c.id);
		act(() => {
			result.current.moveCallUp(ids[2]!);
		});

		expect(result.current.calls[0]!.id).toBe(ids[0]);
		expect(result.current.calls[1]!.id).toBe(ids[2]);
		expect(result.current.calls[2]!.id).toBe(ids[1]);
	});

	it("generatedCode returns null when no calls", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		expect(result.current.generatedCode).toBeNull();
	});

	it("generatedCode returns code for valid calls", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.setParam("name", "hello");
		});

		expect(result.current.generatedCode).toContain("testFunction");
		expect(result.current.generatedCode).not.toBeNull();
	});

	it("generatedCode returns null when required param missing", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});

		expect(result.current.generatedCode).toBeNull();
	});

	it("generatedCode joins multiple valid calls", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.setParam("name", "hello");
		});
		act(() => {
			result.current.addCall();
		});
		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.setParam("name", "world");
		});

		expect(result.current.generatedCode).toContain("\n\n");
		const matches = result.current.generatedCode!.match(/testFunction/g);
		expect(matches).toHaveLength(2);
	});

	it("wrapSlideNumbers affects generatedCode", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.setParam("name", "hello");
		});
		act(() => {
			result.current.setParam("count", 3);
		});

		expect(result.current.generatedCode).not.toContain("SlideNumber");

		act(() => {
			result.current.setWrapSlideNumbers(true);
		});

		expect(result.current.generatedCode).toContain("SlideNumber");
	});

	it("undo and redo change params", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.setParam("name", "a");
		});
		act(() => {
			result.current.setParam("name", "b");
		});
		act(() => {
			result.current.undo();
		});

		expect(result.current.params.name).toBe("a");

		act(() => {
			result.current.redo();
		});

		expect(result.current.params.name).toBe("b");
	});

	it("undoCount and redoCount track history depth", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});

		expect(result.current.undoCount).toBe(0);
		expect(result.current.redoCount).toBe(0);

		act(() => {
			result.current.setParam("name", "a");
		});
		act(() => {
			result.current.setParam("name", "b");
		});

		expect(result.current.undoCount).toBe(2);
		expect(result.current.redoCount).toBe(0);

		act(() => {
			result.current.undo();
		});

		expect(result.current.undoCount).toBe(1);
		expect(result.current.redoCount).toBe(1);
	});

	it("saveCurrentToHistory adds an entry", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.saveCurrentToHistory();
		});

		expect(result.current.historyEntries).toHaveLength(1);
	});

	it("loadFromHistory restores calls and activeId", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.setParam("name", "hello");
		});
		act(() => {
			result.current.saveCurrentToHistory();
		});

		const entry = result.current.historyEntries[0]!;

		act(() => {
			result.current.loadFromHistory(entry);
		});

		expect(result.current.calls).toHaveLength(1);
		expect(result.current.calls[0]!.name).toBe("testFunction");
		expect(result.current.calls[0]!.params.name).toBe("hello");
		expect(result.current.activeId).not.toBeNull();
	});

	it("clearHistory clears entries", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.saveCurrentToHistory();
		});
		act(() => {
			result.current.clearHistory();
		});

		expect(result.current.historyEntries).toHaveLength(0);
	});

	it("renameHistoryEntry updates label", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.saveCurrentToHistory();
		});

		const entry = result.current.historyEntries[0]!;
		const originalLabel = entry.label;

		act(() => {
			result.current.renameHistoryEntry(entry.timestamp, "new label");
		});

		expect(result.current.historyEntries[0]!.label).toBe("new label");
		expect(result.current.historyEntries[0]!.label).not.toBe(originalLabel);
	});

	it("deleteHistoryEntry removes entry", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});
		act(() => {
			result.current.saveCurrentToHistory();
		});

		const firstEntry = result.current.historyEntries[0]!;

		act(() => {
			result.current.setParam("name", "hello");
		});
		act(() => {
			result.current.saveCurrentToHistory();
		});

		act(() => {
			result.current.deleteHistoryEntry(firstEntry.timestamp);
		});

		expect(result.current.historyEntries).toHaveLength(1);
	});

	it("selectedFunction returns null when no function selected", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		expect(result.current.selectedFunction).toBeNull();
	});

	it("selectedFunction returns matching schema", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});

		expect(result.current.selectedFunction).not.toBeNull();
		expect(result.current.selectedFunction!.name).toBe("testFunction");
	});

	it("errors returns validation errors for invalid params", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => {
			result.current.selectFunction(testSchema);
		});

		expect(result.current.errors.length).toBeGreaterThan(0);
		expect(result.current.errors[0]!.field).toBe("name");
	});

	it("params returns empty object when no active call", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		expect(result.current.params).toEqual({});
	});

	it("selectFunction resets undo history", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.setParam("name", "a"); });
		expect(result.current.undoCount).toBe(1);

		act(() => { result.current.selectFunction(testSchema); });
		expect(result.current.undoCount).toBe(0);
	});

	it("history does not exceed 15 entries", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		for (let i = 0; i < 20; i++) {
			act(() => { result.current.setParam("name", String(i)); });
		}

		expect(result.current.undoCount).toBe(14);

		for (let i = 0; i < 14; i++) {
			act(() => { result.current.undo(); });
		}
		expect(result.current.undoCount).toBe(0);
		expect(result.current.params.name).toBe("5");
	});

	it("addCall adds a chain call", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.addCall(); });

		expect(result.current.calls).toHaveLength(2);
		expect(result.current.calls[0]!.name).toBe("testFunction");
		expect(result.current.calls[1]!.name).toBe("");
	});

	it("resetAll does nothing when no function selected", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.resetAll(); });

		expect(result.current.calls).toHaveLength(0);
	});

	it("undo does nothing at index 0", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.undo(); });

		expect(result.current.undoCount).toBe(0);
		expect(result.current.redoCount).toBe(0);
	});

	it("redo does nothing at last index", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.setParam("name", "a"); });
		act(() => { result.current.undo(); });
		act(() => { result.current.redo(); });
		act(() => { result.current.redo(); });

		expect(result.current.params.name).toBe("a");
	});

	it("removeCall with non-existent id does nothing", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.removeCall("nonexistent"); });

		expect(result.current.calls).toHaveLength(1);
	});

	it("removeCall last remaining call sets activeId to null", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		const id = result.current.calls[0]!.id;
		act(() => { result.current.removeCall(id); });

		expect(result.current.calls).toHaveLength(0);
		expect(result.current.activeId).toBeNull();
	});

	it("moveCallUp on first element does nothing", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.addCall(); });
		const ids = result.current.calls.map((c) => c.id);
		act(() => { result.current.moveCallUp(ids[0]!); });

		expect(result.current.calls[0]!.id).toBe(ids[0]);
		expect(result.current.calls[1]!.id).toBe(ids[1]);
	});

	it("moveCallDown on last element does nothing", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.addCall(); });
		const ids = result.current.calls.map((c) => c.id);
		act(() => { result.current.moveCallDown(ids[1]!); });

		expect(result.current.calls).toHaveLength(2);
		expect(result.current.calls[1]!.id).toBe(ids[1]);
	});

	it("saveCurrentToHistory does nothing with empty calls", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.saveCurrentToHistory(); });

		expect(result.current.historyEntries).toHaveLength(0);
	});

	it("saveCurrentToHistory with custom label", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.saveCurrentToHistory("My Preset"); });

		expect(result.current.historyEntries).toHaveLength(1);
		expect(result.current.historyEntries[0]!.label).toBe("My Preset");
	});

	it("setParam does nothing when no activeId", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.setParam("name", "hello"); });

		expect(result.current.params).toEqual({});
	});

	it("generatedCode skips calls with unknown schema name", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.setParam("name", "hello"); });
		act(() => { result.current.addCall(); });
		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.setParam("name", "world"); });

		expect(result.current.generatedCode).toContain("testFunction");
	});

	it("generatedCode returns null when all calls have unknown names", () => {
		const { result } = renderHook(() => useFunctionForm([]));

		act(() => {
			result.current.selectFunction(testSchema);
		});

		expect(result.current.generatedCode).toBeNull();
	});

	it("deleteHistoryEntry with non-existent timestamp does nothing", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.saveCurrentToHistory("Preset"); });
		const count = result.current.historyEntries.length;

		act(() => { result.current.deleteHistoryEntry(999999); });

		expect(result.current.historyEntries).toHaveLength(count);
	});

	it("saveCurrentToHistory caps entries at 20", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		for (let i = 0; i < 25; i++) {
			act(() => { result.current.saveCurrentToHistory(`Preset ${i}`); });
		}

		expect(result.current.historyEntries.length).toBeLessThanOrEqual(20);
	});

	it("loadFromHistory with empty calls array sets activeId to null", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.loadFromHistory({
			timestamp: 1000,
			label: "Empty",
			calls: [],
		}); });

		expect(result.current.calls).toHaveLength(0);
		expect(result.current.activeId).toBeNull();
		const { params } = result.current;
		expect(params).toEqual({});
	});

	it("setParam with same value updates history", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.setParam("name", "a"); });
		act(() => { result.current.setParam("name", "a"); });

		expect(result.current.undoCount).toBe(2);
		expect(result.current.params.name).toBe("a");
	});

	it("selectFunction when activeCall is null creates a new call", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		const id1 = result.current.calls[0]!.id;

		act(() => { result.current.setActiveId("nonexistent"); });
		act(() => { result.current.selectFunction(testSchema); });

		expect(result.current.calls).toHaveLength(2);
		const newCall = result.current.calls.find((c) => c.id !== id1);
		expect(newCall).toBeDefined();
		expect(newCall!.name).toBe("testFunction");
	});

	it("removeCall last remaining call when it is the active call sets activeId to null", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		const id = result.current.calls[0]!.id;

		act(() => { result.current.removeCall(id); });

		expect(result.current.calls).toHaveLength(0);
		expect(result.current.activeId).toBeNull();
	});

	it("generatedCode returns code only for calls with matching schemas", () => {
		const schemaA: FunctionSchema = {
			name: "fnA",
			description: "",
			parameters: {
				x: { name: "x", type: "number", optional: false },
			},
		};
		const { result } = renderHook(() => useFunctionForm([schemaA]));

		act(() => { result.current.selectFunction(schemaA); });
		act(() => { result.current.setParam("x", 1); });
		act(() => { result.current.addCall(); });
		act(() => { result.current.setActiveId(result.current.calls[1]!.id); });
		act(() => { result.current.selectFunction(schemaA); });
		act(() => { result.current.setParam("x", 2); });

		expect(result.current.generatedCode).toContain("fnA");
		const matches = result.current.generatedCode!.match(/fnA/g);
		expect(matches).toHaveLength(2);
	});

	it("generatedCode skips calls with validation errors", () => {
		const schema: FunctionSchema = {
			name: "fn",
			description: "",
			parameters: {
				req: { name: "req", type: "string", optional: false },
				opt: { name: "opt", type: "number", optional: true },
			},
		};
		const { result } = renderHook(() => useFunctionForm([schema]));

		act(() => { result.current.selectFunction(schema); });
		act(() => { result.current.setParam("req", "valid"); });
		act(() => { result.current.addCall(); });
		act(() => { result.current.setActiveId(result.current.calls[1]!.id); });
		act(() => { result.current.selectFunction(schema); });

		expect(result.current.generatedCode).toContain("fn");
		expect(result.current.generatedCode).not.toBeNull();
	});

	it("generatedCode wraps numbers with SlideNumber toggle", () => {
		const schema: FunctionSchema = {
			name: "fn",
			description: "",
			parameters: {
				x: { name: "x", type: "number", optional: false },
			},
		};
		const { result } = renderHook(() => useFunctionForm([schema]));

		act(() => { result.current.selectFunction(schema); });
		act(() => { result.current.setParam("x", 5); });
		act(() => { result.current.setWrapSlideNumbers(true); });

		expect(result.current.generatedCode).toContain("SlideNumber(5)");

		act(() => { result.current.setWrapSlideNumbers(false); });

		expect(result.current.generatedCode).not.toContain("SlideNumber");
	});

	it("clearHistory clears all entries", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.saveCurrentToHistory("Preset"); });
		expect(result.current.historyEntries).toHaveLength(1);

		act(() => { result.current.clearHistory(); });

		expect(result.current.historyEntries).toHaveLength(0);
	});

	it("renameHistoryEntry updates label", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.saveCurrentToHistory("Old"); });
		const ts = result.current.historyEntries[0]!.timestamp;

		act(() => { result.current.renameHistoryEntry(ts, "New"); });

		expect(result.current.historyEntries[0]!.label).toBe("New");
	});

	it("loadFromHistory restores calls", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.setParam("name", "stored"); });

		const entry = {
			timestamp: 1000,
			label: "Stored",
			calls: [{ name: testSchema.name, params: { name: "stored" } }],
		};

		act(() => { result.current.loadFromHistory(entry); });

		expect(result.current.calls).toHaveLength(1);
		expect(result.current.calls[0]!.params).toEqual({ name: "stored" });
		expect(result.current.params.name).toBe("stored");
	});

	it("moveCallUp swaps two calls", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.setParam("name", "first"); });
		act(() => { result.current.addCall(); });
		act(() => { result.current.setActiveId(result.current.calls[1]!.id); });
		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.setParam("name", "second"); });

		const ids = result.current.calls.map((c) => c.id);
		expect(result.current.calls[0]!.params.name).toBe("first");
		expect(result.current.calls[1]!.params.name).toBe("second");

		act(() => { result.current.moveCallUp(ids[1]!); });

		expect(result.current.calls[0]!.params.name).toBe("second");
		expect(result.current.calls[1]!.params.name).toBe("first");
	});

	it("moveCallDown swaps two calls", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.setParam("name", "first"); });
		act(() => { result.current.addCall(); });
		act(() => { result.current.setActiveId(result.current.calls[1]!.id); });
		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.setParam("name", "second"); });

		const ids = result.current.calls.map((c) => c.id);

		act(() => { result.current.moveCallDown(ids[0]!); });

		expect(result.current.calls[0]!.params.name).toBe("second");
		expect(result.current.calls[1]!.params.name).toBe("first");
	});

	it("removeCall non-active call does not change activeId", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.addCall(); });
		const id0 = result.current.calls[0]!.id;
		const id1 = result.current.calls[1]!.id;

		act(() => { result.current.setActiveId(id0); });
		act(() => { result.current.removeCall(id1); });

		expect(result.current.activeId).toBe(id0);
		expect(result.current.calls).toHaveLength(1);
	});

	it("loads history with corrupted JSON without crashing", () => {
		localStorage.setItem("gsg-call-history", "not valid json{{{");
		const { result } = renderHook(() => useFunctionForm([testSchema]));
		expect(result.current.historyEntries).toEqual([]);
	});

	it("saveCurrentToHistory with empty string label uses Untitled", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.saveCurrentToHistory(""); });

		expect(result.current.historyEntries).toHaveLength(1);
		expect(result.current.historyEntries[0]!.label).toBe("Untitled");
	});

	it("generatedCode returns null when all calls have errors", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.addCall(); });
		act(() => { result.current.setActiveId(result.current.calls[1]!.id); });
		act(() => { result.current.selectFunction(testSchema); });

		expect(result.current.generatedCode).toBeNull();
	});

	it("renameHistoryEntry with non-existent timestamp does nothing", () => {
		const { result } = renderHook(() => useFunctionForm([testSchema]));

		act(() => { result.current.selectFunction(testSchema); });
		act(() => { result.current.saveCurrentToHistory("Preset"); });
		const originalLabel = result.current.historyEntries[0]!.label;

		act(() => { result.current.renameHistoryEntry(999999, "Should Not Appear"); });

		expect(result.current.historyEntries).toHaveLength(1);
		expect(result.current.historyEntries[0]!.label).toBe(originalLabel);
	});

	describe("importCallString", () => {
		it("importCallString adds a new call with parsed params", () => {
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			act(() => {
				result.current.importCallString("testFunction", { name: "hello" });
			});

			expect(result.current.calls).toHaveLength(1);
			expect(result.current.calls[0]!.name).toBe("testFunction");
			expect(result.current.calls[0]!.params.name).toBe("hello");
		});

		it("importCallString sanitizes params to match schema (removes unknown, adds defaults for missing)", () => {
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			act(() => {
				result.current.importCallString("testFunction", {
					name: "hello",
					unknownParam: "should be removed",
					count: 99,
				});
			});

			expect(result.current.calls).toHaveLength(1);
			expect(result.current.calls[0]!.params.name).toBe("hello");
			expect(result.current.calls[0]!.params.count).toBe(99);
			expect(result.current.calls[0]!.params).not.toHaveProperty("unknownParam");
		});

		it("importCallString adds defaults for missing optional params", () => {
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			act(() => {
				result.current.importCallString("testFunction", {});
			});

			expect(result.current.calls).toHaveLength(1);
			expect(result.current.calls[0]!.params.name).toBeUndefined();
			expect(result.current.calls[0]!.params.count).toBe(5);
			expect(result.current.calls[0]!.params.items).toEqual([]);
		});

		it("moveCallToIndex reorders calls", () => {
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			act(() => { result.current.selectFunction(testSchema); });
			act(() => { result.current.setParam("name", "first"); });
			act(() => { result.current.addCall(); });
			act(() => { result.current.setActiveId(result.current.calls[1]!.id); });
			act(() => { result.current.selectFunction(testSchema); });
			act(() => { result.current.setParam("name", "second"); });
			act(() => { result.current.addCall(); });
			act(() => { result.current.setActiveId(result.current.calls[2]!.id); });
			act(() => { result.current.selectFunction(testSchema); });
			act(() => { result.current.setParam("name", "third"); });

			act(() => { result.current.moveCallToIndex(2, 0); });

			expect(result.current.calls[0]!.params.name).toBe("third");
			expect(result.current.calls[1]!.params.name).toBe("first");
			expect(result.current.calls[2]!.params.name).toBe("second");
		});

		it("moveCallToIndex with same from/to does nothing", () => {
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			act(() => { result.current.selectFunction(testSchema); });
			const id = result.current.calls[0]!.id;

			act(() => { result.current.moveCallToIndex(0, 0); });

			expect(result.current.calls).toHaveLength(1);
			expect(result.current.calls[0]!.id).toBe(id);
		});

		it("draft auto-save removes draft when calls become empty", async () => {
			localStorage.setItem("gsg-draft", JSON.stringify({ calls: [{ id: "1", name: "test", params: {} }], activeId: "1", wrapSlideNumbers: false }));
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			expect(result.current.calls).toHaveLength(1);

			act(() => { result.current.removeCall(result.current.calls[0]!.id); });

			await act(async () => {
				await new Promise((r) => setTimeout(r, 600));
			});

			expect(localStorage.getItem("gsg-draft")).toBeNull();
		});

		it("draft auto-save saves to localStorage when calls exist", async () => {
			localStorage.clear();
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			act(() => { result.current.selectFunction(testSchema); });
			act(() => { result.current.setParam("name", "hello"); });

			await act(async () => {
				await new Promise((r) => setTimeout(r, 600));
			});

			const saved = localStorage.getItem("gsg-draft");
			expect(saved).not.toBeNull();
			const parsed = JSON.parse(saved!);
			expect(parsed.calls).toHaveLength(1);
			expect(parsed.calls[0].params.name).toBe("hello");
		});

		it("resetAll with multiple calls preserves non-active calls unchanged", () => {
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			act(() => { result.current.selectFunction(testSchema); });
			act(() => { result.current.setParam("name", "first call"); });
			act(() => { result.current.addCall(); });
			act(() => { result.current.setActiveId(result.current.calls[1]!.id); });
			act(() => { result.current.selectFunction(testSchema); });
			act(() => { result.current.setParam("name", "second call"); });
			act(() => { result.current.setActiveId(result.current.calls[0]!.id); });
			act(() => { result.current.resetAll(); });

			expect(result.current.calls).toHaveLength(2);
			expect(result.current.calls[0]!.params.name).toBeUndefined();
			expect(result.current.calls[1]!.params.name).toBe("second call");
		});

		it("removeCall does nothing when confirm is cancelled", () => {
			vi.spyOn(window, "confirm").mockReturnValue(false);
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			act(() => { result.current.selectFunction(testSchema); });
			act(() => { result.current.addCall(); });

			act(() => { result.current.removeCall(result.current.calls[0]!.id); });

			expect(result.current.calls).toHaveLength(2);
			vi.restoreAllMocks();
		});

		it("clearHistory does nothing when confirm is cancelled", () => {
			vi.spyOn(window, "confirm").mockReturnValue(false);
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			act(() => { result.current.selectFunction(testSchema); });
			act(() => { result.current.saveCurrentToHistory("Test"); });
			act(() => { result.current.clearHistory(); });

			expect(result.current.historyEntries).toHaveLength(1);
			vi.restoreAllMocks();
		});

		it("importCallString returns false for unknown function name", () => {
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			let success: boolean;
			act(() => {
				success = result.current.importCallString("nonexistentFn", {});
			});

			expect(success!).toBe(false);
			expect(result.current.calls).toHaveLength(0);
		});

		it("importCallString resets undo history", () => {
			const { result } = renderHook(() => useFunctionForm([testSchema]));

			act(() => { result.current.selectFunction(testSchema); });
			act(() => { result.current.setParam("name", "a"); });
			expect(result.current.undoCount).toBe(1);

			act(() => {
				result.current.importCallString("testFunction", { name: "b" });
			});

			expect(result.current.undoCount).toBe(0);
			expect(result.current.calls).toHaveLength(2);
		});
	});
});
