/**
 * pipeline.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import JSZip from "jszip";
import { loadTemplate } from "./template-loader";
import { cloneShapesIntoSlide } from "./slide-cloner";
import { replaceTextInSlide } from "./text-replacer";
import { applyTextStylesToSlide } from "./style-applier";
import { addSlideToPresentation } from "./presentation-writer";
import type { TextStyles } from "./text-replacer";

const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";

const MINIMAL_SLIDE_SHELL = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="${NS_P}" xmlns:a="${NS_A}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
    </p:spTree>
  </p:cSld>
</p:sld>`;

export interface SlideOperation {
	templateSourceKey: string;
	textReplacements: Record<string, string>;
	styleOverrides?: Record<string, TextStyles>;
}

export async function generateSlidesFromTemplate(
	templateBuffer: ArrayBuffer,
	operations: SlideOperation[],
): Promise<ArrayBuffer> {
	if (operations.length === 0) {
		return templateBuffer;
	}

	const template = await loadTemplate(templateBuffer);

	const sourceSlidesByKey = new Map<string, { xml: string; index: number }>();
	for (let i = 0; i < template.slides.length; i++) {
		const slide = template.slides[i]!;
		for (const key of slide.keys) {
			if (!sourceSlidesByKey.has(key)) {
				sourceSlidesByKey.set(key, { xml: slide.xml, index: i });
			}
		}
	}

	const currentPresXml = template.presentationXml;
	const currentCtypeXml = template.contentTypeXml;
	const currentRelsXml = template.relsXml;
	const currentPresRelsXml = template.presentationRelsXml;
	const currentSlideRelsXmls = [...template.slideRelsXmls];

	const newSlideXmls: string[] = [];
	const newSlideSourceIndices: number[] = [];

	for (const op of operations) {
		const entry = sourceSlidesByKey.get(op.templateSourceKey);
		if (!entry) {
			console.warn(`pipeline: no template slide found for key "${op.templateSourceKey}"`);
			continue;
		}
		const { xml: sourceXml, index: sourceIndex } = entry;

		const keys = Object.keys(op.textReplacements);
		const styleKeys = op.styleOverrides ? Object.keys(op.styleOverrides) : [];
		const allKeys = [...new Set([...keys, ...styleKeys])];

		let slideXml = cloneShapesIntoSlide(sourceXml, MINIMAL_SLIDE_SHELL, allKeys);
		if (slideXml === MINIMAL_SLIDE_SHELL) continue;

		for (const [key, text] of Object.entries(op.textReplacements)) {
			const styles = op.styleOverrides?.[key];
			slideXml = replaceTextInSlide(slideXml, key, text, styles);
		}

		for (const [key, styles] of Object.entries(op.styleOverrides ?? {})) {
			if (!(key in op.textReplacements)) {
				slideXml = applyTextStylesToSlide(slideXml, key, styles);
			}
		}

		newSlideXmls.push(slideXml);
		newSlideSourceIndices.push(sourceIndex);
	}

	if (newSlideXmls.length === 0) {
		return templateBuffer;
	}

	const primarySourceIndex = newSlideSourceIndices[0] ?? 0;

	const registry = addSlideToPresentation({
		presentationXml: currentPresXml,
		contentTypeXml: currentCtypeXml,
		relsXml: currentRelsXml,
		presentationRelsXml: currentPresRelsXml,
		slideRelsXmls: currentSlideRelsXmls,
		templateSlideIndex: primarySourceIndex,
		newSlideCount: newSlideXmls.length,
	});

	const zip = await JSZip.loadAsync(templateBuffer);

	zip.file("ppt/presentation.xml", registry.presentationXml);
	zip.file("[Content_Types].xml", registry.contentTypeXml);
	zip.file("_rels/.rels", registry.relsXml);
	zip.file("ppt/_rels/presentation.xml.rels", registry.presentationRelsXml);

	const existingSlideCount = template.slideCount;
	for (const [i, slideXml] of newSlideXmls.entries()) {
		const slideNum = existingSlideCount + 1 + i;
		zip.file(`ppt/slides/slide${slideNum}.xml`, slideXml);

		const rels = registry.slideRelsXmls[existingSlideCount + i];
		if (rels) {
			zip.file(`ppt/slides/_rels/slide${slideNum}.xml.rels`, rels);
		}
	}

	return zip.generateAsync({ type: "arraybuffer" });
}
