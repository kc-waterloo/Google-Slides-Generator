/**
 * apply-background-color.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import JSZip from "jszip";
import { toPptColor } from "../color-map";

const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";

export interface ApplyBackgroundColorParams {
	color: string;
	lowerBoundSlideNumber?: number;
	upperBoundSlideNumber?: number;
}

export async function applyBackgroundColor(
	templateBuffer: ArrayBuffer,
	params: ApplyBackgroundColorParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("apply-background-color: params is null or undefined");
		return templateBuffer;
	}

	const hexColor = toPptColor(params.color);
	if (!hexColor) {
		console.warn(`applyBackgroundColor: unknown color "${params.color}"`);
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
		/<p:sldId[^>]*r:id="([^"]+)"[^>]*\/>/g,
	);
	const ridOrder: string[] = [];
	for (const match of sldIdMatches) {
		ridOrder.push(match[1]!);
	}

	const presRelsXml: string = await readFile("ppt/_rels/presentation.xml.rels");

	const ridToSlideNum = (rid: string): number | null => {
		const re = new RegExp(`<Relationship[^>]*Id="${rid}"[^>]*Target="slides/slide(\\d+)\\.xml"`);
		const m = presRelsXml.match(re);
		return m ? parseInt(m[1]!, 10) : null;
	};

	const lowerBoundIndex = (params.lowerBoundSlideNumber ?? 1) - 1;
	const upperBoundIndex = (params.upperBoundSlideNumber ?? 9999) - 1;

	if (lowerBoundIndex > upperBoundIndex) {
		return templateBuffer;
	}

	for (let i = lowerBoundIndex; i <= upperBoundIndex && i < ridOrder.length; i++) {
		const rid = ridOrder[i];
		if (!rid) continue;
		const slideNum = ridToSlideNum(rid);
		if (slideNum === null) continue;

		const slidePath = `ppt/slides/slide${slideNum}.xml`;
		const slideFile = zip.file(slidePath);
		if (!slideFile) continue;
		const slideXml: string = await slideFile.async("text");

		const doc = new DOMParser().parseFromString(slideXml, "text/xml");
		const cSld = doc.querySelector("p\\:cSld, cSld");
		if (!cSld) continue;

		const buildSolidFill = (): Element => {
			const solidFill = doc.createElementNS(NS_A, "a:solidFill");
			const srgbClr = doc.createElementNS(NS_A, "a:srgbClr");
			srgbClr.setAttribute("val", hexColor);
			solidFill.appendChild(srgbClr);
			return solidFill;
		};

		const existingBg = doc.querySelector("p\\:bg, bg");
		if (existingBg) {
			while (existingBg.firstChild) existingBg.removeChild(existingBg.firstChild);
			const bgPr = doc.createElementNS(NS_P, "p:bgPr");
			bgPr.appendChild(buildSolidFill());
			existingBg.appendChild(bgPr);
		} else {
			const bg = doc.createElementNS(NS_P, "p:bg");
			const bgPr = doc.createElementNS(NS_P, "p:bgPr");
			bgPr.appendChild(buildSolidFill());
			bg.appendChild(bgPr);
			cSld.insertBefore(bg, cSld.firstChild);
		}

		const serializer = new XMLSerializer();
		const modifiedXml = serializer.serializeToString(doc);
		zip.file(slidePath, modifiedXml);
	}

	return zip.generateAsync({ type: "arraybuffer" });
}
