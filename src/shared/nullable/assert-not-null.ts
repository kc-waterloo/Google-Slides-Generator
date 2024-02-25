/**
 * assert-not-null.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "./nullable";

export const assertNotNull_ = <T>(input: Nullable<T>): T => {
	if (input === null) {
		throw new Error("Value is null");
	}

	return input;
};
