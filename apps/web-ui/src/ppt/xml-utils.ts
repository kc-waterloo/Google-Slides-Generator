/**
 * xml-utils.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
export const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";
export const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
export const NS_CT = "http://schemas.openxmlformats.org/package/2006/content-types";
export const NS_REL = "http://schemas.openxmlformats.org/package/2006/relationships";

/**
 * Find all shape (p:sp) elements in a document matching a given key (p:cNvPr name).
 * Traverses cNvPr → nvSpPr → sp to handle OOXML structure correctly.
 */
export const findShapesByKey = (doc: Document, key: string): Element[] => {
	if (!doc || !doc.getElementsByTagNameNS) return [];
	const result: Element[] = [];
	const cNvPrs = doc.getElementsByTagNameNS(NS_P, "cNvPr");
	for (const cNvPr of cNvPrs) {
		if (cNvPr.getAttribute("name") === key) {
			const sp = cNvPr.parentElement?.parentElement;
			if (sp) {
				result.push(sp);
			}
		}
	}
	return result;
};

/**
 * Parse an XML string into a DOM Document.
 * Checks for parser errors and returns null on failure.
 */
export const parseXml = (xml: string): Document | null => {
	const doc = new DOMParser().parseFromString(xml, "text/xml");
	const error = doc.querySelector("parsererror");
	if (error) return null;
	return doc;
};

/**
 * Serialize a DOM Document back to XML string.
 */
export const serializeXml = (doc: Document): string => {
	return new XMLSerializer().serializeToString(doc);
};

/**
 * Find the maximum numeric ID value in one or more documents.
 * Looks for all id="..." attributes.
 */
export const findMaxId = (...docs: Document[]): number => {
	let max = 0;
	for (const doc of docs) {
		const els = doc.querySelectorAll("[id]");
		for (const el of els) {
			const val = el.getAttribute("id");
			if (val) {
				const num = parseInt(val, 10);
				if (!isNaN(num) && num > max) max = num;
			}
		}
	}
	return max;
};


