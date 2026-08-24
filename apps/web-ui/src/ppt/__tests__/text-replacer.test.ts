/**
 * text-replacer.test.ts
 *
 * Created by Min-Kyu Lee on 30-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { replaceTextInSlide } from "../text-replacer";

const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";

const wrapSlide = (shapes: string): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="${NS_A}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="${NS_P}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      ${shapes}
    </p:spTree>
  </p:cSld>
</p:sld>`;

const shape = (name: string, text: string, extraAttrs = ""): string =>
	`<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="${name}"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="685800"/></a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:bodyPr/>
    <a:p>
      <a:r>
        <a:rPr ${extraAttrs}><a:solidFill><a:srgbClr val="333333"/></a:solidFill><a:latin typeface="Calibri"/></a:rPr>
        <a:t>${text}</a:t>
      </a:r>
    </a:p>
  </p:txBody>
</p:sp>`;

const parseXml = (xml: string): Document =>
	new DOMParser().parseFromString(xml, "text/xml");

const serializeXml = (doc: Document): string =>
	new XMLSerializer().serializeToString(doc);

const findSpByKey = (doc: Document, key: string): Element | null => {
	const cNvPrs = doc.getElementsByTagNameNS(NS_P, "cNvPr");
	for (let i = 0; i < cNvPrs.length; i++) {
		if (cNvPrs[i]!.getAttribute("name") === key) {
			return cNvPrs[i]!.parentElement?.parentElement ?? null;
		}
	}
	return null;
};

const getTextInShape = (xml: string, name: string): string | null => {
	const doc = parseXml(xml);
	const sp = findSpByKey(doc, name);
	if (!sp) return null;
	const aTs = sp.getElementsByTagNameNS(NS_A, "t");
	return aTs.length > 0 ? aTs[0]!.textContent : null;
};

const getStyleAttr = (xml: string, name: string, attr: string): string | null => {
	const doc = parseXml(xml);
	const sp = findSpByKey(doc, name);
	if (!sp) return null;
	const rPrs = sp.getElementsByTagNameNS(NS_A, "rPr");
	if (rPrs.length === 0) return null;
	if (attr === "color") {
		const srgbClrs = rPrs[0]!.getElementsByTagNameNS(NS_A, "srgbClr");
		return srgbClrs.length > 0 ? srgbClrs[0]!.getAttribute("val") : null;
	}
	return rPrs[0]!.getAttribute(attr);
};

describe("replaceTextInSlide", () => {
	it("replaces text in a matching shape", () => {
		const input = wrapSlide(shape("section-title-text-box", "Old Title"));
		const result = replaceTextInSlide(input, "section-title-text-box", "New Title");
		expect(getTextInShape(result, "section-title-text-box")).toBe("New Title");
	});

	it("returns XML unchanged when element key is not found", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = replaceTextInSlide(input, "nonexistent-key", "New");
		expect(getTextInShape(result, "section-title-text-box")).toBe("Title");
	});

	it("sets text to empty string", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = replaceTextInSlide(input, "section-title-text-box", "");
		expect(getTextInShape(result, "section-title-text-box")).toBe("");
	});

	it("handles special XML characters", () => {
		const input = wrapSlide(shape("section-title-text-box", "Old"));
		const result = replaceTextInSlide(input, "section-title-text-box", "A & B < C > D \"quote\" 'single'");
		expect(getTextInShape(result, "section-title-text-box")).toBe("A & B < C > D \"quote\" 'single'");
	});

	it("handles Unicode characters", () => {
		const input = wrapSlide(shape("section-title-text-box", "Old"));
		const result = replaceTextInSlide(input, "section-title-text-box", "你好 👋 Café ñoño");
		expect(getTextInShape(result, "section-title-text-box")).toBe("你好 👋 Café ñoño");
	});

	it("applies bold style", () => {
		const input = wrapSlide(shape("section-title-text-box", "Text"));
		const result = replaceTextInSlide(input, "section-title-text-box", "Bold", { bold: true });
		expect(getStyleAttr(result, "section-title-text-box", "b")).toBe("1");
	});

	it("applies italic style", () => {
		const input = wrapSlide(shape("section-title-text-box", "Text"));
		const result = replaceTextInSlide(input, "section-title-text-box", "Italic", { italic: true });
		expect(getStyleAttr(result, "section-title-text-box", "i")).toBe("1");
	});

	it("applies font size", () => {
		const input = wrapSlide(shape("section-title-text-box", "Text"));
		const result = replaceTextInSlide(input, "section-title-text-box", "Size", { fontSize: 1800 });
		expect(getStyleAttr(result, "section-title-text-box", "sz")).toBe("1800");
	});

	it("applies underline style", () => {
		const input = wrapSlide(shape("section-title-text-box", "Text"));
		const result = replaceTextInSlide(input, "section-title-text-box", "Underline", { underline: true });
		expect(getStyleAttr(result, "section-title-text-box", "u")).toBe("sng");
	});

	it("applies strikethrough style", () => {
		const input = wrapSlide(shape("section-title-text-box", "Text"));
		const result = replaceTextInSlide(input, "section-title-text-box", "Strike", { strikethrough: true });
		expect(getStyleAttr(result, "section-title-text-box", "strike")).toBe("sngStrike");
	});

	it("applies color", () => {
		const input = wrapSlide(shape("section-title-text-box", "Text"));
		const result = replaceTextInSlide(input, "section-title-text-box", "Colored", { color: "FF0000" });
		expect(getStyleAttr(result, "section-title-text-box", "color")).toBe("FF0000");
	});

	it("updates all shapes with the same key", () => {
		const input = wrapSlide(
			shape("same-key", "First") + shape("same-key", "Second")
		);
		const result = replaceTextInSlide(input, "same-key", "Updated");
		expect(getTextInShape(result, "same-key")).toBe("Updated");
	});

	it("does not modify other shapes", () => {
		const input = wrapSlide(
			shape("section-title-text-box", "Title") +
			shape("section-subtitle-text-box", "Subtitle")
		);
		const result = replaceTextInSlide(input, "section-title-text-box", "New Title");
		expect(getTextInShape(result, "section-subtitle-text-box")).toBe("Subtitle");
	});

	it("preserves existing style attributes when no styles provided", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title", "b=\"1\" sz=\"2400\""));
		const result = replaceTextInSlide(input, "section-title-text-box", "New");
		expect(getStyleAttr(result, "section-title-text-box", "b")).toBe("1");
		expect(getStyleAttr(result, "section-title-text-box", "sz")).toBe("2400");
	});

	it("returns valid XML after replacement", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = replaceTextInSlide(input, "section-title-text-box", "Valid XML");
		const doc = parseXml(result);
		expect(doc.getElementsByTagName("parsererror").length).toBe(0);
	});

	it("does not crash on malformed XML: returns input unchanged", () => {
		const result = replaceTextInSlide("not xml", "key", "new");
		expect(result).toBe("not xml");
	});

	it("handles shape with no txBody (no crash)", () => {
		const noTxBodyShape = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="no-txbody-shape"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="685800"/></a:xfrm>
  </p:spPr>
</p:sp>`;
		const input = wrapSlide(noTxBodyShape);
		const result = replaceTextInSlide(input, "no-txbody-shape", "New");
		expect(result).toContain("no-txbody-shape");
	});

	it("applies styles when no existing rPr element exists", () => {
		const noRPrShape = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="no-rpr-shape"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="685800"/></a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:bodyPr/>
    <a:p>
      <a:r>
        <a:t>Text</a:t>
      </a:r>
    </a:p>
  </p:txBody>
</p:sp>`;
		const input = wrapSlide(noRPrShape);
		const result = replaceTextInSlide(input, "no-rpr-shape", "Styled", { bold: true });
		expect(getStyleAttr(result, "no-rpr-shape", "b")).toBe("1");
	});

	it("does not modify input when no shapes found", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = replaceTextInSlide(input, "nonexistent-key", "New");
		expect(result).toBe(serializeXml(parseXml(input)!));
	});

	it("collapses multiple a:r runs into one during replacement", () => {
		const multiRunShape = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="multi-run-key"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="685800"/></a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:bodyPr/>
    <a:p>
      <a:r><a:rPr/><a:t>Hello</a:t></a:r>
      <a:r><a:rPr/><a:t> </a:t></a:r>
      <a:r><a:rPr/><a:t>World</a:t></a:r>
    </a:p>
  </p:txBody>
</p:sp>`;
		const input = wrapSlide(multiRunShape);
		const result = replaceTextInSlide(input, "multi-run-key", "Collapsed Text");
		const doc = parseXml(result);
		const sp = findSpByKey(doc, "multi-run-key");
		const aRs = sp!.getElementsByTagNameNS(NS_A, "r");
		expect(aRs.length).toBe(1);
		expect(getTextInShape(result, "multi-run-key")).toBe("Collapsed Text");
	});

	it("creates a:t element when shape has a:r but no a:t", () => {
		const noATShape = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="no-at-shape"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="685800"/></a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:bodyPr/>
    <a:p>
      <a:r>
        <a:rPr/>
      </a:r>
    </a:p>
  </p:txBody>
</p:sp>`;
		const input = wrapSlide(noATShape);
		const result = replaceTextInSlide(input, "no-at-shape", "Created Text");
		expect(getTextInShape(result, "no-at-shape")).toBe("Created Text");
	});

	it("handles multiple runs with no a:t in any of them (collapse skips silently)", () => {
		const multiRunNoAT = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="multi-run-no-at"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="685800"/></a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:bodyPr/>
    <a:p>
      <a:r><a:rPr/></a:r>
      <a:r><a:rPr/></a:r>
    </a:p>
  </p:txBody>
</p:sp>`;
		const input = wrapSlide(multiRunNoAT);
		expect(() => replaceTextInSlide(input, "multi-run-no-at", "New Text")).not.toThrow();
	});

	it("handles shape with a:p but no a:r elements (silently skips)", () => {
		const noARShape = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="no-ar-shape"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="685800"/></a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:bodyPr/>
    <a:p/>
  </p:txBody>
</p:sp>`;
		const input = wrapSlide(noARShape);
		const result = replaceTextInSlide(input, "no-ar-shape", "New");
		const doc = new DOMParser().parseFromString(result, "text/xml");
		const sp = findSpByKey(doc, "no-ar-shape");
		const aTs = sp!.getElementsByTagNameNS(NS_A, "t");
		expect(aTs.length).toBe(0);
	});

	it("applies styles when no a:rPr exists and no a:r elements exist (silently skips style)", () => {
		const noRPrNoRShape = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="no-rpr-nor-shape"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="685800"/></a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:bodyPr/>
    <a:p/>
  </p:txBody>
</p:sp>`;
		const input = wrapSlide(noRPrNoRShape);
		const result = replaceTextInSlide(input, "no-rpr-nor-shape", "Text", { bold: true });
		expect(result).toContain("no-rpr-nor-shape");
	});

	it("handles self-closing a:t element with null textContent during collapse", () => {
		const selfClosingAT = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="self-closing-at"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="685800"/></a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:bodyPr/>
    <a:p>
      <a:r><a:t/></a:r>
      <a:r><a:t>World</a:t></a:r>
    </a:p>
  </p:txBody>
</p:sp>`;
		const input = wrapSlide(selfClosingAT);
		const result = replaceTextInSlide(input, "self-closing-at", "Replaced");
		expect(result).toContain("Replaced");
	});

	it("handles txBody with no a:t and no a:p (empty txBody)", () => {
		const emptyTxBody = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="empty-txbody"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="685800"/></a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:bodyPr/>
  </p:txBody>
</p:sp>`;
		const input = wrapSlide(emptyTxBody);
		const result = replaceTextInSlide(input, "empty-txbody", "New");
		expect(result).toContain("empty-txbody");
	});

	it("sets underline to none when underline is false", () => {
		const input = wrapSlide(shape("section-title-text-box", "Text", "u=\"sng\""));
		const result = replaceTextInSlide(input, "section-title-text-box", "No Underline", { underline: false });
		expect(getStyleAttr(result, "section-title-text-box", "u")).toBe("none");
	});

	it("sets strikethrough to noStrike when strikethrough is false", () => {
		const input = wrapSlide(shape("section-title-text-box", "Text", "strike=\"sngStrike\""));
		const result = replaceTextInSlide(input, "section-title-text-box", "No Strike", { strikethrough: false });
		expect(getStyleAttr(result, "section-title-text-box", "strike")).toBe("noStrike");
	});

	it("sets italic to 0 when italic is false", () => {
		const input = wrapSlide(shape("section-title-text-box", "Text", "i=\"1\""));
		const result = replaceTextInSlide(input, "section-title-text-box", "No Italic", { italic: false });
		expect(getStyleAttr(result, "section-title-text-box", "i")).toBe("0");
	});
});
