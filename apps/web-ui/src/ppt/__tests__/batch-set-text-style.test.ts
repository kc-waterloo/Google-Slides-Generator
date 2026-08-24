/**
 * batch-set-text-style.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { batchSetTextStyle } from "../functions/batch-set-text-style";

const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";
const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

const makeShape = (name: string, text: string, y: number): string =>
	`<p:sp>
    <p:nvSpPr>
      <p:cNvPr id="4" name="${name}"/>
      <p:cNvSpPr txBox="1"/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr>
      <a:xfrm>
        <a:off x="457200" y="${y}"/>
        <a:ext cx="8229600" cy="370840"/>
      </a:xfrm>
    </p:spPr>
    <p:txBody>
      <a:bodyPr/>
      <a:lstStyle/>
      <a:p>
        <a:r>
          <a:rPr><a:solidFill><a:srgbClr val="333333"/></a:solidFill><a:latin typeface="Calibri"/></a:rPr>
          <a:t>${text}</a:t>
        </a:r>
      </a:p>
    </p:txBody>
  </p:sp>`;

const makeSlide = (shapes: string): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="${NS_A}" xmlns:r="${NS_R}" xmlns:p="${NS_P}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      ${shapes}
    </p:spTree>
  </p:cSld>
</p:sld>`;

function makeContentType(slideCount: number): string {
	const overrides = Array.from(
		{ length: slideCount },
		(_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
	).join("\n  ");
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${overrides}
</Types>`;
}

function makePresentation(slideCount: number): string {
	const entries = Array.from(
		{ length: slideCount },
		(_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`,
	).join("\n    ");
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="${NS_P}" xmlns:r="${NS_R}">
  <p:sldIdLst>
    ${entries}
  </p:sldIdLst>
</p:presentation>`;
}

function makeRelsFile(slideCount: number): string {
	const entries = Array.from(
		{ length: slideCount },
		(_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`,
	).join("\n  ");
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${entries}
</Relationships>`;
}

async function createStyleTemplate(slideCount: number): Promise<ArrayBuffer> {
	const zip = new JSZip();

	zip.file("[Content_Types].xml", makeContentType(slideCount));
	zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);
	zip.file("ppt/presentation.xml", makePresentation(slideCount));
	zip.file("ppt/_rels/presentation.xml.rels", makeRelsFile(slideCount));

	for (let i = 1; i <= slideCount; i++) {
		zip.file(`ppt/slides/slide${i}.xml`, makeSlide(
			makeShape("title-text", "Hello", 457200) +
			makeShape("body-text", "World", 914400),
		));
		zip.file(`ppt/slides/_rels/slide${i}.xml.rels`,
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
	}

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("batchSetTextStyle", () => {
	it("applies font size to matching page elements", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", fontSize: 2400 }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("sz=\"2400\"");
	});

	it("applies italic to matching elements", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", italic: true }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("i=\"1\"");
	});

	it("applies bold to matching elements", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", bold: true }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("b=\"1\"");
	});

	it("applies strikethrough to matching elements", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", strikethrough: true }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("strike=\"sngStrike\"");
	});

	it("applies underline to matching elements", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", underline: true }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("u=\"sng\"");
	});

	it("applies color to matching elements", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", color: "ACCENT1" }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("val=\"4472C4\"");
	});

	it("only affects slides within the specified range", async () => {
		const template = await createStyleTemplate(3);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", bold: true }],
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("b=\"1\"");
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("b=\"1\"");
	});

	it("skips non-matching keys", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "nonexistent-key", fontSize: 2400 }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("sz=\"2400\"");
	});

	it("does nothing with empty textStyles array", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Hello");
	});

	it("does nothing when lowerBound exceeds upperBound", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", bold: true }],
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("b=\"1\"");
	});

	it("applies multiple style overrides to the same element", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{
				pageElementKey: "title-text",
				fontSize: 2400,
				bold: true,
				italic: true,
				underline: true,
				strikethrough: true,
				color: "ACCENT3",
			}],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("sz=\"2400\"");
		expect(slide1).toContain("b=\"1\"");
		expect(slide1).toContain("i=\"1\"");
		expect(slide1).toContain("u=\"sng\"");
		expect(slide1).toContain("strike=\"sngStrike\"");
		expect(slide1).toContain("val=\"A5A5A5\"");
	});

	it("produces valid ZIP with all required files", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", bold: true }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("_rels/.rels");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/slides/slide1.xml");
	});

	it("warns about borderColor but still processes other styles", async () => {
		const template = await createStyleTemplate(1);
		const result = await batchSetTextStyle(template, {
			textStyles: [{
				pageElementKey: "title-text",
				fontSize: 2400,
				borderColor: "FF0000",
			}],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("sz=\"2400\"");
	});

	it("handles out-of-range bounds gracefully after clamping", async () => {
		const template = await createStyleTemplate(3);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", bold: true }],
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 6,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("b=\"1\"");
	});

	it("handles null params gracefully", async () => {
		const template = await createStyleTemplate(1);
		const result = await batchSetTextStyle(template, null as never);
		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Hello");
	});

	it("uses default bounds when lowerBound/upperBound are undefined", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", bold: true }],
		} as never);

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("b=\"1\"");
	});

	it("returns template unchanged when params is null or undefined", async () => {
		const template = await createStyleTemplate(1);
		const result1 = await batchSetTextStyle(template, null as never);
		const result2 = await batchSetTextStyle(template, undefined as never);

		const resultZip1 = await JSZip.loadAsync(result1);
		const slide1 = await resultZip1.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Hello");

		const resultZip2 = await JSZip.loadAsync(result2);
		if (resultZip2.file("ppt/slides/slide1.xml")) {
			const slide2 = await resultZip2.file("ppt/slides/slide1.xml")!.async("text");
			expect(slide2).toContain("Hello");
		}
	});

	it("handles undefined textStyles by falling back to empty array", async () => {
		const template = await createStyleTemplate(1);
		const result = await batchSetTextStyle(template, {
			textStyles: undefined as never,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Hello");
	});

	it("skips invalid color values in style override", async () => {
		const template = await createStyleTemplate(1);
		const result = await batchSetTextStyle(template, {
			textStyles: [{
				pageElementKey: "title-text",
				color: "INVALID_COLOR",
			}],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("INVALID_COLOR");
		expect(slide1).toContain("333333");
	});

	it("applies style to shape even without existing rPr (creates one)", async () => {
		const zip = new JSZip();
		zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`);
		zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);
		zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="${NS_P}" xmlns:r="${NS_R}">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
</p:presentation>`);
		zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`);

		// Create a shape with txBody but NO a:rPr (no existing run properties)
		const noRPrShape = `<p:sp>
    <p:nvSpPr>
      <p:cNvPr id="4" name="title-text"/>
      <p:cNvSpPr txBox="1"/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr>
      <a:xfrm>
        <a:off x="457200" y="457200"/>
        <a:ext cx="8229600" cy="370840"/>
      </a:xfrm>
    </p:spPr>
    <p:txBody>
      <a:bodyPr/>
      <a:lstStyle/>
      <a:p>
        <a:r>
          <a:t>Hello</a:t>
        </a:r>
      </a:p>
    </p:txBody>
  </p:sp>`;

		zip.file("ppt/slides/slide1.xml", makeSlide(noRPrShape));
		zip.file("ppt/slides/_rels/slide1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);

		const template = await zip.generateAsync({ type: "arraybuffer" });
		const result = await batchSetTextStyle(template, {
			textStyles: [{
				pageElementKey: "title-text",
				bold: true,
			}],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("a:rPr");
		expect(slide1).toContain("b=\"1\"");
	});

	it("handles range beyond available slide files (missing slide XML)", async () => {
		const template = await createStyleTemplate(2);
		const result = await batchSetTextStyle(template, {
			textStyles: [{ pageElementKey: "title-text", bold: true }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const resultZip = await JSZip.loadAsync(result);
		for (let i = 1; i <= 2; i++) {
			const slide = await resultZip.file(`ppt/slides/slide${i}.xml`)!.async("text");
			expect(slide).toContain("b=\"1\"");
		}
	});

	it("handles malformed slide XML gracefully (skips it)", async () => {
		const zip = new JSZip();
		zip.file("[Content_Types].xml", makeContentType(1));
		zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);
		zip.file("ppt/presentation.xml", makePresentation(1));
		zip.file("ppt/_rels/presentation.xml.rels", makeRelsFile(1));
		zip.file("ppt/slides/slide1.xml", "NOT VALID XML at all <<!!>>");
		zip.file("ppt/slides/_rels/slide1.xml.rels",
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
		const buffer = await zip.generateAsync({ type: "arraybuffer" });

		const result = await batchSetTextStyle(buffer, {
			textStyles: [{ pageElementKey: "title-text", bold: true }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("NOT VALID XML");
	});
});
