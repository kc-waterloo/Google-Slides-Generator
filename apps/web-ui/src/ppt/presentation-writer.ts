/**
 * presentation-writer.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { parseXml, serializeXml, NS_R, NS_REL, NS_CT, findMaxId } from "./xml-utils";

const NS_P_PRES = "http://schemas.openxmlformats.org/presentationml/2006/main";

export interface AddSlideResult {
	presentationXml: string;
	contentTypeXml: string;
	relsXml: string;
	presentationRelsXml: string;
	slideRelsXmls: string[];
}

export function addSlideToPresentation({
	presentationXml,
	contentTypeXml,
	relsXml,
	presentationRelsXml,
	slideRelsXmls,
	templateSlideIndex,
	newSlideCount,
	insertBeforeSlideNumber,
}: {
	presentationXml: string;
	contentTypeXml: string;
	relsXml: string;
	presentationRelsXml: string;
	slideRelsXmls: string[];
	templateSlideIndex: number;
	newSlideCount: number;
	insertBeforeSlideNumber?: number;
}): AddSlideResult {
	if (newSlideCount <= 0) {
		return { presentationXml, contentTypeXml, relsXml, presentationRelsXml, slideRelsXmls };
	}

	const existingSlideCount = slideRelsXmls.length;
	const templateRels = slideRelsXmls[templateSlideIndex] ?? slideRelsXmls[0] ?? "";

	const presDoc = parseXml(presentationXml);
	const ctypeDoc = parseXml(contentTypeXml);
	const presRelsDoc = parseXml(presentationRelsXml);

	if (!presDoc || !ctypeDoc || !presRelsDoc) {
		return { presentationXml, contentTypeXml, relsXml, presentationRelsXml, slideRelsXmls };
	}

	const sldIdLst = presDoc.querySelector("p\\:sldIdLst, sldIdLst");
	if (!sldIdLst) return {
		presentationXml, contentTypeXml, relsXml, presentationRelsXml, slideRelsXmls,
	};

	const ctypeRoot = ctypeDoc.documentElement;
	const presRelsRoot = presRelsDoc.documentElement;

	// Find max existing sldId
	const maxSldId = findMaxId(presDoc);
	let nextSldId = maxSldId + 1;

	// Find max existing rId
	const maxRId = findMaxRId(presRelsDoc);
	let nextRId = maxRId + 1;

	// Find reference node for insertion (slide before which to insert)
	let insertBeforeNode: Element | null = null;
	if (insertBeforeSlideNumber !== undefined && insertBeforeSlideNumber > 0 && insertBeforeSlideNumber <= existingSlideCount + 1) {
		const beforeIndex = insertBeforeSlideNumber - 1;
		const existingSldIds = sldIdLst.querySelectorAll("p\\:sldId, sldId");
		if (beforeIndex < existingSldIds.length) {
			insertBeforeNode = existingSldIds[beforeIndex]!;
		}
	}

	const newSlideRels: string[] = [];

	for (let i = 0; i < newSlideCount; i++) {
		const slideNum = existingSlideCount + 1 + i;
		const sldId = nextSldId++;
		const rId = `rId${nextRId++}`;

		// Add sldId entry to presentation.xml
		const sldIdEl = presDoc.createElementNS(NS_P_PRES, "p:sldId");
		sldIdEl.setAttribute("id", String(sldId));
		sldIdEl.setAttributeNS(NS_R, "r:id", rId);
		if (insertBeforeNode) {
			sldIdLst.insertBefore(sldIdEl, insertBeforeNode);
		} else {
			sldIdLst.appendChild(sldIdEl);
		}

		// Add Override to [Content_Types].xml
		const overrideEl = ctypeDoc.createElementNS(NS_CT, "Override");
		overrideEl.setAttribute("PartName", `/ppt/slides/slide${slideNum}.xml`);
		overrideEl.setAttribute(
			"ContentType",
			"application/vnd.openxmlformats-officedocument.presentationml.slide+xml",
		);
		ctypeRoot!.appendChild(overrideEl);

		// Add Relationship to presentation.xml.rels
		const relEl = presRelsDoc.createElementNS(NS_REL, "Relationship");
		relEl.setAttribute("Id", rId);
		relEl.setAttribute(
			"Type",
			"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide",
		);
		relEl.setAttribute("Target", `slides/slide${slideNum}.xml`);
		presRelsRoot!.appendChild(relEl);

		newSlideRels.push(templateRels);
	}

	return {
		presentationXml: serializeXml(presDoc),
		contentTypeXml: serializeXml(ctypeDoc),
		relsXml,
		presentationRelsXml: serializeXml(presRelsDoc),
		slideRelsXmls: [...slideRelsXmls, ...newSlideRels],
	};
}

function findMaxRId(relDoc: Document): number {
	let max = 0;
	const attrs = relDoc.querySelectorAll("Relationship");
	for (const el of attrs) {
		const id = el.getAttribute("Id");
		if (id && id.startsWith("rId")) {
			const num = parseInt(id.slice(3), 10);
			if (!isNaN(num) && num > max) max = num;
		}
	}
	return max;
}
