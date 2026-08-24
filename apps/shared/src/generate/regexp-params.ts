/**
 * regexp-params.ts
 *
 * Created by Min-Kyu Lee on 23-08-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { FunctionSchema } from "../schemas/function-schema";
import { toRegExp, fromRegExp } from "../types/regexp-pattern";

const REGEXP_ARRAY_TYPE = "RegExp[]";

const toRegExpArray = (value: unknown): unknown => {
	if (!Array.isArray(value)) {
		return value;
	}
	return value.map((item) => {
		if (typeof item !== "string") {
			return item;
		}
		try {
			return toRegExp(item);
		} catch {
			return item;
		}
	});
};

const toPatternArray = (value: unknown): unknown => {
	if (!Array.isArray(value)) {
		return value;
	}
	return value.map((item) => (item instanceof RegExp ? fromRegExp(item) : item));
};

const mapRegExpParams = (
	schema: FunctionSchema,
	params: Record<string, unknown>,
	map: (value: unknown) => unknown,
): Record<string, unknown> => {
	const result: Record<string, unknown> = { ...params };
	for (const [name, param] of Object.entries(schema.parameters)) {
		if (param.type !== REGEXP_ARRAY_TYPE || !(name in result)) {
			continue;
		}
		result[name] = map(result[name]);
	}
	return result;
};

/**
 * Converts regex pattern strings into RegExp instances for every RegExp[]
 * parameter of the schema, so generated code emits regex literals rather than
 * string literals (which the Apps Script functions cannot call `.test` on).
 */
export function toRegExpParams(
	schema: FunctionSchema,
	params: Record<string, unknown>,
): Record<string, unknown> {
	return mapRegExpParams(schema, params, toRegExpArray);
}

/**
 * Converts RegExp instances back into their source strings, keeping editor
 * state JSON-serializable (RegExp values become `{}` under JSON.stringify).
 */
export function toPatternParams(
	schema: FunctionSchema,
	params: Record<string, unknown>,
): Record<string, unknown> {
	return mapRegExpParams(schema, params, toPatternArray);
}
