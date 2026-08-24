/**
 * long-quote-item.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export type LongQuoteSplitMode = "paragraph" | "sentence" | "char-count" | "none";

export interface LongQuoteItem {
	title: string;
	subtitle: string;
	quote: string;
	splitMode?: LongQuoteSplitMode;
	splitMaxChars?: number;

	titleColor?: string;
	subtitleColor?: string;
	quoteColor?: string;
	addendumColor?: string;
	titleBold?: boolean;
	subtitleBold?: boolean;
	quoteBold?: boolean;
	addendumBold?: boolean;
	titleItalic?: boolean;
	subtitleItalic?: boolean;
	quoteItalic?: boolean;
	addendumItalic?: boolean;
	titleStrikethrough?: boolean;
	subtitleStrikethrough?: boolean;
	quoteStrikethrough?: boolean;
	addendumStrikethrough?: boolean;
	titleUnderline?: boolean;
	subtitleUnderline?: boolean;
	quoteUnderline?: boolean;
	addendumUnderline?: boolean;
	titleFontSize?: number;
	subtitleFontSize?: number;
	quoteFontSize?: number;
	addendumFontSize?: number;
}
