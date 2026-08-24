/**
 * duplicate-slide-range.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import JSZip from "jszip";
import { loadTemplate } from "../template-loader";
import { addSlideToPresentation } from "../presentation-writer";

export interface DuplicateSlideRangeParams {
	lowerBoundSlideNumber?: number;
	upperBoundSlideNumber?: number;
	insertionSlideNumber: number;
}

export async function duplicateSlideRange(
	templateBuffer: ArrayBuffer,
	params: DuplicateSlideRangeParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("duplicate-slide-range: params is null or undefined");
		return templateBuffer;
	}

	const template = await loadTemplate(templateBuffer);

	const lowerBound = params.lowerBoundSlideNumber ?? 1;
	const upperBound = params.upperBoundSlideNumber ?? 9999;

	if (lowerBound > upperBound) {
		console.warn("duplicateSlideRange: lowerBound exceeds upperBound");
		return templateBuffer;
	}

	const startIndex = Math.max(0, lowerBound - 1);
	const endIndex = Math.min(template.slideCount - 1, upperBound - 1);

	if (startIndex > endIndex) {
		console.warn("duplicateSlideRange: no slides in range");
		return templateBuffer;
	}

	const zip = await JSZip.loadAsync(templateBuffer);

	const sourcePairs: Array<{ slideXml: string; relsXml: string | undefined }> = [];
	for (let i = startIndex; i <= endIndex; i++) {
		const slidePath = `ppt/slides/slide${i + 1}.xml`;
		const slideFile = zip.file(slidePath);
		if (!slideFile) continue;

		const relsPath = `ppt/slides/_rels/slide${i + 1}.xml.rels`;
		const relsFile = zip.file(relsPath);

		sourcePairs.push({
			slideXml: await slideFile.async("text"),
			relsXml: relsFile ? await relsFile.async("text") : undefined,
		});
	}

	if (sourcePairs.length === 0) {
		return templateBuffer;
	}

	const registry = addSlideToPresentation({
		presentationXml: template.presentationXml,
		contentTypeXml: template.contentTypeXml,
		relsXml: template.relsXml,
		presentationRelsXml: template.presentationRelsXml,
		slideRelsXmls: template.slideRelsXmls,
		templateSlideIndex: startIndex,
		newSlideCount: sourcePairs.length,
		insertBeforeSlideNumber: params.insertionSlideNumber,
	});

	zip.file("ppt/presentation.xml", registry.presentationXml);
	zip.file("[Content_Types].xml", registry.contentTypeXml);
	zip.file("_rels/.rels", registry.relsXml);
	zip.file("ppt/_rels/presentation.xml.rels", registry.presentationRelsXml);

	const existingSlideCount = template.slideCount;
	for (const [i, pair] of sourcePairs.entries()) {
		const slideNum = existingSlideCount + 1 + i;
		zip.file(`ppt/slides/slide${slideNum}.xml`, pair.slideXml);
		if (pair.relsXml) {
			zip.file(`ppt/slides/_rels/slide${slideNum}.xml.rels`, pair.relsXml);
		}
	}

	return zip.generateAsync({ type: "arraybuffer" });
}
