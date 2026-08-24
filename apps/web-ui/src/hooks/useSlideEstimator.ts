/**
 * useSlideEstimator.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useMemo } from "react";
import type { FunctionSchema } from "@gsg/shared";
import { splitIntoParagraphs } from "../utils/split-into-paragraphs";

const slideEstimators: Record<string, (p: Record<string, unknown>) => number | null> = {
	createLongQuotesSlides: (p) => {
		const items = p["longQuoteItems"];
		if (!Array.isArray(items) || items.length === 0) return null;
		let count = 0;
		for (const item of items) {
			if (!(item != null && typeof item === "object")) { count += 1; continue; }
			const quote = "quote" in item ? String(item.quote) : undefined;
			if (!quote) { count += 1; continue; }
			const mode = "splitMode" in item ? String(item.splitMode) : undefined;
			if (mode === "none") { count += 2; continue; }
			const paragraphs = splitIntoParagraphs(quote);
			count += 1 + (paragraphs.length > 0 ? paragraphs.length : 1);
		}
		return count;
	},
	createBulletSlide: () => 1,
	createShortQuotesSlides: (p) => {
		const items = p["shortQuoteItems"];
		if (!Array.isArray(items) || items.length === 0) return null;
		return items.length;
	},
	createHighlightVariationSlides: () => null,
	createSummarySlide: () => 1,
	setHeaders: () => null,
	batchReplaceText: () => null,
	batchSetTextStyle: () => null,
	duplicateSlideRange: (p) => {
		const from = p["lowerBoundSlideNumber"];
		const to = p["upperBoundSlideNumber"];
		if (typeof from !== "number" || typeof to !== "number" || !isFinite(from) || !isFinite(to)) return null;
		return Math.max(0, to - from + 1);
	},
	moveSlides: () => null,
	applyBackgroundColor: () => null,
};

export const useSlideEstimator = (
	selectedFunction: FunctionSchema | null,
	params: Record<string, unknown>,
): number | null => {
	return useMemo(() => {
		if (!selectedFunction) return null;
		const estimator = slideEstimators[selectedFunction.name];
		if (!estimator) return null;
		return estimator(params);
	}, [selectedFunction, params]);
};
