/**
 * create-highlight-variation-slides.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { createHighlightVariationSlides } from "../functions/create-highlight-variation-slides";

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

const makeRels = (): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`;

async function createHighlightTemplate(n: number): Promise<ArrayBuffer> {
	const zip = new JSZip();

	const slideCount = n + 1;

	const contentTypeOverrides = Array.from(
		{ length: slideCount },
		(_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
	).join("\n  ");

	zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${contentTypeOverrides}
</Types>`);

	zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

	const sldIdEntries = Array.from(
		{ length: slideCount },
		(_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`,
	).join("\n    ");

	zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="${NS_P}" xmlns:r="${NS_R}">
  <p:sldIdLst>
    ${sldIdEntries}
  </p:sldIdLst>
</p:presentation>`);

	const relsEntries = Array.from(
		{ length: slideCount },
		(_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`,
	).join("\n  ");

	zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${relsEntries}
</Relationships>`);

	// Slide 1: highlight template
	const highlightShapes: string[] = [];
	for (let i = 1; i <= n; i++) {
		highlightShapes.push(makeShape(`point-${i}-of-${n}-text-box`, `Point ${i}`, 457200 * i));
		highlightShapes.push(makeShape(`point-${i}-of-${n}-number-indicator-text-box`, `${i}/${n}`, 457200 * i + 100000));
	}
	zip.file("ppt/slides/slide1.xml", makeSlide(highlightShapes.join("")));

	// Remaining slides: other (must use unique keys)
	for (let i = 2; i <= slideCount; i++) {
		zip.file(`ppt/slides/slide${i}.xml`, makeSlide(
			makeShape(`other-unique-key-${i}`, "Other", 457200),
		));
		zip.file(`ppt/slides/_rels/slide${i}.xml.rels`, makeRels());
	}

	zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("createHighlightVariationSlides", () => {
	it("creates N+2 new slides for N=2", async () => {
		const template = await createHighlightTemplate(2);
		const result = await createHighlightVariationSlides(template, {});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// 3 original + 4 new (N+2 = 4) = 7
		expect(slideFiles).toHaveLength(7);
	});

	it("creates N+2 new slides for N=3", async () => {
		const template = await createHighlightTemplate(3);
		const result = await createHighlightVariationSlides(template, {});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// 4 original + 5 new (N+2 = 5) = 9
		expect(slideFiles).toHaveLength(9);
	});

	it("returns template unchanged when no highlight slide found", async () => {
		const template = await createHighlightTemplate(2);

		const result = await createHighlightVariationSlides(template, {
			inputSlideNumber: 99,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);
	});

	it("returns template unchanged when template lacks highlight keys", async () => {
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
		zip.file("ppt/slides/slide1.xml", makeSlide(
			makeShape("quote-text-box", "No highlight keys", 457200),
		));
		zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());
		const noMatchTemplate = await zip.generateAsync({ type: "arraybuffer" });

		const result = await createHighlightVariationSlides(noMatchTemplate, {});
		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(1);
	});

	it("preserves original slides unchanged", async () => {
		const template = await createHighlightTemplate(2);
		const result = await createHighlightVariationSlides(template, {});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Point 1");
		expect(slide1).toContain("1/2");
	});

	it("produces valid ZIP with all required files", async () => {
		const template = await createHighlightTemplate(2);
		const result = await createHighlightVariationSlides(template, {});

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("_rels/.rels");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/_rels/presentation.xml.rels");
	});

	it("applies highlight color and dimmed color correctly", async () => {
		const template = await createHighlightTemplate(2);
		const result = await createHighlightVariationSlides(template, {
			highlightColor: "ACCENT1",
			dimmedColor: "ACCENT3",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		// First variation (i=0): all dimmed
		expect(slide4).toContain("val=\"A5A5A5\"");

		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		// Second variation (i=1): point 1 highlighted, point 2 dimmed
		expect(slide5).toContain("val=\"4472C4\"");
		expect(slide5).toContain("val=\"A5A5A5\"");

		const slide7 = await resultZip.file("ppt/slides/slide7.xml")!.async("text");
		// Last variation (i=3, isLastSlide): all highlighted
		expect(slide7).toContain("val=\"4472C4\"");
		expect(slide7).not.toContain("val=\"A5A5A5\"");
	});

	it("applies highlight bold (default true) and dimmed bold (default false)", async () => {
		const template = await createHighlightTemplate(2);
		const result = await createHighlightVariationSlides(template, {});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		// All dimmed: all points have b="0"
		expect(slide4).toContain("b=\"0\"");

		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		// point 1 highlighted (b="1"), point 2 dimmed (b="0")
		expect(slide5.match(/b="1"/g)?.length).toBeGreaterThanOrEqual(1);
		expect(slide5.match(/b="0"/g)?.length).toBeGreaterThanOrEqual(1);

		const slide7 = await resultZip.file("ppt/slides/slide7.xml")!.async("text");
		// All highlighted: all points have b="1"
		expect(slide7).toContain("b=\"1\"");
		expect(slide7).not.toContain("b=\"0\"");
	});

	it("applies highlight italic override", async () => {
		const template = await createHighlightTemplate(2);
		const result = await createHighlightVariationSlides(template, {
			highlightItalic: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("i=\"1\"");
	});

	it("does not change text content in variation slides", async () => {
		const template = await createHighlightTemplate(2);
		const result = await createHighlightVariationSlides(template, {});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		// Text content should be preserved from template
		expect(slide5).toContain("Point 1");
		expect(slide5).toContain("Point 2");
		expect(slide5).toContain("1/2");
		expect(slide5).toContain("2/2");
	});

	it("applies all highlight style overrides simultaneously", async () => {
		const template = await createHighlightTemplate(2);
		const result = await createHighlightVariationSlides(template, {
			highlightFontSize: 2400,
			highlightItalic: true,
			highlightUnderline: true,
			highlightStrikethrough: true,
			highlightColor: "ACCENT5",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("sz=\"2400\"");
		expect(slide5).toContain("i=\"1\"");
		expect(slide5).toContain("u=\"sng\"");
		expect(slide5).toContain("strike=\"sngStrike\"");
		expect(slide5).toContain("val=\"5B9BD5\"");
	});

	it("applies dimmed style overrides", async () => {
		const template = await createHighlightTemplate(3);
		const result = await createHighlightVariationSlides(template, {
			dimmedFontSize: 1400,
			dimmedItalic: true,
			dimmedUnderline: true,
			dimmedColor: "ACCENT6",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("sz=\"1400\"");
		expect(slide5).toContain("i=\"1\"");
		expect(slide5).toContain("u=\"sng\"");
		expect(slide5).toContain("val=\"70AD47\"");
	});

	it("uses explicit inputSlideNumber to find highlight slide", async () => {
		const template = await createHighlightTemplate(2);
		const result = await createHighlightVariationSlides(template, {
			inputSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(7);
	});

	it("explicit inputSlideNumber on slide without highlight keys returns template unchanged", async () => {
		const template = await createHighlightTemplate(2);

		const result = await createHighlightVariationSlides(template, {
			inputSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);
	});

	it("covers n > 0 false branch with zero-indexed key pattern", async () => {
		const { default: JSZip } = await import("jszip");

		const zip = new JSZip();
		zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="...presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="...presentationml.slide+xml"/>
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

		// Keys with point-0-of-3 — n=0 fails n>0 check, but overall pointCount=3
		// from point-1-of-3 key's n=3
		const zeroIdxShapes = [
			makeShape("point-0-of-3-text-box", "Point 0", 457200),
			makeShape("point-0-of-3-number-indicator-text-box", "0/3", 914400),
			makeShape("point-1-of-3-text-box", "Point 1", 1371600),
			makeShape("point-1-of-3-number-indicator-text-box", "1/3", 1828800),
		];
		zip.file("ppt/slides/slide1.xml", makeSlide(zeroIdxShapes.join("")));
		zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());

		const tpl = await zip.generateAsync({ type: "arraybuffer" });
		const result = await createHighlightVariationSlides(tpl, {});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// pointCount=3 → 1 original + 5 new = 6 total
		expect(slideFiles).toHaveLength(6);
	});
});
