/**
 * move-slides.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import JSZip from "jszip";

export interface MoveSlidesParams {
	fromSlideNumber: number;
	toSlideNumber: number;
	targetSlideNumber: number;
}

export async function moveSlides(
	templateBuffer: ArrayBuffer,
	params: MoveSlidesParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("move-slides: params is null or undefined");
		return templateBuffer;
	}

	if (params.fromSlideNumber < 1 || params.toSlideNumber < 1 || params.targetSlideNumber < 1) {
		console.warn("moveSlides: slide numbers must be >= 1");
		return templateBuffer;
	}

	if (params.fromSlideNumber > params.toSlideNumber) {
		console.warn("moveSlides: fromSlideNumber exceeds toSlideNumber");
		return templateBuffer;
	}

	const zip = await JSZip.loadAsync(templateBuffer);

	const readFile = async (path: string): Promise<string> => {
		const file = zip.file(path);
		if (!file) throw new Error(`Missing required file in template: ${path}`);
		return file.async("text");
	};

	const presXml: string = await readFile("ppt/presentation.xml");

	const sldIdMatches = presXml.matchAll(
		/<p:sldId\s+id="(\d+)"\s+r:id="([^"]+)"\s*\/>/g,
	);
	const entries: Array<{ id: string; rid: string; full: string }> = [];
	for (const match of sldIdMatches) {
		entries.push({
			id: match[1]!,
			rid: match[2]!,
			full: match[0]!,
		});
	}

	if (entries.length === 0) {
		return templateBuffer;
	}

	const fromIdx = params.fromSlideNumber - 1;
	const toIdx = Math.min(params.toSlideNumber - 1, entries.length - 1);

	if (fromIdx > toIdx || fromIdx >= entries.length) {
		return templateBuffer;
	}

	const sliced = entries.splice(fromIdx, toIdx - fromIdx + 1);

	const originalTarget = params.targetSlideNumber - 1;
	const removedCount = toIdx - fromIdx + 1;

	let insertIdx: number;
	if (originalTarget <= fromIdx) {
		insertIdx = originalTarget;
	} else {
		insertIdx = Math.max(fromIdx, originalTarget - removedCount);
	}

	insertIdx = Math.min(insertIdx, entries.length);
	entries.splice(insertIdx, 0, ...sliced);

	const newSldIdLst = entries.map((e) => e.full).join("\n    ");
	const newPresXml = presXml.replace(
		/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/,
		`<p:sldIdLst>\n    ${newSldIdLst}\n  </p:sldIdLst>`,
	);

	zip.file("ppt/presentation.xml", newPresXml);

	return zip.generateAsync({ type: "arraybuffer" });
}
