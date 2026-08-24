/**
 * tests/schemas/functions.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { functionSchemas } from "./functions";
import type { FunctionSchema, ParamSchema } from "./function-schema";

const VALID_TYPES = new Set(["string", "number", "boolean", "string[]", "RegExp[]", "object[]"]);

describe("functionSchemas", () => {
	it("exports all 13 expected schemas", () => {
		const names = Object.values(functionSchemas).map((s: FunctionSchema) => s.name).sort();
		expect(names).toEqual([
			"applyBackgroundColor",
			"batchReplaceText",
			"batchSetTextStyle",
			"createBulletSlide",
			"createHighlightVariationSlides",
			"createLongQuotesSlides",
			"createLongQuotesSlidesFromDoc",
			"createShortQuotesSlides",
			"createSummarySlide",
			"duplicateSlideRange",
			"moveSlides",
			"replaceAll",
			"setHeaders",
		]);
	});

	it("every schema has a description", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			expect(schema.description).toBeTruthy();
		});
	});

	it("has unique schema names", () => {
		const names = Object.values(functionSchemas).map((s: FunctionSchema) => s.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it("every required param has a description", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.values(schema.parameters).forEach((param) => {
				if (!param.optional) {
					expect(param.description).toBeTruthy();
				}
			});
		});
	});

	it("all parameters have valid types", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.values(schema.parameters).forEach((param: ParamSchema) => {
				expect(VALID_TYPES.has(param.type)).toBe(true);
			});
		});
	});

	it("all parameters have non-empty names", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.values(schema.parameters).forEach((param: ParamSchema) => {
				expect(param.name.length).toBeGreaterThan(0);
			});
		});
	});

	it("parameter names match their keys", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.entries(schema.parameters).forEach(([key, param]) => {
				expect(param.name).toBe(key);
			});
		});
	});

	it("object[] parameters have arrayItemSchema defined", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.values(schema.parameters).forEach((param: ParamSchema) => {
				if (param.type === "object[]") {
					expect(param.arrayItemSchema).toBeDefined();
					expect(Object.keys(param.arrayItemSchema!).length).toBeGreaterThan(0);
				}
			});
		});
	});

	it("object[] arrayItemSchema items have valid types and names", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.values(schema.parameters).forEach((param: ParamSchema) => {
				if (param.type !== "object[]" || !param.arrayItemSchema) return;
				Object.values(param.arrayItemSchema).forEach((item: ParamSchema) => {
					expect(VALID_TYPES.has(item.type)).toBe(true);
					expect(item.name.length).toBeGreaterThan(0);
				});
			});
		});
	});

	it("non-object[] parameters do not have arrayItemSchema", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.values(schema.parameters).forEach((param: ParamSchema) => {
				if (param.type !== "object[]") {
					expect(param.arrayItemSchema).toBeUndefined();
				}
			});
		});
	});

	it("every optional parameter has either description or defaultValue", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.values(schema.parameters).forEach((param: ParamSchema) => {
				if (param.optional) {
					expect(
						param.description !== undefined || param.defaultValue !== undefined,
					).toBe(true);
				}
			});
		});
	});

	it("every required parameter does not have optional=true", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.values(schema.parameters).forEach((param: ParamSchema) => {
				expect(param.optional).toBeDefined();
			});
		});
	});

	it("every schema has at least one parameter", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			expect(Object.keys(schema.parameters).length).toBeGreaterThan(0);
		});
	});

	it("string[] parameters exist for relevant schemas", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.values(schema.parameters).forEach((param: ParamSchema) => {
				if (param.type === "string[]") {
					expect(param.name).toBeTruthy();
				}
			});
		});
	});

	it("RegExp[] parameters exist for relevant schemas", () => {
		Object.values(functionSchemas).forEach((schema: FunctionSchema) => {
			Object.values(schema.parameters).forEach((param: ParamSchema) => {
				if (param.type === "RegExp[]") {
					expect(param.name).toBeTruthy();
				}
			});
		});
	});
});
