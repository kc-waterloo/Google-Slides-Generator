/**
 * style-applier.ts
 *
 * Created by Min-Kyu Lee on 08-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { TextStyles } from "./text-replacer";
import { parseXml, serializeXml, NS_P, NS_A, findShapesByKey } from "./xml-utils";

export const setStyleAttributes = (rPr: Element, styles: TextStyles): void => {
	if (styles.bold !== undefined) {
		rPr.setAttribute("b", styles.bold ? "1" : "0");
	}
	if (styles.italic !== undefined) {
		rPr.setAttribute("i", styles.italic ? "1" : "0");
	}
	if (styles.underline !== undefined) {
		rPr.setAttribute("u", styles.underline ? "sng" : "none");
	}
	if (styles.strikethrough !== undefined) {
		rPr.setAttribute("strike", styles.strikethrough ? "sngStrike" : "noStrike");
	}
	if (styles.fontSize !== undefined) {
		rPr.setAttribute("sz", String(styles.fontSize));
	}
	if (styles.color !== undefined) {
		let solidFill = rPr.getElementsByTagNameNS(NS_A, "solidFill")[0];
		if (!solidFill) {
			solidFill = rPr.ownerDocument!.createElementNS(NS_A, "solidFill");
			rPr.insertBefore(solidFill, rPr.firstChild);
		}
		let srgbClr = solidFill.getElementsByTagNameNS(NS_A, "srgbClr")[0];
		if (!srgbClr) {
			srgbClr = rPr.ownerDocument!.createElementNS(NS_A, "srgbClr");
			solidFill.appendChild(srgbClr);
		}
		srgbClr.setAttribute("val", styles.color);
	}
};

export const applyTextStylesToSlide = (
	slideXml: string,
	elementKey: string,
	styles: TextStyles,
): string => {
	const doc = parseXml(slideXml);
	if (!doc) return slideXml;

	const shapes = findShapesByKey(doc, elementKey);

	for (const sp of shapes) {
		const txBodies = sp.getElementsByTagNameNS(NS_P, "txBody");
		for (const txBody of txBodies) {
			const rPrs = txBody.getElementsByTagNameNS(NS_A, "rPr");
			if (rPrs.length > 0) {
				setStyleAttributes(rPrs[0]!, styles);
			} else {
				const aRs = txBody.getElementsByTagNameNS(NS_A, "r");
				const firstR = aRs[0];
				if (firstR) {
					const rPr = doc.createElementNS(NS_A, "rPr");
					firstR.insertBefore(rPr, firstR.firstChild);
					setStyleAttributes(rPr, styles);
				}
			}
		}
	}

	return serializeXml(doc);
};
