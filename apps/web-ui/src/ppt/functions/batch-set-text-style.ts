/**
 * batch-set-text-style.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import JSZip from "jszip";
import { loadTemplate } from "../template-loader";
import { applyTextStylesToSlide } from "../style-applier";
import { toPptColor } from "../color-map";
import type { TextStyles } from "../text-replacer";
import type { TextStyleOverride } from "@gsg/shared";

export interface BatchSetTextStyleParams {
	textStyles: TextStyleOverride[];
	lowerBoundSlideNumber?: number;
	upperBoundSlideNumber?: number;
}

export async function batchSetTextStyle(
	templateBuffer: ArrayBuffer,
	params: BatchSetTextStyleParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("batch-set-text-style: params is null or undefined");
		return templateBuffer;
	}

	const template = await loadTemplate(templateBuffer);

	const textStyles = params.textStyles ?? [];
	const lowerBound = params.lowerBoundSlideNumber ?? 1;
	const upperBound = params.upperBoundSlideNumber ?? 9999;

	if (textStyles.length === 0 || lowerBound > upperBound) {
		console.warn("batchSetTextStyle: empty textStyles or invalid range");
		return templateBuffer;
	}

	const startIndex = Math.max(0, lowerBound - 1);
	const endIndex = Math.min(template.slideCount - 1, upperBound - 1);

	if (startIndex > endIndex) {
		return templateBuffer;
	}

	const zip = await JSZip.loadAsync(templateBuffer);

	for (let slideIndex = startIndex; slideIndex <= endIndex; slideIndex++) {
		const slidePath = `ppt/slides/slide${slideIndex + 1}.xml`;
		const slideFile = zip.file(slidePath);
		if (!slideFile) continue;

		let slideXml: string = await slideFile.async("text");
		let modified = false;

		for (const override of textStyles) {
			if (override.borderColor !== undefined) {
				console.warn(`batchSetTextStyle: borderColor not supported in OOXML version, ignoring key "${override.pageElementKey}"`);
			}
			const styles: TextStyles = {};
			if (override.fontSize !== undefined) styles.fontSize = override.fontSize;
			if (override.bold !== undefined) styles.bold = override.bold;
			if (override.italic !== undefined) styles.italic = override.italic;
			if (override.strikethrough !== undefined) styles.strikethrough = override.strikethrough;
			if (override.underline !== undefined) styles.underline = override.underline;
			if (override.color !== undefined) {
				const hex = toPptColor(override.color);
				if (hex) styles.color = hex;
			}

			if (Object.keys(styles).length > 0) {
				const newXml = applyTextStylesToSlide(slideXml, override.pageElementKey, styles);
				if (newXml !== slideXml) {
					slideXml = newXml;
					modified = true;
				}
			}
		}

		if (modified) {
			zip.file(slidePath, slideXml);
		}
	}

	return zip.generateAsync({ type: "arraybuffer" });
}
