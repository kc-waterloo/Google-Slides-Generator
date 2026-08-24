/**
 * text-replacer.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { setStyleAttributes } from "./style-applier";
import { parseXml, serializeXml, NS_P, NS_A, findShapesByKey } from "./xml-utils";

export interface TextStyles {
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	fontSize?: number;
	color?: string;
}

const collapseRuns = (txBody: Element): void => {
	const aPs = txBody.getElementsByTagNameNS(NS_A, "p");
	for (const aP of aPs) {
		const aRs = Array.from(aP.getElementsByTagNameNS(NS_A, "r"));
		if (aRs.length <= 1) continue;

		let combinedText = "";
		let firstT: Element | null = null;
		for (const r of aRs) {
			const aT = r.getElementsByTagNameNS(NS_A, "t")[0];
			if (!aT) continue;
			if (!firstT) firstT = aT;
			combinedText += aT.textContent ?? "";
		}

		while (aRs.length > 1) {
			const last = aRs.pop()!;
			last.parentElement?.removeChild(last);
		}

		if (firstT) {
			firstT.textContent = combinedText;
		}
	}
};

export const replaceTextInSlide = (
	slideXml: string,
	elementKey: string,
	newText: string,
	styles?: TextStyles,
): string => {
	const doc = parseXml(slideXml);
	if (!doc) return slideXml;

	const shapes = findShapesByKey(doc, elementKey);

	for (const sp of shapes) {
		const txBodies = sp.getElementsByTagNameNS(NS_P, "txBody");
		for (const txBody of txBodies) {
			collapseRuns(txBody);

			const aTs = txBody.getElementsByTagNameNS(NS_A, "t");
			if (aTs.length > 0) {
				aTs[0]!.textContent = newText;
			} else {
				const aPs = txBody.getElementsByTagNameNS(NS_A, "p");
				if (aPs.length > 0) {
					const aRs = aPs[0]!.getElementsByTagNameNS(NS_A, "r");
					if (aRs.length > 0) {
						const aT = doc.createElementNS(NS_A, "t");
						aT.textContent = newText;
						aRs[0]!.appendChild(aT);
					}
				}
			}

			if (styles) {
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
	}

	return serializeXml(doc);
};
