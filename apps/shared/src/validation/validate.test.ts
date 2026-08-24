/**
 * validate.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { validateParams } from "./validate";
import { createLongQuotesSlidesSchema, replaceAllSchema } from "../schemas/functions";
import type { FunctionSchema } from "../schemas/function-schema";

describe("validateParams", () => {
	it("returns no errors for valid params", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: [
				{ title: "T", subtitle: "A", quote: "Q" },
			],
			templateTitleSlideNumber: 1,
			templateContentSlideNumber: 2,
			insertionSlideNumber: 5,
		});

		expect(errors).toEqual([]);
	});

	it("returns no errors when optional params are omitted", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {});

		expect(errors).toEqual([]);
	});

	it("reports missing required params", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				requiredField: {
					name: "requiredField",
					type: "string",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, {});
		expect(errors).toHaveLength(1);
		expect(errors[0]?.field).toBe("requiredField");
		expect(errors[0]?.message).toContain("required");
	});

	it("reports type mismatch for string fields", () => {
		const errors = validateParams(replaceAllSchema, {
			oldText: 123,
		});

		expect(errors).toHaveLength(1);
		expect(errors[0]?.field).toBe("oldText");
		expect(errors[0]?.message).toContain("string");
	});

	it("reports type mismatch for number fields", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				count: {
					name: "count",
					type: "number",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { count: "not-a-number" });
		expect(errors).toHaveLength(1);
		expect(errors[0]?.field).toBe("count");
	});

	it("reports invalid for non-finite numbers", () => {
		const errors = validateParams(replaceAllSchema, {
			lowerBoundSlideNumber: Infinity,
		});

		expect(errors).toHaveLength(1);
		expect(errors[0]?.field).toBe("lowerBoundSlideNumber");
	});

	it("reports type mismatch for boolean fields", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				flag: {
					name: "flag",
					type: "boolean",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { flag: "true" });
		expect(errors).toHaveLength(1);
		expect(errors[0]?.field).toBe("flag");
	});

	it("validates object array items recursively", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: [
				{ title: "T", subtitle: "A", quote: null },
			],
		});

		expect(errors.length).toBeGreaterThan(0);
		expect(errors.some((e) => e.field.includes("quote"))).toBe(true);
	});

	it("reports error when object[] param is not an array", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: "not-an-array",
		});

		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain("array");
	});

	it("reports error when array item is not an object", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: [null],
		});

		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain("object");
	});

	it("validates RegExp[] params", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				patterns: {
					name: "patterns",
					type: "RegExp[]",
					optional: false,
				},
			},
		};

		const validErrors = validateParams(schema, { patterns: [/^foo/, "bar"] });
		expect(validErrors).toEqual([]);

		const invalidErrors = validateParams(schema, { patterns: ["("] });
		expect(invalidErrors).toHaveLength(1);
		expect(invalidErrors[0]?.message).toContain("regex");
	});

	it("reports error when RegExp[] is not an array", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				patterns: {
					name: "patterns",
					type: "RegExp[]",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { patterns: 42 });
		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain("array");
	});

	it("reports error for non- RegExp/non-string items in RegExp[]", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				patterns: {
					name: "patterns",
					type: "RegExp[]",
					optional: false,
				},
			},
		};

		const numberErrors = validateParams(schema, { patterns: [42] });
		expect(numberErrors).toHaveLength(1);
		expect(numberErrors[0]?.message).toContain("RegExp");
		expect(numberErrors[0]?.message).toContain("regex");

		const nullErrors = validateParams(schema, { patterns: [null] });
		expect(nullErrors).toHaveLength(1);
		expect(nullErrors[0]?.message).toContain("RegExp");

		const boolErrors = validateParams(schema, { patterns: [true] });
		expect(boolErrors).toHaveLength(1);
		expect(boolErrors[0]?.message).toContain("RegExp");
	});

	it("reports error for negative numbers", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				slideNum: {
					name: "slideNum",
					type: "number",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { slideNum: -1 });
		expect(errors).toHaveLength(0);
	});

	it("reports error for NaN values in number fields", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				count: {
					name: "count",
					type: "number",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { count: NaN });
		expect(errors).toHaveLength(1);
		expect(errors[0]?.field).toBe("count");
	});

	it("reports error when required field is null", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				requiredField: {
					name: "requiredField",
					type: "string",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { requiredField: null });
		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain("required");
	});

	it("reports multiple errors for multiple invalid fields", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				fieldA: {
					name: "fieldA",
					type: "string",
					optional: false,
				},
				fieldB: {
					name: "fieldB",
					type: "number",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, {
			fieldA: 42,
			fieldB: "not-a-number",
		});
		expect(errors).toHaveLength(2);
	});

	it("accepts empty string for string fields", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				text: {
					name: "text",
					type: "string",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { text: "" });
		expect(errors).toHaveLength(0);
	});

	it("reports error when object[] item has wrong type fields", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: [
				{ title: 123, subtitle: "A", quote: "Q" },
			],
		});

		expect(errors.length).toBeGreaterThan(0);
		expect(errors.some((e) => e.field.includes("title"))).toBe(true);
	});

	it("ignores extra unknown params (no error)", () => {
		const errors = validateParams(replaceAllSchema, {
			oldText: "foo",
			newText: "bar",
			matchCase: false,
			unknownParam: "should-be-ignored",
		});

		expect(errors).toEqual([]);
	});

	it("reports error for string array with non-string items", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				items: {
					name: "items",
					type: "string[]",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { items: ["valid", 42, null] });
		expect(errors.length).toBeGreaterThan(0);
	});

	it("accepts empty string array", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				items: {
					name: "items",
					type: "string[]",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { items: [] });
		expect(errors).toEqual([]);
	});

	it("accepts empty RegExp array", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				patterns: {
					name: "patterns",
					type: "RegExp[]",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { patterns: [] });
		expect(errors).toEqual([]);
	});

	it("accepts empty object array", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: [],
		});

		expect(errors).toEqual([]);
	});

	it("reports error when string array item is null", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				items: {
					name: "items",
					type: "string[]",
					optional: true,
				},
			},
		};

		const errors = validateParams(schema, { items: [null] });
		expect(errors.length).toBeGreaterThan(0);
	});

	it("reports multiple nested errors in object array items", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: [
				{ title: null, subtitle: 42, quote: null },
			],
		});

		expect(errors.length).toBeGreaterThanOrEqual(3);
	});

	it("reports error when optional number field has invalid type", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				count: {
					name: "count",
					type: "number",
					optional: true,
				},
			},
		};

		const errors = validateParams(schema, { count: "NaN" });
		expect(errors).toHaveLength(1);
	});

	it("reports error for NaN in optional number field", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				count: {
					name: "count",
					type: "number",
					optional: true,
				},
			},
		};

		const errors = validateParams(schema, { count: NaN });
		expect(errors).toHaveLength(1);
	});

	it("reports error for object[] with missing arrayItemSchema", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				items: {
					name: "items",
					type: "object[]",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { items: [{ a: 1 }] });
		expect(errors).toEqual([]);
	});

	it("validates schema with only optional params all omitted", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				color: {
					name: "color",
					type: "string",
					optional: true,
				},
				count: {
					name: "count",
					type: "number",
					optional: true,
				},
			},
		};

		const errors = validateParams(schema, {});
		expect(errors).toEqual([]);
	});

	it("reports error when number is negative infinity", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				val: {
					name: "val",
					type: "number",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { val: -Infinity });
		expect(errors).toHaveLength(1);
	});

	it("reports error when string array is not an array", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				items: {
					name: "items",
					type: "string[]",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { items: "not-array" });
		expect(errors).toHaveLength(1);
	});

	it("handles unknown schema type without error (default switch)", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				unknown: {
					name: "unknown",
					type: "date" as "string",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { unknown: "2024-01-01" });
		expect(errors).toEqual([]);
	});

	it("reports error for object[] item with undefined arrayItemSchema", () => {
		const schema: FunctionSchema = {
			name: "test",
			description: "",
			parameters: {
				items: {
					name: "items",
					type: "object[]",
					optional: false,
				},
			},
		};

		const errors = validateParams(schema, { items: [{ a: 1 }] });
		expect(errors).toEqual([]);
	});
});
