/**
 * guards.ts
 *
 * Created by Min-Kyu Lee on 30-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isRecordArray(value: unknown): value is Record<string, unknown>[] {
	return Array.isArray(value) && value.every((item) => isRecord(item));
}
