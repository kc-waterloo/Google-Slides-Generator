/**
 * split-string-by-whitespace.ts
 * 
 * Created by Min-Kyu Lee on 29-12-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

export const splitStringByWhitespace_ = (input: string): string[] => {
	const partiallyFormattedStrings: string[] = input
		.trim()
		.split("\n")
		.map(((element: string): string => element.trim()));
	
	const formattedStrings: string[] = [];
	
	let candidateString: string = "";
	partiallyFormattedStrings.forEach((partiallyFormattedString: string): void => {
		// If the partiallyFormattedString is not empty, then it's contents should be used
		if (partiallyFormattedString !== "") {
			if (candidateString === "") {
				candidateString = partiallyFormattedString;
			}
			else { 
				candidateString = candidateString.concat("\n", partiallyFormattedString);
			}
		}
		// An empty partiallyFormattedString is a delimiter for another string item
		else {
			if (candidateString !== "") {
				// Adds completed candidateString to formattedStrings
				formattedStrings.push(candidateString);
				// Resets candidateString
				candidateString = "";
			}
		}
	});
	if (candidateString !== "") {
		formattedStrings.push(candidateString);
	}

	return formattedStrings;
};
