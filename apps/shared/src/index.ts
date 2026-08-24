/**
 * index.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export type { Nullable } from "./types/nullable";
export type { SlideNumber } from "./types/slide-number";
export type { SlideIndex } from "./types/slide-index";
export type { SlideId } from "./types/slide-id";
export type { RegExpPattern } from "./types/regexp-pattern";
export { toRegExp, fromRegExp, testPattern } from "./types/regexp-pattern";

export type { LongQuoteItem, LongQuoteSplitMode } from "./schemas/long-quote-item";
export type { ShortQuoteItem } from "./schemas/short-quote-item";
export type { SetHeaderItem } from "./schemas/set-header-item";
export type { ReplacePair } from "./schemas/replace-pair";
export type { TextStyleOverride } from "./schemas/text-style-override";

export type { ParamSchema, FunctionSchema } from "./schemas/function-schema";

export {
	createLongQuotesSlidesSchema,
	createShortQuotesSlidesSchema,
	setHeadersSchema,
	replaceAllSchema,
	createHighlightVariationSlidesSchema,
	createLongQuotesSlidesFromDocSchema,
	createBulletSlideSchema,
	batchSetTextStyleSchema,
	duplicateSlideRangeSchema,
	moveSlidesSchema,
	applyBackgroundColorSchema,
	createSummarySlideSchema,
	batchReplaceTextSchema,
	functionSchemas,
	allFunctionNames,
} from "./schemas/functions";

export { validateParams } from "./validation/validate";
export type { ValidationError } from "./validation/validate";

export {
	functionTemplateLayouts,
	getPreviewTexts,
} from "./schemas/template-layouts";
export type {
	TemplateKeyLayout,
	SlideLayout,
	FunctionTemplateLayout,
} from "./schemas/template-layouts";

export { generateCallString } from "./generate/generate";
export { parseFunctionCall } from "./generate/parse-function-call";
export { toRegExpParams, toPatternParams } from "./generate/regexp-params";
export { splitStringByWhitespace } from "./generate/split-string";
export { isRecord, isRecordArray } from "./types/guards";
