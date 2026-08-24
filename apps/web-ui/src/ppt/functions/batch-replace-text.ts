/**
 * batch-replace-text.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import JSZip from "jszip";
import { loadTemplate } from "../template-loader";
import { parseXml, serializeXml, NS_A } from "../xml-utils";

export interface BatchReplaceTextParams {
	replacements: { oldText: string; newText: string }[];
	matchCase?: boolean;
	lowerBoundSlideNumber?: number;
	upperBoundSlideNumber?: number;
}

function replaceAllCase(text: string, oldText: string, newText: string): string {
	if (!oldText) return text;
	return text.split(oldText).join(newText);
}

function replaceAllIgnoreCase(text: string, oldText: string, newText: string): string {
	if (!oldText) return text;
	const lowerText = text.toLowerCase();
	const lowerOld = oldText.toLowerCase();
	let result = "";
	let pos = 0;
	let idx = lowerText.indexOf(lowerOld, pos);
	while (idx !== -1) {
		result += text.slice(pos, idx) + newText;
		pos = idx + oldText.length;
		idx = lowerText.indexOf(lowerOld, pos);
	}
	result += text.slice(pos);
	return result;
}

export async function batchReplaceText(
	templateBuffer: ArrayBuffer,
	params: BatchReplaceTextParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("batch-replace-text: params is null or undefined");
		return templateBuffer;
	}

	const template = await loadTemplate(templateBuffer);

	const replacements = params.replacements ?? [];
	const matchCase = params.matchCase ?? false;
	const lowerBound = params.lowerBoundSlideNumber ?? 1;
	const upperBound = params.upperBoundSlideNumber ?? 9999;

	if (replacements.length === 0 || lowerBound > upperBound) {
		console.warn("batchReplaceText: no replacements or invalid range");
		return templateBuffer;
	}

	const startIndex = Math.max(0, lowerBound - 1);
	const endIndex = Math.min(template.slideCount - 1, upperBound - 1);

	if (startIndex > endIndex) {
		console.warn("batchReplaceText: no slides in range");
		return templateBuffer;
	}

	const zip = await JSZip.loadAsync(templateBuffer);

	for (let slideIndex = startIndex; slideIndex <= endIndex; slideIndex++) {
		const slidePath = `ppt/slides/slide${slideIndex + 1}.xml`;
		const slideFile = zip.file(slidePath);
		if (!slideFile) continue;

		const slideXml: string = await slideFile.async("text");
		const doc = parseXml(slideXml);
		if (!doc) continue;

		const aTs = doc.getElementsByTagNameNS(NS_A, "t");
		let modified = false;

		for (const aT of aTs) {
			const originalText = aT.textContent ?? "";

			let newText = originalText;
			for (const pair of replacements) {
				if (matchCase) {
					newText = replaceAllCase(newText, pair.oldText, pair.newText);
				} else {
					newText = replaceAllIgnoreCase(newText, pair.oldText, pair.newText);
				}
			}

			if (newText !== originalText) {
				aT.textContent = newText;
				modified = true;
			}
		}

		if (modified) {
			zip.file(slidePath, serializeXml(doc));
		}
	}

	return zip.generateAsync({ type: "arraybuffer" });
}
