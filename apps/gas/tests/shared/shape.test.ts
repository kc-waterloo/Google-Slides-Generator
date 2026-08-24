/**
 * tests/shared/shape.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { setText_ } from "../../src/shared/shape/set-text";
import { applyTextStyle_ } from "../../src/shared/shape/apply-text-style";
import { setBorderColor_ } from "../../src/shared/shape/set-border-color";
import { createMockShape, ThemeColorType } from "../__mocks__/google-apps-script";

describe("setText_", () => {
	it("sets text on a valid shape", () => {
		const shape = createMockShape("old");
		setText_({ shape, newText: "new" });
		expect(shape.getText().setText).toHaveBeenCalledWith("new");
	});

	it("silently handles null shape access (try/catch)", () => {
		const shape = createMockShape();
		(shape.getText as jest.Mock).mockImplementation(() => { throw new Error("oops"); });

		expect(() => setText_({ shape, newText: "test" })).not.toThrow();
	});

	it("handles null newText", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const shape = createMockShape();

		expect(() => setText_({ shape, newText: null as unknown as string })).not.toThrow();
	});

	it("handles undefined newText", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const shape = createMockShape();

		expect(() => setText_({ shape, newText: undefined as unknown as string })).not.toThrow();
	});

	it("handles undefined shape", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => setText_({ shape: undefined as unknown as GoogleAppsScript.Slides.Shape, newText: "test" })).not.toThrow();
	});
});

describe("applyTextStyle_", () => {
	it("sets bold", () => {
		const shape = createMockShape();
		applyTextStyle_(shape, (ts) => ts.setBold(true));
		expect(shape.getText().getTextStyle().setBold).toHaveBeenCalledWith(true);
	});

	it("sets bold to false", () => {
		const shape = createMockShape();
		applyTextStyle_(shape, (ts) => ts.setBold(false));
		expect(shape.getText().getTextStyle().setBold).toHaveBeenCalledWith(false);
	});

	it("sets italic", () => {
		const shape = createMockShape();
		applyTextStyle_(shape, (ts) => ts.setItalic(true));
		expect(shape.getText().getTextStyle().setItalic).toHaveBeenCalledWith(true);
	});

	it("sets strikethrough", () => {
		const shape = createMockShape();
		applyTextStyle_(shape, (ts) => ts.setStrikethrough(true));
		expect(shape.getText().getTextStyle().setStrikethrough).toHaveBeenCalledWith(true);
	});

	it("sets underline", () => {
		const shape = createMockShape();
		applyTextStyle_(shape, (ts) => ts.setUnderline(true));
		expect(shape.getText().getTextStyle().setUnderline).toHaveBeenCalledWith(true);
	});

	it("sets font size", () => {
		const shape = createMockShape();
		applyTextStyle_(shape, (ts) => ts.setFontSize(24));
		expect(shape.getText().getTextStyle().setFontSize).toHaveBeenCalledWith(24);
	});

	it("sets foreground color", () => {
		const shape = createMockShape();
		applyTextStyle_(shape, (ts) => ts.setForegroundColor(ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType));
		expect(shape.getText().getTextStyle().setForegroundColor).toHaveBeenCalledWith("DARK1");
	});

	it("silently handles getText throwing (try/catch)", () => {
		const shape = createMockShape();
		(shape.getText as jest.Mock).mockImplementation(() => { throw new Error("oops"); });

		expect(() => applyTextStyle_(shape, (ts) => ts.setBold(true))).not.toThrow();
	});

	it("silently handles getText returning null", () => {
		const shape = createMockShape();
		(shape.getText as jest.Mock).mockReturnValue(null);

		expect(() => applyTextStyle_(shape, (ts) => ts.setBold(true))).not.toThrow();
	});

	it("silently handles getTextStyle returning null", () => {
		const shape = createMockShape();
		(shape.getText as jest.Mock).mockReturnValue({ getTextStyle: () => null });

		expect(() => applyTextStyle_(shape, (ts) => ts.setBold(true))).not.toThrow();
	});

	it("does not crash when shape is undefined (optional chaining)", () => {
		expect(() => applyTextStyle_(undefined as unknown as GoogleAppsScript.Slides.Shape, (ts) => ts.setBold(true))).not.toThrow();
	});

	it("handles null shape", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => applyTextStyle_(null as unknown as GoogleAppsScript.Slides.Shape, (ts) => ts.setBold(true))).not.toThrow();
	});
});

describe("setBorderColor_", () => {
	it("sets border color on a valid shape", () => {
		const shape = createMockShape();
		setBorderColor_({ shape, newColor: ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType });
		expect(shape.getBorder().getLineFill().setSolidFill).toHaveBeenCalledWith("DARK1");
	});

	it("silently handles getBorder failing (try/catch)", () => {
		const shape = createMockShape();
		(shape.getBorder as jest.Mock).mockImplementation(() => { throw new Error("oops"); });

		expect(() => setBorderColor_({ shape, newColor: ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType })).not.toThrow();
	});

	it("silently handles null getBorder (try/catch)", () => {
		const shape = createMockShape();
		(shape.getBorder as jest.Mock).mockReturnValue(null);

		expect(() => setBorderColor_({ shape, newColor: ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType })).not.toThrow();
	});

	it("handles null newColor", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const shape = createMockShape();

		expect(() => setBorderColor_({ shape, newColor: null as unknown as GoogleAppsScript.Slides.ThemeColorType })).not.toThrow();
	});

	it("handles undefined newColor", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const shape = createMockShape();

		expect(() => setBorderColor_({ shape, newColor: undefined as unknown as GoogleAppsScript.Slides.ThemeColorType })).not.toThrow();
	});

	it("handles undefined shape", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => setBorderColor_({ shape: undefined as unknown as GoogleAppsScript.Slides.Shape, newColor: ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType })).not.toThrow();
	});

	it("handles getBorder returning undefined", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const shape = createMockShape();
		(shape.getBorder as jest.Mock).mockReturnValue(undefined);

		expect(() => setBorderColor_({ shape, newColor: ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType })).not.toThrow();
	});
});
