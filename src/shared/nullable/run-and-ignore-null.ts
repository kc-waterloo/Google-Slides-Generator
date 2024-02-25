/**
 * run-and-ignore-null.ts
 *
 * Created by Min-Kyu Lee on 14-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "./nullable";

export const runAndIgnoreNull_ = <T>(
	func: (input: T) => Nullable<T>,
	input: Nullable<T>,
): Nullable<T> => {
	if (input === null) {
		return null;
	}

	return func(input);
};
