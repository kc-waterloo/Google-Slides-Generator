/**
 * dispatch.ts
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export async function callTypedFn<T>(
	fn: (buffer: ArrayBuffer, params: T) => Promise<ArrayBuffer>,
	buffer: ArrayBuffer,
	callParams: Record<string, unknown>,
): Promise<ArrayBuffer> {
	return fn(buffer, callParams as unknown as T);
}
