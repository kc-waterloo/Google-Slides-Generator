/**
 * generate.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { generateCallString, serializeValue } from "./generate";
import { parseFunctionCall } from "./parse-function-call";

describe("generateCallString", () => {
	it("generates a call with no params when none given", () => {
		const result = generateCallString("myFunction", {});
		expect(result).toBe("myFunction()");
	});

	it("generates a call with no params when all are undefined", () => {
		const result = generateCallString("myFunction", { a: undefined, b: undefined });
		expect(result).toBe("myFunction()");
	});

	it("generates a call with string params", () => {
		const result = generateCallString("createShortQuotesSlides", {
			shortQuoteItems: [
				{ quote: "Hello", addendum: "World" },
			],
		});

		expect(result).toContain("createShortQuotesSlides({");
		expect(result).toContain("shortQuoteItems:");
		expect(result).toContain("Hello");
		expect(result).toContain("World");
	});

	it("generates a call with number params", () => {
		const result = generateCallString("replaceAll", {
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 10,
		});

		expect(result).toContain("lowerBoundSlideNumber: 1");
		expect(result).toContain("upperBoundSlideNumber: 10");
	});

	it("generates a call with boolean params", () => {
		const result = generateCallString("replaceAll", {
			matchCase: true,
		});

		expect(result).toContain("matchCase: true");
	});

	it("generates a call with null values", () => {
		const result = generateCallString("createLongQuotesSlides", {
			templateTitleSlideNumber: null,
		});

		expect(result).toContain("templateTitleSlideNumber: null");
	});

	it("handles empty arrays", () => {
		const result = generateCallString("createLongQuotesSlides", {
			longQuoteItems: [],
		});

		expect(result).toContain("longQuoteItems: []");
	});

	it("handles RegExp values", () => {
		const result = generateCallString("createLongQuotesSlidesFromDoc", {
			titleAllowList: [/^Chapter/],
		});

		expect(result).toContain("/^Chapter/");
	});

	it("handles empty objects", () => {
		const result = generateCallString("someFunc", {
			config: {},
		});

		expect(result).toContain("config: {}");
	});

	it("applies custom indent", () => {
		const result = generateCallString("fn", { a: 1 }, 4);

		expect(result).toContain("    a: 1");
	});

	it("wraps numbers in SlideNumber() when wrapSlideNumbers is true", () => {
		const result = generateCallString("replaceAll", {
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 10,
		}, 2, true);

		expect(result).toContain("lowerBoundSlideNumber: SlideNumber(1)");
		expect(result).toContain("upperBoundSlideNumber: SlideNumber(10)");
	});

	it("does not wrap strings or booleans in SlideNumber()", () => {
		const result = generateCallString("replaceAll", {
			oldText: "foo",
			matchCase: true,
			lowerBoundSlideNumber: 1,
		}, 2, true);

		expect(result).toContain("oldText: \"foo\"");
		expect(result).toContain("matchCase: true");
		expect(result).toContain("lowerBoundSlideNumber: SlideNumber(1)");
	});

	it("generates a complete multi-param call", () => {
		const result = generateCallString("replaceAll", {
			oldText: "foo",
			newText: "bar",
			matchCase: false,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		expect(result).toContain("replaceAll({");
		expect(result).toContain("oldText: \"foo\"");
		expect(result).toContain("newText: \"bar\"");
		expect(result).toContain("matchCase: false");
		expect(result).toContain("lowerBoundSlideNumber: 1");
		expect(result).toContain("upperBoundSlideNumber: 5");
		expect(result).toContain("})");
	});

	it("handles special characters in function name", () => {
		const result = generateCallString("$my_Func-1", { a: 1 });

		expect(result).toContain("$my_Func-1({");
	});

	it("handles nested objects in params", () => {
		const result = generateCallString("fn", {
			config: {
				depth: { inner: true, value: 42 },
			},
		});

		expect(result).toContain("depth:");
		expect(result).toContain("inner: true");
		expect(result).toContain("value: 42");
	});

	it("handles arrays with nested objects", () => {
		const result = generateCallString("fn", {
			items: [
				{ name: "a", count: 1 },
				{ name: "b", count: 2 },
			],
		});

		expect(result).toContain("name: \"a\"");
		expect(result).toContain("name: \"b\"");
		expect(result).toContain("count: 1");
		expect(result).toContain("count: 2");
	});

	it("handles Infinity and NaN numbers", () => {
		const result = generateCallString("fn", {
			inf: Infinity,
			negInf: -Infinity,
		});

		expect(result).toContain("inf: Infinity");
		expect(result).toContain("negInf: -Infinity");
	});

	it("handles very large indent", () => {
		const result = generateCallString("fn", { a: 1 }, 100);

		expect(result).toContain(" ".repeat(100) + "a: 1");
	});

	it("handles function name as empty string", () => {
		const result = generateCallString("", { a: 1 });

		expect(result).toContain("({");
	});

	it("handles zero indent", () => {
		const result = generateCallString("fn", { a: 1 }, 0);

		expect(result).toContain("a: 1");
		expect(result).not.toContain("  a:");
	});

	it("handles negative slide number with wrapSlideNumbers", () => {
		const result = generateCallString("fn", {
			slideNumber: -5,
		}, 2, true);

		expect(result).toContain("SlideNumber(-5)");
	});

	it("handles zero as slide number with wrapSlideNumbers", () => {
		const result = generateCallString("fn", {
			slideNumber: 0,
		}, 2, true);

		expect(result).toContain("SlideNumber(0)");
	});

	it("serializeValue with undefined returns 'undefined'", () => {
		expect(serializeValue(undefined, 0, false)).toBe("undefined");
	});

	it("serializeValue with symbol falls through to String()", () => {
		const sym = Symbol("test");
		expect(serializeValue(sym, 0, false)).toBe(String(sym));
	});

	it("serializeValue with function falls through to String()", () => {
		const fn = (): void => {};
		expect(serializeValue(fn, 0, false)).toBe(String(fn));
	});

	it("serializeValue with bigint falls through to String()", () => {
		expect(serializeValue(BigInt(42), 0, false)).toBe("42");
	});

	it("serializeValue with date object serializes as nested object", () => {
		const date = new Date("2024-01-01");
		const result = serializeValue(date, 0, false);
		expect(result).toContain("{");
	});

	it("generateCallString with single SlideNumber wraps correctly", () => {
		const result = generateCallString("fn", { n: 1 }, 2, true);
		expect(result).toContain("SlideNumber(1)");
	});
});

describe("parseFunctionCall", () => {
	it("functionName() — no params", () => {
		const result = parseFunctionCall("myFunction()");
		expect(result).toEqual({ functionName: "myFunction", params: {} });
	});

	it("functionName({ key: \"value\" }) — single string param", () => {
		const result = parseFunctionCall("testFn({ key: \"value\" })");
		expect(result).toEqual({ functionName: "testFn", params: { key: "value" } });
	});

	it("object with arrays: fn({ items: [{ title: \"Hi\", quote: \"Hello\" }] })", () => {
		const result = parseFunctionCall("fn({ items: [{ title: \"Hi\", quote: \"Hello\" }] })");
		expect(result).not.toBeNull();
		expect(result!.functionName).toBe("fn");
		expect(result!.params.items).toEqual([{ title: "Hi", quote: "Hello" }]);
	});

	it("SlideNumber(5) unwrapping: fn({ num: SlideNumber(5) }) → { num: 5 }", () => {
		const result = parseFunctionCall("fn({ num: SlideNumber(5) })");
		expect(result).toEqual({ functionName: "fn", params: { num: 5 } });
	});

	it("RegExp values: fn({ pattern: /test/i })", () => {
		const result = parseFunctionCall("fn({ pattern: /test/i })");
		expect(result).not.toBeNull();
		expect(result!.functionName).toBe("fn");
		expect(result!.params.pattern).toEqual(/test/i);
	});

	it("Boolean and number values", () => {
		const result = parseFunctionCall("fn({ flag: true, count: 42 })");
		expect(result).toEqual({ functionName: "fn", params: { flag: true, count: 42 } });
	});

	it("Trailing comma: fn({ key: \"val\", })", () => {
		const result = parseFunctionCall("fn({ key: \"val\", })");
		expect(result).toEqual({ functionName: "fn", params: { key: "val" } });
	});

	it("Empty string input returns null", () => {
		expect(parseFunctionCall("")).toBeNull();
	});

	it("Invalid input (no function call) returns null", () => {
		expect(parseFunctionCall("not a function call")).toBeNull();
	});

	it("Unknown function name still returns the parsed data", () => {
		const result = parseFunctionCall("unknownFunc({ a: 1 })");
		expect(result).toEqual({ functionName: "unknownFunc", params: { a: 1 } });
	});

	it("fn({ a: null }) — null values", () => {
		const result = parseFunctionCall("fn({ a: null })");
		expect(result).toEqual({ functionName: "fn", params: { a: null } });
	});

	it("returns null when parsed arg is a primitive not an object", () => {
		const result = parseFunctionCall("fn(42)");
		expect(result).toBeNull();
	});

	it("returns null when parsed arg is null", () => {
		const result = parseFunctionCall("fn(null)");
		expect(result).toBeNull();
	});

	it("invalid JS in args returns null", () => {
		const result = parseFunctionCall("fn({ a: , })");
		expect(result).toBeNull();
	});

	it("returns null when eval returns a non-record (string from + operator)", () => {
		const result = parseFunctionCall("fn({a: 1} + {b: 2})");
		expect(result).toBeNull();
	});

	it("empty object: fn({})", () => {
		const result = parseFunctionCall("fn({})");
		expect(result).toEqual({ functionName: "fn", params: {} });
	});

	it("semicolon terminator: fn({a: 1});", () => {
		const result = parseFunctionCall("fn({a: 1});");
		expect(result).toEqual({ functionName: "fn", params: { a: 1 } });
	});

	it("whitespace inside call: fn  (  {a: 1}  )", () => {
		const result = parseFunctionCall("fn  (  {a: 1}  )");
		expect(result).toEqual({ functionName: "fn", params: { a: 1 } });
	});

	it("function name with $: fn$test({})", () => {
		const result = parseFunctionCall("fn$test({ key: \"val\" })");
		expect(result).toEqual({ functionName: "fn$test", params: { key: "val" } });
	});

	it("nested objects: fn({ nested: { deep: \"value\" } })", () => {
		const result = parseFunctionCall("fn({ nested: { deep: \"value\" } })");
		expect(result).not.toBeNull();
		expect(result!.functionName).toBe("fn");
		expect(result!.params.nested).toEqual({ deep: "value" });
	});
});

describe("generateCallString + parseFunctionCall roundtrip", () => {
	it("roundtrips string params", () => {
		const params = { key: "hello" };
		const str = generateCallString("fn", params);
		const result = parseFunctionCall(str);
		expect(result).toEqual({ functionName: "fn", params: { key: "hello" } });
	});

	it("roundtrips empty object params", () => {
		const params = {};
		const str = generateCallString("fn", params);
		expect(str).toBe("fn()");
		const result = parseFunctionCall(str);
		expect(result).toEqual({ functionName: "fn", params: {} });
	});

	it("roundtrips numeric params", () => {
		const params = { a: 1, b: -5, c: 3.14 };
		const str = generateCallString("fn", params);
		const result = parseFunctionCall(str);
		expect(result!.functionName).toBe("fn");
		expect(result!.params.a).toBe(1);
		expect(result!.params.b).toBe(-5);
		expect(result!.params.c).toBe(3.14);
	});

	it("roundtrips boolean params", () => {
		const params = { a: true, b: false };
		const str = generateCallString("fn", params);
		const result = parseFunctionCall(str);
		expect(result!.functionName).toBe("fn");
		expect(result!.params.a).toBe(true);
		expect(result!.params.b).toBe(false);
	});

	it("roundtrips array params", () => {
		const params = { items: [1, "two", true] };
		const str = generateCallString("fn", params);
		const result = parseFunctionCall(str);
		expect(result!.functionName).toBe("fn");
		expect(result!.params.items).toEqual([1, "two", true]);
	});

	it("roundtrips nested object params", () => {
		const params = { items: [{ name: "a", value: 1 }, { name: "b", value: 2 }] };
		const str = generateCallString("fn", params);
		const result = parseFunctionCall(str);
		expect(result!.functionName).toBe("fn");
		expect(result!.params.items).toEqual([{ name: "a", value: 1 }, { name: "b", value: 2 }]);
	});

	it("roundtrips params with SlideNumber wrapping", () => {
		const params = { slideNumber: 3 };
		const str = generateCallString("fn", params, 2, true);
		expect(str).toContain("SlideNumber(3)");
		const result = parseFunctionCall(str);
		expect(result!.functionName).toBe("fn");
		expect(result!.params.slideNumber).toBe(3);
	});

	it("roundtrips null value", () => {
		const params = { a: null, b: "text" };
		const str = generateCallString("fn", params);
		expect(str).toContain("null");
		const result = parseFunctionCall(str);
		expect(result!.params.a).toBeNull();
		expect(result!.params.b).toBe("text");
	});

	it("roundtrips complex real-world params", () => {
		const params = {
			longQuoteItems: [
				{ title: "T1", subtitle: "S1", quote: "Q1", titleBold: true },
				{ title: "T2", subtitle: "S2", quote: "Q2", titleColor: "ACCENT1" },
			],
			titleFontSize: 2400,
			quoteColor: "DARK1",
		};
		const str = generateCallString("createLongQuotesSlides", params);
		const result = parseFunctionCall(str);
		expect(result).not.toBeNull();
		expect(result!.functionName).toBe("createLongQuotesSlides");
		expect(result!.params.titleFontSize).toBe(2400);
		expect(result!.params.quoteColor).toBe("DARK1");
		expect(Array.isArray(result!.params.longQuoteItems)).toBe(true);
		expect((result!.params.longQuoteItems as Array<Record<string, unknown>>)[0]!.title).toBe("T1");
	});
});
