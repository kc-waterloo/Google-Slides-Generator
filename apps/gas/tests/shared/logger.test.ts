/**
 * tests/shared/logger.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { logInfo, logWarn, logError } from "../../src/shared/logger/logger";

describe("logInfo", () => {
	it("calls console.log with INFO level", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		logInfo("MyModule", "Hello world");

		expect(spy).toHaveBeenCalledTimes(1);
		const callArg = spy.mock.calls[0]![0]! as string;
		expect(callArg).toContain("[INFO]");
		expect(callArg).toContain("[MyModule]");
		expect(callArg).toContain("Hello world");
		spy.mockRestore();
	});

	it("includes ISO-formatted timestamp", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		logInfo("M", "msg");

		const callArg = spy.mock.calls[0]![0]! as string;
		expect(callArg).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
		spy.mockRestore();
	});

	it("handles empty module name", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => logInfo("", "msg")).not.toThrow();
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it("handles empty message", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => logInfo("M", "")).not.toThrow();
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it("handles null module name", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		logInfo(null as unknown as string, "msg");

		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it("handles undefined module name", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		logInfo(undefined as unknown as string, "msg");

		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it("handles null message", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		logInfo("mod", null as unknown as string);

		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it("handles undefined message", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		logInfo("mod", undefined as unknown as string);

		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});
});

describe("logWarn", () => {
	it("calls console.log with WARN level", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		logWarn("TestMod", "warning message");

		const callArg = spy.mock.calls[0]![0]! as string;
		expect(callArg).toContain("[WARN]");
		expect(callArg).toContain("[TestMod]");
		expect(callArg).toContain("warning message");
		spy.mockRestore();
	});

	it("logWarn handles empty module name", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => logWarn("", "msg")).not.toThrow();
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it("logWarn handles empty message", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => logWarn("M", "")).not.toThrow();
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});
});

describe("logError", () => {
	it("calls console.log with ERROR level", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		logError("ErrMod", "error message");

		const callArg = spy.mock.calls[0]![0]! as string;
		expect(callArg).toContain("[ERROR]");
		expect(callArg).toContain("[ErrMod]");
		expect(callArg).toContain("error message");
		spy.mockRestore();
	});

	it("logError handles empty module name", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => logError("", "msg")).not.toThrow();
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it("logError handles empty message", () => {
		const spy = jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => logError("M", "")).not.toThrow();
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});
});
