/**
 * set-headers.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import JSZip from "jszip";
import { loadTemplate } from "../template-loader";
import { cloneShapesIntoSlide } from "../slide-cloner";
import { replaceTextInSlide } from "../text-replacer";
import { applyTextStylesToSlide } from "../style-applier";
import { toPptColor } from "../color-map";
import type { TextStyles } from "../text-replacer";
import type { SetHeaderItem } from "@gsg/shared";

export interface SetHeadersParams {
	setHeaderItems: SetHeaderItem[];
	headerLength?: number;
	overrideBorderKey?: string;
	overrideTopicPrefix?: string;
	activeSectionColor?: string;
	inactiveSectionColor?: string;
	activeSectionItalic?: boolean;
	inactiveSectionItalic?: boolean;
	activeSectionStrikethrough?: boolean;
	inactiveSectionStrikethrough?: boolean;
	activeSectionUnderline?: boolean;
	inactiveSectionUnderline?: boolean;
	activeSectionFontSize?: number;
	inactiveSectionFontSize?: number;
}

function buildInactiveStyles(global: SetHeadersParams): TextStyles {
	const styles: TextStyles = { bold: false };
	const color: string | undefined = toPptColor(global.inactiveSectionColor ?? "LIGHT1");
	if (color) styles.color = color;
	if (global.inactiveSectionItalic !== undefined) styles.italic = global.inactiveSectionItalic;
	if (global.inactiveSectionStrikethrough !== undefined) styles.strikethrough = global.inactiveSectionStrikethrough;
	if (global.inactiveSectionUnderline !== undefined) styles.underline = global.inactiveSectionUnderline;
	if (global.inactiveSectionFontSize !== undefined) styles.fontSize = global.inactiveSectionFontSize;
	return styles;
}

function buildActiveStyles(global: SetHeadersParams): TextStyles {
	const styles: TextStyles = { bold: true };
	const color: string | undefined = toPptColor(global.activeSectionColor ?? "DARK1");
	if (color) styles.color = color;
	if (global.activeSectionItalic !== undefined) styles.italic = global.activeSectionItalic;
	if (global.activeSectionStrikethrough !== undefined) styles.strikethrough = global.activeSectionStrikethrough;
	if (global.activeSectionUnderline !== undefined) styles.underline = global.activeSectionUnderline;
	if (global.activeSectionFontSize !== undefined) styles.fontSize = global.activeSectionFontSize;
	return styles;
}

export async function setHeaders(
	templateBuffer: ArrayBuffer,
	params: SetHeadersParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("set-headers: params is null or undefined");
		return templateBuffer;
	}

	if (!params.setHeaderItems || params.setHeaderItems.length === 0) {
		console.warn("set-headers: setHeaderItems is empty or undefined");
		return templateBuffer;
	}

	const template = await loadTemplate(templateBuffer);

	const borderKey: string = params.overrideBorderKey ?? "top-bar-border-key";
	const topicPrefix: string = params.overrideTopicPrefix ?? "top-bar-topic-";
	const headerLength: number = params.headerLength ?? 3;

	const requiredKeys: string[] = [borderKey];
	for (let i = 1; i <= headerLength; i++) {
		requiredKeys.push(`${topicPrefix}${i}-of-${headerLength}-text`);
	}

	let templateSlideXml: string | undefined;
	for (const slide of template.slides) {
		if (requiredKeys.every((k) => slide.keys.includes(k))) {
			templateSlideXml = slide.xml;
			break;
		}
	}

	if (!templateSlideXml) {
		console.warn("setHeaders: no template slide found with required keys");
		return templateBuffer;
	}

	const headerSectionStrings: string[] = params.setHeaderItems
		.map((item) => item.sectionName)
		.filter((name): name is string => name !== undefined);

	const inactiveStyles: TextStyles = buildInactiveStyles(params);
	const activeStyles: TextStyles = buildActiveStyles(params);

	const zip = await JSZip.loadAsync(templateBuffer);

	let headerStringIndex: number = 0;
	let headerStringBaseIndex: number = 0;

	for (const item of params.setHeaderItems) {
		const topicKeys: string[] = [];
		for (let i = 0; i < headerLength; i++) {
			topicKeys.push(`${topicPrefix}${i + 1}-of-${headerLength}-text`);
		}

		const startIndex: number = Math.max(0, item.sectionStartSlideNumber - 1);
		const endIndex: number = Math.min(template.slideCount - 1, item.sectionEndSlideNumber - 1);

		for (let slideIndex = startIndex; slideIndex <= endIndex; slideIndex++) {
			const slidePath: string = `ppt/slides/slide${slideIndex + 1}.xml`;
			const slideFile = zip.file(slidePath);
			if (!slideFile) continue;

			let slideXml: string = await slideFile.async("text");

			slideXml = cloneShapesIntoSlide(templateSlideXml, slideXml, requiredKeys);

			for (let i = 0; i < headerLength; i++) {
				const key: string = topicKeys[i]!;
				const text: string = headerSectionStrings[headerStringBaseIndex + i] ?? "";
				const styles: TextStyles = { ...inactiveStyles };
				slideXml = replaceTextInSlide(slideXml, key, text, styles);
			}

			if (item.sectionName !== undefined) {
				const headerRelativeIndex: number = headerStringIndex - headerStringBaseIndex;
				const boldedIndex: number = Math.min(headerRelativeIndex, headerLength - 1);
				const activeKey: string = topicKeys[boldedIndex]!;
				slideXml = applyTextStylesToSlide(slideXml, activeKey, activeStyles);
			}

			zip.file(slidePath, slideXml);
		}

		if (item.sectionName !== undefined) {
			const headerRelativeIndex: number = headerStringIndex - headerStringBaseIndex;
			headerStringIndex += 1;
			if (
				headerRelativeIndex > Math.ceil(headerLength / 2) - 2 &&
				headerStringBaseIndex + headerLength < headerSectionStrings.length
			) {
				headerStringBaseIndex += 1;
			}
		}
	}

	return zip.generateAsync({ type: "arraybuffer" });
}
