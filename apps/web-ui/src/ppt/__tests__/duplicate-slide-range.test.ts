/**
 * duplicate-slide-range.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { duplicateSlideRange, type DuplicateSlideRangeParams } from "../functions/duplicate-slide-range";

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

const makeContentType = (slideCount: number): string => {
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
};

const makePresentation = (slideCount: number): string => {
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
};

const makeRelsFile = (slideCount: number): string => {
	const entries = Array.from(
		{ length: slideCount },
		(_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`,
	).join("\n  ");
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${entries}
</Relationships>`;
};

async function createDuplicateTemplate(slideCount: number): Promise<ArrayBuffer> {
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
			makeShape("text-box", `Slide ${i} content`, 457200),
		));
		zip.file(`ppt/slides/_rels/slide${i}.xml.rels`,
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
	}

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("duplicateSlideRange", () => {
	it("duplicates a range of slides", async () => {
		const template = await createDuplicateTemplate(3);
		const result = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 2,
			insertionSlideNumber: 4,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(4);
	});

	it("duplicates multiple slides", async () => {
		const template = await createDuplicateTemplate(3);
		const result = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(5);
	});

	it("does nothing when lowerBound exceeds upperBound", async () => {
		const template = await createDuplicateTemplate(3);
		const result = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);
	});

	it("handles range extending beyond available slides", async () => {
		const template = await createDuplicateTemplate(2);
		const result = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 100,
			insertionSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(4);
	});

	it("preserves original slide content", async () => {
		const template = await createDuplicateTemplate(3);
		const result = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 2,
			insertionSlideNumber: 4,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Slide 1 content");

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Slide 2 content");
	});

	it("handles source slide with no rels file while other slides have rels", async () => {
		const template = await createDuplicateTemplate(3);
		const zip = await JSZip.loadAsync(template);
		zip.remove("ppt/slides/_rels/slide2.xml.rels");
		const buffer = await zip.generateAsync({ type: "arraybuffer" });

		const result = await duplicateSlideRange(buffer, {
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(5);
	});

	it("produces valid ZIP with all required files", async () => {
		const template = await createDuplicateTemplate(2);
		const result = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
			insertionSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("_rels/.rels");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/_rels/presentation.xml.rels");
		expect(fileList).toContain("ppt/slides/slide1.xml");
		expect(fileList).toContain("ppt/slides/slide3.xml");
	});

	it("registers duplicated slides in presentation.xml", async () => {
		const template = await createDuplicateTemplate(3);
		const result = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		expect(presXml.match(/<p:sldId[ >]/g)?.length).toBe(5);
	});

	it("registers duplicated slides in presentation.xml.rels", async () => {
		const template = await createDuplicateTemplate(3);
		const result = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 2,
			insertionSlideNumber: 4,
		});

		const resultZip = await JSZip.loadAsync(result);
		const relsXml = await resultZip.file("ppt/_rels/presentation.xml.rels")!.async("text");
		expect(relsXml.match(/<Relationship[ >]/g)?.length).toBe(4);
	});

	it("registers duplicated slides in Content_Types.xml", async () => {
		const template = await createDuplicateTemplate(3);
		const result = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
		});

		const resultZip = await JSZip.loadAsync(result);
		const ctXml = await resultZip.file("[Content_Types].xml")!.async("text");
		expect(ctXml.match(/slide\d+\.xml/g)?.length).toBe(5);
	});

	it("returns template unchanged when clamp removes all slides (range beyond count)", async () => {
		const template = await createDuplicateTemplate(3);
		const result = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 6,
			insertionSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);
	});

	it("returns template unchanged when params is null or undefined", async () => {
		const template = await createDuplicateTemplate(1);
		const result1 = await duplicateSlideRange(template, null as never);
		const resultZip1 = await JSZip.loadAsync(result1);
		const slideFiles1 = Object.keys(resultZip1.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles1).toHaveLength(1);

		const result2 = await duplicateSlideRange(template, undefined as never);
		const resultZip2 = await JSZip.loadAsync(result2);
		const slideFiles2 = Object.keys(resultZip2.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles2).toHaveLength(1);
	});

	it("handles missing slide rels file in ZIP (relsFile missing)", async () => {
		const template = await createDuplicateTemplate(2);
		const zip = await JSZip.loadAsync(template);
		zip.file("ppt/slides/_rels/slide2.xml.rels", null as never);
		const buffer = await zip.generateAsync({ type: "arraybuffer" });

		const result = await duplicateSlideRange(buffer, {
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 2,
			insertionSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);
	});

	it("returns template unchanged when all slide files are missing from ZIP", async () => {
		const template = await createDuplicateTemplate(2);
		const zip = await JSZip.loadAsync(template);
		const slide1 = await zip.file("ppt/slides/slide1.xml")!.async("text");
		const slide2 = await zip.file("ppt/slides/slide2.xml")!.async("text");

		zip.remove("ppt/slides/slide1.xml");
		zip.remove("ppt/slides/slide2.xml");
		zip.file("ppt/slides/slide3.xml", slide1);
		zip.file("ppt/slides/slide4.xml", slide2);

		const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide3.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide4.xml"/>
</Relationships>`;
		zip.file("ppt/_rels/presentation.xml.rels", relsXml);

		const buffer = await zip.generateAsync({ type: "arraybuffer" });

		const result = await duplicateSlideRange(buffer, {
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
			insertionSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("uses defaults when lowerBoundSlideNumber and upperBoundSlideNumber are omitted", async () => {
		const template = await createDuplicateTemplate(3);
		const result = await duplicateSlideRange(template, {
			insertionSlideNumber: 1,
		} as DuplicateSlideRangeParams);

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(6);
	});
});
