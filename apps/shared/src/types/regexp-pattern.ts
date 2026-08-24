/**
 * regexp-pattern.ts
 *
 * Created by Min-Kyu Lee on 23-08-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

/**
 * A regex accepted either as a RegExp instance or as a pattern string.
 *
 * A pattern string is read as the regex source ("^Chapter"), unless it uses
 * the JavaScript literal form ("/^chapter/i"), which also carries flags. To
 * match literal slashes at both ends, escape them ("\\/api\\/").
 *
 * Generated call sites may hand over strings rather than RegExp instances (a
 * saved call round-tripped through JSON, or a hand-written Apps Script call),
 * so runtime code must accept both.
 */
export type RegExpPattern = RegExp | string;

const LITERAL_FORM = /^\/(.+)\/([a-z]*)$/s;

/** Converts a pattern of either shape into a RegExp. Throws if invalid. */
export const toRegExp = (pattern: RegExpPattern): RegExp => {
	if (pattern instanceof RegExp) {
		return pattern;
	}
	const literal = LITERAL_FORM.exec(pattern);
	if (literal) {
		try {
			return new RegExp(literal[1]!, literal[2]!);
		} catch {
			// Not a usable literal (bad flags); fall through and read the whole
			// string as the pattern source instead.
		}
	}
	return new RegExp(pattern);
};

/** Converts a RegExp into the pattern string `toRegExp` reads back identically. */
export const fromRegExp = (regexp: RegExp): string =>
	regexp.flags.length > 0 ? regexp.toString() : regexp.source;

/**
 * Tests `text` against a pattern of either shape.
 *
 * A `g` or `y` flagged RegExp carries `lastIndex` between calls, so the same
 * instance reused across a list would match only every other item; resetting
 * it keeps each test independent.
 */
export const testPattern = (pattern: RegExpPattern, text: string): boolean => {
	const regexp = toRegExp(pattern);
	if (regexp.global || regexp.sticky) {
		regexp.lastIndex = 0;
	}
	return regexp.test(text);
};
