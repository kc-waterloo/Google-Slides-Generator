/**
 * slide-cloner.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { findMaxId, parseXml, serializeXml } from "./xml-utils";

const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";

export type ThemeOverride = Record<string, string>;

export interface CloneOptions {
	themeOverride?: ThemeOverride;
}

export class SlideClonerBuilder {
	private sourceXml: string = "";
	private targetXml: string = "";
	private keys: string[] = [];
	private options: CloneOptions = {};

	withSourceXml(xml: string): SlideClonerBuilder {
		this.sourceXml = xml;
		return this;
	}

	withTargetXml(xml: string): SlideClonerBuilder {
		this.targetXml = xml;
		return this;
	}

	withKeys(keys: string[]): SlideClonerBuilder {
		this.keys = keys;
		return this;
	}

	withThemeOverride(themeOverride: ThemeOverride): SlideClonerBuilder {
		this.options.themeOverride = themeOverride;
		return this;
	}

	clone(): string {
		return cloneShapesIntoSlide(this.sourceXml, this.targetXml, this.keys, this.options);
	}
}

export function cloneShapesIntoSlide(
	sourceSlideXml: string,
	targetSlideXml: string,
	keys: string[],
	options?: CloneOptions,
): string {
	const sourceDoc = parseXml(sourceSlideXml);
	const targetDoc = parseXml(targetSlideXml);
	if (!sourceDoc || !targetDoc) return targetSlideXml;

	const sourceSpTree = sourceDoc.querySelector("p\\:spTree, spTree");
	const targetSpTree = targetDoc.querySelector("p\\:spTree, spTree");
	if (!sourceSpTree || !targetSpTree) return targetSlideXml;

	const maxExistingId = Math.max(findMaxId(sourceDoc, targetDoc), 256);
	let nextId = maxExistingId + 1;

	const keysSet = new Set(keys);
	const sourceShapes = sourceSpTree.querySelectorAll("p\\:sp, sp");

	let anyCloned = false;
	for (const shape of sourceShapes) {
		const nameEl = shape.querySelector("p\\:cNvPr, cNvPr");
		const shapeName = nameEl?.getAttribute("name") ?? "";
		if (!keysSet.has(shapeName)) continue;

		const clone = targetDoc.importNode(shape, true);
		reassignIdsSequential(clone, nextId);
		nextId += countIdsInElement(clone) || 1;
		targetSpTree.appendChild(clone);
		anyCloned = true;
	}

	if (!anyCloned) return targetSlideXml;

	if (options?.themeOverride) {
		applyThemeOverride(targetDoc, options.themeOverride);
	}

	return serializeXml(targetDoc);
}

export function applyThemeOverride(doc: Document, themeOverride: ThemeOverride): void {
	const allElements = Array.from(doc.getElementsByTagNameNS("*", "schemeClr"));
	for (const el of allElements) {
		const val = el.getAttribute("val");
		if (val && themeOverride[val]) {
			const srgbClr = doc.createElementNS(NS_A, "a:srgbClr");
			srgbClr.setAttribute("val", themeOverride[val]!);
			el.parentNode?.replaceChild(srgbClr, el);
		}
	}
}

export function countIdsInElement(root: Element): number {
	return root.querySelectorAll("[id]").length;
}

export function reassignIdsSequential(root: Element, startId: number): void {
	let current = startId;
	const allIdEls = root.querySelectorAll("[id]");
	for (const el of allIdEls) {
		el.setAttribute("id", String(current++));
	}
}
