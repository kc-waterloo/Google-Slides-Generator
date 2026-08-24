/**
 * create-short-quotes-slides/defaults.ts
 *
 * Created by Min-Kyu Lee on 23-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable, SlideNumber, ShortQuoteItem } from "@gsg/shared";
import { DEFAULT_INSERTION_SLIDE_NUMBER } from "../../shared/defaults";

export const createShortQuotesSlidesDefaultTemplateSlideNumber_: Nullable<number> = null;
export const createShortQuotesSlidesDefaultInsertionSlideNumber_: SlideNumber = DEFAULT_INSERTION_SLIDE_NUMBER;
export const createShortQuotesSlidesDefaultShortQuoteItems_: ShortQuoteItem[] = [
	{
		quote: `
            Memes are good
        `,
		addendum: "Memes",
	}
];
