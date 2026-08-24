/**
 * src/index.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

// Exported function references required by GAS runtime for menu binding.
export { applyBackgroundColor } from "./functions/apply-background-color";
export { batchReplaceText } from "./functions/batch-replace-text";
export { batchSetTextStyle } from "./functions/batch-set-text-style";
export { duplicateSlideRange } from "./functions/duplicate-slide-range";
export { moveSlides } from "./functions/move-slides";
export { createBulletSlide } from "./functions/create-bullet-slide";
export { createHighlightVariationSlides } from "./functions/create-highlight-variation-slides";
export { createLongQuotesSlides } from "./functions/create-long-quotes-slides";
export { createLongQuotesSlidesFromDoc } from "./functions/create-long-quotes-slides-from-doc";
export { createShortQuotesSlides } from "./functions/create-short-quotes-slides";
export { createSummarySlide } from "./functions/create-summary-slide";
export { createVerseSlides } from "./functions/create-verse-slides";
export { replaceAll } from "./functions/replace-all";
export { setHeaders } from "./functions/set-headers";
