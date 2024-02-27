/**
 * create-short-quotes-slides/defaults.ts
 *
 * Created by Min-Kyu Lee on 23-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "../../shared/nullable/nullable";
import { SlideNumber } from "../../shared/slide-number/slide-number";
import { ShortQuoteItem } from "./short-quote-item";

export const createShortQuotesSlidesDefaultTemplateSlideNumber_: Nullable<number> = null;
export const createShortQuotesSlidesDefaultInsertionSlideNumber_: SlideNumber = 9;
export const createShortQuotesSlidesDefaultShortQuoteItems_: ShortQuoteItem[] = [
	{
		quote: `
            Memes are good
        `,
		addendum: "Memes",
	}
];
