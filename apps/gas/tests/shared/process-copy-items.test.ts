/**
 * tests/shared/process-copy-items.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { processCopyItems_ } from "../../src/shared/copy-item/process-copy-items";
import { CopyItem } from "../../src/shared/copy-item/copy-item";
import {
	createMockSlide,
	createMockPageElement,
	ThemeColorType,
} from "../__mocks__/google-apps-script";

describe("processCopyItems_", () => {
	it("maps originalPageElement by matching page element keys", () => {
		const templateEl = createMockPageElement("my-key", "original text");
		const destEl = createMockPageElement("my-key", "dest text");
		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "my-key",
				actions: { newText: "updated" },
			},
		];

		processCopyItems_({
			templateSlide,
			destinationSlide: destSlide,
			copyItems,
		});

		expect(copyItems[0]!.originalPageElement).toBe(templateEl);
		expect(copyItems[0]!.newPageElement?.getDescription?.()).toBe("my-key");
	});

	it("inserts a new page element when matching element is not on destination", () => {
		const templateEl = createMockPageElement("my-key", "original text");
		const otherDestEl = createMockPageElement("other-key", "other");

		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([otherDestEl]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "my-key",
				actions: { newText: "updated" },
			},
		];

		processCopyItems_({
			templateSlide,
			destinationSlide: destSlide,
			copyItems,
		});

		expect(copyItems[0]!.originalPageElement).toBe(templateEl);
		expect(copyItems[0]!.newPageElement).toBeDefined();
	});

	it("applies all action types to the new shape", () => {
		const templateEl = createMockPageElement("action-key", "text");
		const destEl = createMockPageElement("action-key", "text");

		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "action-key",
				actions: {
					newText: "new text",
					bold: true,
					italic: true,
					fontSize: 18,
					newColor: ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType,
					newBorderColor: ThemeColorType.DARK1 as unknown as GoogleAppsScript.Slides.ThemeColorType,
				},
			},
		];

		processCopyItems_({
			templateSlide,
			destinationSlide: destSlide,
			copyItems,
		});

		const shape = copyItems[0]!.newPageElement!.asShape();
		expect(shape.getText().setText).toHaveBeenCalledWith("new text");
		expect(shape.getText().getTextStyle().setBold).toHaveBeenCalledWith(true);
		expect(shape.getText().getTextStyle().setItalic).toHaveBeenCalledWith(true);
		expect(shape.getText().getTextStyle().setFontSize).toHaveBeenCalledWith(18);
		expect(shape.getText().getTextStyle().setForegroundColor).toHaveBeenCalledWith("DARK1");
		expect(shape.getBorder().getLineFill().setSolidFill).toHaveBeenCalledWith("DARK1");
	});

	it("does nothing when originalPageElement is not found", () => {
		const templateSlide = createMockSlide([createMockPageElement("key-a")]);
		const destSlide = createMockSlide([createMockPageElement("key-b")]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "key-c",
				actions: { newText: "should not apply" },
			},
		];

		expect(() => {
			processCopyItems_({
				templateSlide,
				destinationSlide: destSlide,
				copyItems,
			});
		}).not.toThrow();
	});

	it("handles asShape() throwing on non-shape page element", () => {
		const templateEl = createMockPageElement("non-shape-key", "text");
		(templateEl as unknown as { asShape: jest.Mock }).asShape = jest.fn(() => { throw new Error("Not a shape"); });

		const destEl = createMockPageElement("non-shape-key", "text");
		(destEl as unknown as { asShape: jest.Mock }).asShape = jest.fn(() => { throw new Error("Not a shape"); });

		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "non-shape-key",
				actions: { newText: "should not crash" },
			},
		];

		expect(() => {
			processCopyItems_({
				templateSlide,
				destinationSlide: destSlide,
				copyItems,
			});
		}).not.toThrow();
		expect(copyItems[0]!.originalPageElement).toBe(templateEl);
		expect(copyItems[0]!.newPageElement).not.toBeNull();
		expect(copyItems[0]!.newPageElement?.getDescription()).toBe("non-shape-key");
	});

	it("matches destination elements when pageElementKey has extra whitespace", () => {
		const templateEl = createMockPageElement("whitespace-key", "text");
		const destEl = createMockPageElement("whitespace-key", "dest");
		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "  whitespace-key  ",
				actions: { newText: "trimmed match" },
			},
		];

		processCopyItems_({
			templateSlide,
			destinationSlide: destSlide,
			copyItems,
		});

		expect(copyItems[0]!.originalPageElement).toBe(templateEl);
		expect(copyItems[0]!.newPageElement).toBe(destEl);
		const shape = copyItems[0]!.newPageElement!.asShape();
		expect(shape.getText().setText).toHaveBeenCalledWith("trimmed match");
	});

	it("handles insertPageElement returning null", () => {
		const templateEl = createMockPageElement("only-on-template", "text");
		const otherDestEl = createMockPageElement("other-key", "other");
		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([otherDestEl]);

		(destSlide as unknown as { insertPageElement: jest.Mock }).insertPageElement = jest.fn(() => null);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "only-on-template",
				actions: { newText: "insert failed" },
			},
		];

		expect(() => {
			processCopyItems_({
				templateSlide,
				destinationSlide: destSlide,
				copyItems,
			});
		}).not.toThrow();
		expect(copyItems[0]!.originalPageElement).toBe(templateEl);
		expect(copyItems[0]!.newPageElement).toBeNull();
	});

	it("handles empty actions object without crashing", () => {
		const templateEl = createMockPageElement("key-empty-actions", "text");
		const destEl = createMockPageElement("key-empty-actions", "text");

		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "key-empty-actions",
				actions: {},
			},
		];

		expect(() => {
			processCopyItems_({
				templateSlide,
				destinationSlide: destSlide,
				copyItems,
			});
		}).not.toThrow();
	});

	it("applies only fontSize when other actions are undefined", () => {
		const templateEl = createMockPageElement("key-font-only", "text");
		const destEl = createMockPageElement("key-font-only", "text");

		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "key-font-only",
				actions: { fontSize: 20 },
			},
		];

		processCopyItems_({
			templateSlide,
			destinationSlide: destSlide,
			copyItems,
		});

		const shape = copyItems[0]!.newPageElement!.asShape();
		expect(shape.getText().getTextStyle().setFontSize).toHaveBeenCalledWith(20);
		expect(shape.getText().getTextStyle().setBold).not.toHaveBeenCalled();
		expect(shape.getText().getTextStyle().setItalic).not.toHaveBeenCalled();
		expect(shape.getText().setText).not.toHaveBeenCalled();
	});

	it("processes two copy items with different keys", () => {
		const templateEl1 = createMockPageElement("key-a", "text a");
		const templateEl2 = createMockPageElement("key-b", "text b");
		const destEl1 = createMockPageElement("key-a", "dest a");
		const destEl2 = createMockPageElement("key-b", "dest b");

		const templateSlide = createMockSlide([templateEl1, templateEl2]);
		const destSlide = createMockSlide([destEl1, destEl2]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "key-a",
				actions: { newText: "updated a" },
			},
			{
				pageElementKey: "key-b",
				actions: { newText: "updated b" },
			},
		];

		processCopyItems_({
			templateSlide,
			destinationSlide: destSlide,
			copyItems,
		});

		expect(copyItems[0]!.originalPageElement).toBe(templateEl1);
		expect(copyItems[1]!.originalPageElement).toBe(templateEl2);
		expect(copyItems[0]!.newPageElement).toBe(destEl1);
		expect(copyItems[1]!.newPageElement).toBe(destEl2);

		const shape1 = copyItems[0]!.newPageElement!.asShape();
		expect(shape1.getText().setText).toHaveBeenCalledWith("updated a");

		const shape2 = copyItems[1]!.newPageElement!.asShape();
		expect(shape2.getText().setText).toHaveBeenCalledWith("updated b");
	});

	it("handles two copy items with the same pageElementKey", () => {
		const templateEl = createMockPageElement("same-key", "original");
		const destEl = createMockPageElement("same-key", "dest");

		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "same-key",
				actions: { newText: "first update" },
			},
			{
				pageElementKey: "same-key",
				actions: { newText: "second update" },
			},
		];

		expect(() => {
			processCopyItems_({
				templateSlide,
				destinationSlide: destSlide,
				copyItems,
			});
		}).not.toThrow();

		expect(copyItems[0]!.originalPageElement).toBe(templateEl);
		expect(copyItems[1]!.originalPageElement).toBe(templateEl);
		expect(copyItems[0]!.newPageElement).toBe(destEl);
		expect(copyItems[1]!.newPageElement).toBe(destEl);

		const shape = destEl.asShape();
		expect(shape.getText().setText).toHaveBeenCalledWith("first update");
		expect(shape.getText().setText).toHaveBeenCalledWith("second update");
	});

	it("handles pre-set originalPageElement with empty actions", () => {
		const templateEl = createMockPageElement("template-key", "text");
		const destEl = createMockPageElement("dest-key", "other");

		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "my-key",
				actions: {},
				originalPageElement: templateEl,
			},
		];

		expect(() => {
			processCopyItems_({
				templateSlide,
				destinationSlide: destSlide,
				copyItems,
			});
		}).not.toThrow();

		expect(copyItems[0]!.originalPageElement).toBe(templateEl);
		expect(copyItems[0]!.newPageElement).not.toBeNull();
		expect(copyItems[0]!.newPageElement!.getDescription()).toBe("template-key");
	});

	it("does nothing with empty copyItems array", () => {
		const templateEl = createMockPageElement("some-key", "text");
		const destEl = createMockPageElement("some-key", "text");

		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);

		expect(() => {
			processCopyItems_({
				templateSlide,
				destinationSlide: destSlide,
				copyItems: [],
			});
		}).not.toThrow();
	});

	it("handles NaN fontSize without crashing", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const templateEl = createMockPageElement("nan-font-key", "text");
		const destEl = createMockPageElement("nan-font-key", "text");
		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);
		const copyItems: CopyItem[] = [
			{
				pageElementKey: "nan-font-key",
				actions: { fontSize: NaN },
			},
		];

		expect(() => {
			processCopyItems_({ templateSlide, destinationSlide: destSlide, copyItems });
		}).not.toThrow();
	});

	it("handles Infinity fontSize without crashing", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const templateEl = createMockPageElement("inf-font-key", "text");
		const destEl = createMockPageElement("inf-font-key", "text");
		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);
		const copyItems: CopyItem[] = [
			{
				pageElementKey: "inf-font-key",
				actions: { fontSize: Infinity },
			},
		];

		expect(() => {
			processCopyItems_({ templateSlide, destinationSlide: destSlide, copyItems });
		}).not.toThrow();
	});

	it("skips fontSize of 0", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const templateEl = createMockPageElement("zero-font-key", "text");
		const destEl = createMockPageElement("zero-font-key", "text");
		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);
		const copyItems: CopyItem[] = [
			{
				pageElementKey: "zero-font-key",
				actions: { fontSize: 0 },
			},
		];

		processCopyItems_({ templateSlide, destinationSlide: destSlide, copyItems });

		const shape = copyItems[0]!.newPageElement!.asShape();
		expect(shape.getText().getTextStyle().setFontSize).toHaveBeenCalledWith(0);
	});

	it("handles null bold/italic/strikethrough/underline", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const templateEl = createMockPageElement("null-bold-key", "text");
		const destEl = createMockPageElement("null-bold-key", "text");
		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);
		const copyItems: CopyItem[] = [
			{
				pageElementKey: "null-bold-key",
				actions: { bold: null as unknown as boolean },
			},
		];

		expect(() => {
			processCopyItems_({ templateSlide, destinationSlide: destSlide, copyItems });
		}).not.toThrow();
	});

	it("handles empty string pageElementKey", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const templateEl = createMockPageElement("some-key", "text");
		const destEl = createMockPageElement("some-key", "text");
		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);
		const copyItems: CopyItem[] = [
			{
				pageElementKey: "",
				actions: { newText: "test" },
			},
		];

		expect(() => {
			processCopyItems_({ templateSlide, destinationSlide: destSlide, copyItems });
		}).not.toThrow();
	});

	it("handles undefined newColor", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const templateEl = createMockPageElement("undef-color-key", "text");
		const destEl = createMockPageElement("undef-color-key", "text");
		const templateSlide = createMockSlide([templateEl]);
		const destSlide = createMockSlide([destEl]);
		const copyItems: CopyItem[] = [
			{
				pageElementKey: "undef-color-key",
				actions: { newColor: undefined },
			},
		];

		expect(() => {
			processCopyItems_({ templateSlide, destinationSlide: destSlide, copyItems });
		}).not.toThrow();
	});

	it("handles empty template page elements", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		const templateSlide = createMockSlide([]);
		const destSlide = createMockSlide([createMockPageElement("some-key", "text")]);
		const copyItems: CopyItem[] = [
			{
				pageElementKey: "some-key",
				actions: { newText: "test" },
			},
		];

		expect(() => {
			processCopyItems_({ templateSlide, destinationSlide: destSlide, copyItems });
		}).not.toThrow();
	});
});
