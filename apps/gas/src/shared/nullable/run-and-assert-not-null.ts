/**
 * run-and-assert-not-null.ts
 *
 * Created by Min-Kyu Lee on 14-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "@gsg/shared";
import { assertNotNull_ } from "./assert-not-null";

export const runAndAssertNotNull = <T>(
	func: (input: T) => Nullable<T>,
	input: Nullable<T>,
): Nullable<T> => {
	const notNullInput = assertNotNull_(input);

	return func(notNullInput);
};
