/**
 * slide-number-to-index.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { SlideIndex } from "../slide-index/slide-index";
import { SlideNumber } from "./slide-number";

export const slideNumberToIndex_ = (
	slideNumber: SlideNumber
): SlideIndex => {
	return slideNumber - 1;
};
