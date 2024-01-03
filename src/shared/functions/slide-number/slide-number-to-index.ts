/**
 * slide-number-to-index.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "../nullable/Nullable";
import { SlideIndex } from "../slide-index/SlideIndex";
import { SlideNumber } from "./SlideNumber";

export const slideNumberToIndex_ = (
	slideNumber: Nullable<SlideNumber>
): Nullable<SlideIndex> => {
	if (slideNumber === null) { 
		return null;
	}
	
	return slideNumber - 1;
};
