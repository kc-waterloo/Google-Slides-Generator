/**
 * parse-function-call.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { isRecord } from "../types/guards";

export function parseFunctionCall(input: string): { functionName: string; params: Record<string, unknown> } | null {
	const trimmed = input.trim();

	if (trimmed.length === 0) {
		return null;
	}

	const noArgsMatch = trimmed.match(/^(\w[\w$]*)\s*\(\s*\)$/);
	if (noArgsMatch) {
		return { functionName: noArgsMatch[1]!, params: {} };
	}

	const match = trimmed.match(/^(\w[\w$]*)\s*\(\s*(\{[\s\S]*\})\s*\)\s*;?\s*$/);
	if (!match) {
		return null;
	}

	const functionName = match[1]!;
	let argStr = match[2]!;

	argStr = argStr.replace(/SlideNumber\s*\(\s*([^)]+)\s*\)/g, "$1");

	try {
		const params = new Function("return (" + argStr + ")")();
		if (!isRecord(params)) {
			return null;
		}
		return { functionName, params };
	} catch {
		return null;
	}
}
