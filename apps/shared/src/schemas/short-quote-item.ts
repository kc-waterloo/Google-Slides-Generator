/**
 * short-quote-item.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export interface ShortQuoteItem {
	quote: string;
	addendum: string;

	quoteColor?: string;
	addendumColor?: string;
	quoteBold?: boolean;
	addendumBold?: boolean;
	quoteItalic?: boolean;
	addendumItalic?: boolean;
	quoteStrikethrough?: boolean;
	addendumStrikethrough?: boolean;
	quoteUnderline?: boolean;
	addendumUnderline?: boolean;
	quoteFontSize?: number;
	addendumFontSize?: number;
}
