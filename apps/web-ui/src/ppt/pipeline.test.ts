/**
 * pipeline.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";

async function createTwoSlidePptx(): Promise<ArrayBuffer> {
	const zip = new JSZip();

	zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`);

	zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

	zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
    <p:sldId id="257" r:id="rId2"/>
  </p:sldIdLst>
</p:presentation>`);

	zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
</Relationships>`);

	const makeSlide = (name: string, text: string): string =>
		`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="${name}"/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
        <p:txBody><a:bodyPr/><a:p><a:r><a:rPr/><a:t>${text}</a:t></a:r></a:p></p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

	zip.file("ppt/slides/slide1.xml", makeSlide("section-title-text-box", "Title Placeholder"));
	zip.file("ppt/slides/slide2.xml", makeSlide("quote-text-box", "Quote Placeholder"));
	zip.file("ppt/slides/_rels/slide1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
	zip.file("ppt/slides/_rels/slide2.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);

	return zip.generateAsync({ type: "arraybuffer" });
}

async function createDuplicateKeyPptx(): Promise<ArrayBuffer> {
	const zip = new JSZip();

	zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`);

	zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

	zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
    <p:sldId id="257" r:id="rId2"/>
  </p:sldIdLst>
</p:presentation>`);

	zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
</Relationships>`);

	const makeSlide = (name: string, text: string): string =>
		`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="${name}"/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
        <p:txBody><a:bodyPr/><a:p><a:r><a:rPr/><a:t>${text}</a:t></a:r></a:p></p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

	zip.file("ppt/slides/slide1.xml", makeSlide("shared-key", "Slide 1 Content"));
	zip.file("ppt/slides/slide2.xml", makeSlide("shared-key", "Slide 2 Content"));
	zip.file("ppt/slides/_rels/slide1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
	zip.file("ppt/slides/_rels/slide2.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);

	return zip.generateAsync({ type: "arraybuffer" });
}

import { generateSlidesFromTemplate } from "./pipeline";

describe("generateSlidesFromTemplate", () => {
	it("produces a valid ZIP with correct slide count", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "quote-text-box": "New Quote" },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);
	});

	it("replaces text in the cloned slide", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "quote-text-box": "Hello World" },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Hello World");
	});

	it("applies text styles in cloned slide", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "quote-text-box": "Styled" },
				styleOverrides: { "quote-text-box": { bold: true, italic: true } },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("b=\"1\"");
		expect(slide3).toContain("i=\"1\"");
	});

	it("preserves original slides unchanged", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "quote-text-box": "New" },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Title Placeholder");
	});

	it("handles multiple operations", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "section-title-text-box",
				textReplacements: { "section-title-text-box": "Title" },
			},
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "quote-text-box": "Quote" },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(4);

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Title");

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Quote");
	});

	it("handles empty operation list: returns template unchanged", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, []);

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("handles template source key not found in template", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "nonexistent-key",
				textReplacements: {},
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("produces valid ZIP that can be parsed by JSZip", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "quote-text-box": "Valid Output" },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("_rels/.rels");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/_rels/presentation.xml.rels");
	});

	it("applies style-only overrides (key not in textReplacements)", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "quote-text-box",
				textReplacements: {},
				styleOverrides: { "quote-text-box": { bold: true } },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("b=\"1\"");
	});

	it("returns template unchanged when keys match no shapes (clone returns shell)", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "nonexistent-key": "text" },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("processes mixed found and not-found operations", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "nonexistent-key",
				textReplacements: {},
			},
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "quote-text-box": "After skip" },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("After skip");
	});

	it("uses first slide when two slides share a key name", async () => {
		const template = await createDuplicateKeyPptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "shared-key",
				textReplacements: { "shared-key": "New Text" },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slideCount = Object.keys(resultZip.files).filter(
			(k) => k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		).length;
		expect(slideCount).toBe(3);

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("shared-key");
		expect(slide3).toContain("New Text");
	});

	it("returns template unchanged when all operations match no keys", async () => {
		const template = await createTwoSlidePptx();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "section-title-text-box",
				textReplacements: { "nonexistent-key": "value" },
			},
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "another-nonexistent-key": "other" },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});
});
