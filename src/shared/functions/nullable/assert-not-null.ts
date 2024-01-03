/**
 * assert-not-null.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "./Nullable";

export const assertNotNull = <T>(input: Nullable<T>): T => {
	if (input === null) {
		throw new Error("Value is null");
	}

	return input;
};
