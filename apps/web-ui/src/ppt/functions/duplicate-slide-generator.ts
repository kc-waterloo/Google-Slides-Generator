/**
 * duplicate-slide-generator.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { cloneShapesIntoSlide, countIdsInElement, reassignIdsSequential } from "../slide-cloner";
import type { CloneOptions } from "../slide-cloner";
import { findMaxId, parseXml, serializeXml } from "../xml-utils";

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

export function createDuplicateSlideGenerator(
	sourceXml: string,
	keys: string[],
	count: number,
	options?: CloneOptions,
): string[] {
	if (count <= 0) return [];

	const templateResult = cloneShapesIntoSlide(sourceXml, MINIMAL_SLIDE_SHELL, keys, options);
	if (count === 1) return [templateResult];

	const templateDoc = parseXml(templateResult);
	if (!templateDoc) return Array(count).fill(templateResult);

	const templateSpTree = templateDoc.querySelector("p\\:spTree, spTree");
	if (!templateSpTree) return Array(count).fill(templateResult);

	const clonedShapes = [...templateSpTree.querySelectorAll("p\\:sp, sp")];
	if (clonedShapes.length === 0) return Array(count).fill(templateResult);

	const slides: string[] = [templateResult];
	let runningMaxId = Math.max(findMaxId(templateDoc), 256);

	for (let i = 1; i < count; i++) {
		const doc = parseXml(MINIMAL_SLIDE_SHELL);
		if (!doc) {
			slides.push(templateResult);
			continue;
		}

		const targetSpTree = doc.querySelector("p\\:spTree, spTree");
		if (!targetSpTree) {
			slides.push(templateResult);
			continue;
		}

		const maxId = Math.max(runningMaxId, findMaxId(doc), 256);
		let nextId = maxId + 1;

		for (const shape of clonedShapes) {
			const clone = doc.importNode(shape, true);
			reassignIdsSequential(clone, nextId);
			nextId += countIdsInElement(clone) || 1;
			targetSpTree.appendChild(clone);
		}

		runningMaxId = nextId - 1;
		slides.push(serializeXml(doc));
	}

	return slides;
}
