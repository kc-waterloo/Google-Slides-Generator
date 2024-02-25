/**
 * src/index.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { createHighlightVariationSlides } from "./functions/create-highlight-variation-slides";
import { createLongQuotesSlides } from "./functions/create-long-quotes-slides";
import { createShortQuotesSlides } from "./functions/create-short-quotes-slides";
import { replaceAll } from "./functions/replace-all";
import { setHeaders } from "./functions/set-headers";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const main_ = (a: string): void => {
	console.log(createLongQuotesSlides);
	console.log(createShortQuotesSlides);
	console.log(setHeaders);
	console.log(replaceAll);
	console.log(createHighlightVariationSlides);
};
