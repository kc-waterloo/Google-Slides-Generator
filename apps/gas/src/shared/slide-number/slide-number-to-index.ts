/**
 * slide-number-to-index.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { SlideIndex, SlideNumber } from "@gsg/shared";

export const slideNumberToIndex_ = (
	slideNumber: SlideNumber
): SlideIndex => {
	return slideNumber - 1;
};
