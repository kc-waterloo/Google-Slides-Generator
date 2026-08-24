/**
 * tests/functions/generate-discord-post.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { generateDiscordPost_ } from "../../src/functions/create-long-quotes-slides/generate-discord-post";
import { LongQuoteItem } from "@gsg/shared";

describe("generateDiscordPost_", () => {
	const items: LongQuoteItem[] = [
		{ title: "Quote 1", subtitle: "Author 1", quote: "Text 1" },
		{ title: "Quote 2", subtitle: "Author 2", quote: "Text 2" },
	];

	it("generates a discord post with item list", () => {
		const result = generateDiscordPost_({ longQuoteItems: items });

		expect(result).toContain("- Quote 1 by Author 1");
		expect(result).toContain("- Quote 2 by Author 2");
	});

	it("uses default start/end strings", () => {
		const result = generateDiscordPost_({ longQuoteItems: items });

		expect(result).toContain("Hello, the quotes are:");
		expect(result).toContain("Thanks all!");
	});

	it("accepts custom start/end strings", () => {
		const result = generateDiscordPost_({
			longQuoteItems: items,
			discordPostStart: "START:",
			discordPostEnd: "END",
		});

		expect(result).toBe("START:- Quote 1 by Author 1\n- Quote 2 by Author 2\nEND");
	});

	it("returns an empty-ish post when no items are provided", () => {
		const result = generateDiscordPost_({ longQuoteItems: [] });

		expect(result).toBe("Hello, the quotes are:\nThanks all!");
	});
});
