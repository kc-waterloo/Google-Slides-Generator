/**
 * style-applier.test.ts
 *
 * Created by Min-Kyu Lee on 30-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { applyTextStylesToSlide } from "../style-applier";

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

const shape = (name: string, text: string, extraRPr = ""): string =>
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
        <a:rPr ${extraRPr}><a:solidFill><a:srgbClr val="333333"/></a:solidFill><a:latin typeface="Calibri"/></a:rPr>
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

describe("applyTextStylesToSlide", () => {
	it("sets bold attribute", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { bold: true });
		expect(getStyleAttr(result, "section-title-text-box", "b")).toBe("1");
	});

	it("sets italic attribute", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { italic: true });
		expect(getStyleAttr(result, "section-title-text-box", "i")).toBe("1");
	});

	it("sets underline attribute", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { underline: true });
		expect(getStyleAttr(result, "section-title-text-box", "u")).toBe("sng");
	});

	it("sets strikethrough attribute", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { strikethrough: true });
		expect(getStyleAttr(result, "section-title-text-box", "strike")).toBe("sngStrike");
	});

	it("sets font size attribute", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { fontSize: 2000 });
		expect(getStyleAttr(result, "section-title-text-box", "sz")).toBe("2000");
	});

	it("sets color via srgbClr", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { color: "FF0000" });
		expect(getStyleAttr(result, "section-title-text-box", "color")).toBe("FF0000");
	});

	it("removes bold when set to false", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title", "b=\"1\""));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { bold: false });
		expect(getStyleAttr(result, "section-title-text-box", "b")).toBe("0");
	});

	it("does not modify text content", () => {
		const input = wrapSlide(shape("section-title-text-box", "Original Text"));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { bold: true });
		const doc = parseXml(result);
		const sp = findSpByKey(doc, "section-title-text-box");
		const aT = sp!.getElementsByTagNameNS(NS_A, "t")[0]!;
		expect(aT.textContent).toBe("Original Text");
	});

	it("does nothing when element key is not found", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = applyTextStylesToSlide(input, "nonexistent", { bold: true });
		const doc = parseXml(result);
		const sp = findSpByKey(doc, "section-title-text-box");
		const rPrs = sp!.getElementsByTagNameNS(NS_A, "rPr");
		expect(rPrs[0]!.getAttribute("b")).toBeNull();
	});

	it("returns valid XML", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { bold: true });
		const doc = parseXml(result);
		expect(doc.getElementsByTagName("parsererror").length).toBe(0);
	});

	it("does not crash on malformed XML: returns input unchanged", () => {
		const result = applyTextStylesToSlide("not xml", "key", { bold: true });
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
		const result = applyTextStylesToSlide(input, "no-txbody-shape", { bold: true });
		expect(result).toContain("no-txbody-shape");
	});

	it("returns XML unchanged when element key is not found", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title"));
		const result = applyTextStylesToSlide(input, "nonexistent", { bold: true });
		expect(result).toBe(serializeXml(parseXml(input)!));
	});

	it("handles shape with txBody but no rPr or a:r elements", () => {
		const emptyTxBodyShape = `<p:sp>
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
		const input = wrapSlide(emptyTxBodyShape);
		const result = applyTextStylesToSlide(input, "empty-txbody", { bold: true });
		expect(result).toContain("empty-txbody");
	});

	it("creates solidFill when rPr exists but has no solidFill child", () => {
		const noSolidFillShape = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="no-solidfill-shape"/>
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
        <a:rPr><a:latin typeface="Calibri"/></a:rPr>
        <a:t>Text</a:t>
      </a:r>
    </a:p>
  </p:txBody>
</p:sp>`;
		const input = wrapSlide(noSolidFillShape);
		const result = applyTextStylesToSlide(input, "no-solidfill-shape", { color: "FF0000" });
		const doc = new DOMParser().parseFromString(result, "text/xml");
		const sp = findSpByKey(doc, "no-solidfill-shape");
		const rPrs = sp!.getElementsByTagNameNS(NS_A, "rPr");
		const srgbClrs = rPrs[0]!.getElementsByTagNameNS(NS_A, "srgbClr");
		expect(srgbClrs.length).toBeGreaterThanOrEqual(1);
		expect(srgbClrs[0]!.getAttribute("val")).toBe("FF0000");
	});

	it("sets italic to 0 when italic is false", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title", "i=\"1\""));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { italic: false });
		expect(getStyleAttr(result, "section-title-text-box", "i")).toBe("0");
	});

	it("sets underline to none when underline is false", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title", "u=\"sng\""));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { underline: false });
		expect(getStyleAttr(result, "section-title-text-box", "u")).toBe("none");
	});

	it("sets strikethrough to noStrike when strikethrough is false", () => {
		const input = wrapSlide(shape("section-title-text-box", "Title", "strike=\"sngStrike\""));
		const result = applyTextStylesToSlide(input, "section-title-text-box", { strikethrough: false });
		expect(getStyleAttr(result, "section-title-text-box", "strike")).toBe("noStrike");
	});

	it("creates srgbClr when solidFill exists but has no srgbClr child", () => {
		const noSrgbClrShape = `<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="no-srgbclr-shape"/>
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
        <a:rPr><a:solidFill/><a:latin typeface="Calibri"/></a:rPr>
        <a:t>Text</a:t>
      </a:r>
    </a:p>
  </p:txBody>
</p:sp>`;
		const input = wrapSlide(noSrgbClrShape);
		const result = applyTextStylesToSlide(input, "no-srgbclr-shape", { color: "00FF00" });
		const doc = new DOMParser().parseFromString(result, "text/xml");
		const sp = findSpByKey(doc, "no-srgbclr-shape");
		const rPrs = sp!.getElementsByTagNameNS(NS_A, "rPr");
		const srgbClrs = rPrs[0]!.getElementsByTagNameNS(NS_A, "srgbClr");
		expect(srgbClrs.length).toBeGreaterThanOrEqual(1);
		expect(srgbClrs[0]!.getAttribute("val")).toBe("00FF00");
	});
});
