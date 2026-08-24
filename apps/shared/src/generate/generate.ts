/**
 * generate.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { isRecord } from "../types/guards";

export function serializeValue(value: unknown, indent: number, wrapSlideNumbers: boolean): string {
	if (value === null) {
		return "null";
	}
	if (value === undefined) {
		return "undefined";
	}
	if (typeof value === "string") {
		return JSON.stringify(value);
	}
	if (typeof value === "boolean") {
		return String(value);
	}
	if (typeof value === "number") {
		if (wrapSlideNumbers) {
			return `SlideNumber(${value})`;
		}
		return String(value);
	}
	if (value instanceof RegExp) {
		return value.toString();
	}
	if (Array.isArray(value)) {
		if (value.length === 0) {
			return "[]";
		}
		const items = value.map((item) => `${" ".repeat(indent + 2)}${serializeValue(item, indent + 2, wrapSlideNumbers)}`);
		return `[\n${items.join(",\n")}\n${" ".repeat(indent)}]`;
	}
	if (isRecord(value)) {
		const keys = Object.keys(value);
		if (keys.length === 0) {
			return "{}";
		}
		const entries = keys.map((key) => {
			const v = value[key];
			return `${" ".repeat(indent + 2)}${key}: ${serializeValue(v, indent + 2, wrapSlideNumbers)}`;
		});
		return `{\n${entries.join(",\n")}\n${" ".repeat(indent)}}`;
	}

	return String(value);
}

export function generateCallString(
	functionName: string,
	params: Record<string, unknown>,
	indent: number = 2,
	wrapSlideNumbers: boolean = false,
): string {
	const paramEntries = Object.entries(params).filter(([, v]) => v !== undefined);

	if (paramEntries.length === 0) {
		return `${functionName}()`;
	}

	const serialized = paramEntries.map(([key, value]) => {
		return `${" ".repeat(indent)}${key}: ${serializeValue(value, indent, wrapSlideNumbers)}`;
	});

	return `${functionName}({\n${serialized.join(",\n")}\n})`;
}
