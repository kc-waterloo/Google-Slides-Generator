/**
 * function-schema.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export interface ParamSchema {
	name: string;
	type: "string" | "number" | "boolean" | "string[]" | "RegExp[]" | "object[]";
	optional: boolean;
	defaultValue?: unknown;
	description?: string;
	arrayItemSchema?: Record<string, ParamSchema>;
}

export interface FunctionSchema {
	name: string;
	description: string;
	parameters: Record<string, ParamSchema>;
}
