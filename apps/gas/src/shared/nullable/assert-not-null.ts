/**
 * assert-not-null.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "@gsg/shared";

export const assertNotNull_ = <T>(input: Nullable<T>, context?: string): T => {
	if (input === null) {
		throw new Error(`assertNotNull_: value is null${context ? ` (${context})` : ""}`);
	}

	return input;
};
