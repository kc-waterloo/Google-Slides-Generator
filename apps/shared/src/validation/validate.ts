/**
 * validate.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { ParamSchema, FunctionSchema } from "../schemas/function-schema";
import { isRecord } from "../types/guards";
import { toRegExp } from "../types/regexp-pattern";

export interface ValidationError {
	field: string;
	message: string;
}

function validateValue(value: unknown, schema: ParamSchema, path: string): ValidationError[] {
	const errors: ValidationError[] = [];

	if (value === undefined || value === null) {
		if (!schema.optional) {
			errors.push({ field: path, message: `${schema.name} is required` });
		}
		return errors;
	}

	switch (schema.type) {
	case "string":
		if (typeof value !== "string") {
			errors.push({ field: path, message: `${schema.name} must be a string` });
		}
		break;
	case "number":
		if (typeof value !== "number" || !isFinite(value)) {
			errors.push({ field: path, message: `${schema.name} must be a finite number` });
		}
		break;
	case "boolean":
		if (typeof value !== "boolean") {
			errors.push({ field: path, message: `${schema.name} must be a boolean` });
		}
		break;
	case "string[]":
		if (!Array.isArray(value)) {
			errors.push({ field: path, message: `${schema.name} must be an array` });
		} else {
			value.forEach((item, i) => {
				if (typeof item !== "string") {
					errors.push({ field: `${path}[${i}]`, message: "Each item must be a string" });
				}
			});
		}
		break;
	case "RegExp[]":
		if (!Array.isArray(value)) {
			errors.push({ field: path, message: `${schema.name} must be an array` });
		} else {
			value.forEach((item, i) => {
				if (item instanceof RegExp) return;
				if (typeof item === "string") {
					try {
						toRegExp(item);
					} catch {
						errors.push({ field: `${path}[${i}]`, message: "Invalid regex pattern" });
					}
				} else {
					errors.push({ field: `${path}[${i}]`, message: "Each item must be a RegExp or valid regex string" });
				}
			});
		}
		break;
	case "object[]":
		if (!Array.isArray(value)) {
			errors.push({ field: path, message: `${schema.name} must be an array` });
		} else if (schema.arrayItemSchema) {
			value.forEach((item, i) => {
				if (!isRecord(item)) {
					errors.push({ field: `${path}[${i}]`, message: "Item must be an object" });
					return;
				}
				Object.entries(schema.arrayItemSchema!).forEach(([key, fieldSchema]) => {
					const fieldValue = item[key];
					errors.push(...validateValue(fieldValue, fieldSchema, `${path}[${i}].${key}`));
				});
			});
		}
		break;
	default:
		break;
	}

	return errors;
}

export function validateParams(
	schema: FunctionSchema,
	params: Record<string, unknown>,
): ValidationError[] {
	const errors: ValidationError[] = [];

	Object.entries(schema.parameters).forEach(([key, paramSchema]) => {
		const value = params[key];
		errors.push(...validateValue(value, paramSchema, key));
	});

	return errors;
}
