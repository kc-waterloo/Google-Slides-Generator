/**
 * split-into-paragraphs.ts
 *
 * Created by Min-Kyu Lee on 28-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export const splitIntoParagraphs = (text: string): string[] => {
	const lines = text.trim().split("\n").map((l) => l.trim());
	const result: string[] = [];
	let current: string[] = [];
	for (const line of lines) {
		if (line === "") {
			if (current.length > 0) {
				result.push(current.join("\n"));
				current = [];
			}
		} else {
			current.push(line);
		}
	}
	if (current.length > 0) result.push(current.join("\n"));
	return result;
};
