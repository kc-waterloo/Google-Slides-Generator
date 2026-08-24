/**
 * regexp-params.test.ts
 *
 * Created by Min-Kyu Lee on 23-08-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { toRegExpParams, toPatternParams } from "./regexp-params";
import { createLongQuotesSlidesFromDocSchema } from "../schemas/functions";
import { generateCallString } from "./generate";

const schema = createLongQuotesSlidesFromDocSchema;

describe("toRegExpParams", () => {
	it("converts pattern strings into RegExp instances", () => {
		const result = toRegExpParams(schema, { titleAllowList: ["^Chapter"] });

		expect(result.titleAllowList).toEqual([/^Chapter/]);
	});

	it("leaves existing RegExp values untouched", () => {
		const result = toRegExpParams(schema, { titleBlockList: [/^Skip/] });

		expect(result.titleBlockList).toEqual([/^Skip/]);
	});

	it("leaves invalid patterns as strings", () => {
		const result = toRegExpParams(schema, { titleAllowList: ["("] });

		expect(result.titleAllowList).toEqual(["("]);
	});

	it("does not touch parameters of other types", () => {
		const result = toRegExpParams(schema, { inputDocumentUrl: "https://docs" });

		expect(result.inputDocumentUrl).toBe("https://docs");
	});

	it("does not add absent parameters", () => {
		const result = toRegExpParams(schema, {});

		expect(Object.keys(result)).toEqual([]);
	});

	it("makes generated code emit regex literals", () => {
		const code = generateCallString(
			schema.name,
			toRegExpParams(schema, { titleAllowList: ["^Chapter"] }),
		);

		expect(code).toContain("/^Chapter/");
		expect(code).not.toContain('"^Chapter"');
	});
});

describe("toPatternParams", () => {
	it("converts RegExp instances back into source strings", () => {
		const result = toPatternParams(schema, { titleAllowList: [/^Chapter/] });

		expect(result.titleAllowList).toEqual(["^Chapter"]);
	});

	it("leaves strings untouched", () => {
		const result = toPatternParams(schema, { titleAllowList: ["^Chapter"] });

		expect(result.titleAllowList).toEqual(["^Chapter"]);
	});
});

describe("regex flag round-trip", () => {
	it("keeps flags when importing a regex literal into editor state", () => {
		const result = toPatternParams(schema, { titleAllowList: [/^chapter/i] });

		expect(result.titleAllowList).toEqual(["/^chapter/i"]);
	});

	it("regenerates the same literal, flags included", () => {
		const imported = toPatternParams(schema, { titleAllowList: [/^chapter/i] });
		const code = generateCallString(schema.name, toRegExpParams(schema, imported));

		expect(code).toContain("/^chapter/i");
	});
});
