/**
 * integration.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { loadTemplate } from "../template-loader";
import { createBulletSlide } from "../functions/create-bullet-slide";
import { createSummarySlide } from "../functions/create-summary-slide";
import { createShortQuotesSlides } from "../functions/create-short-quotes-slides";
import { createLongQuotesSlides } from "../functions/create-long-quotes-slides";
import { batchReplaceText } from "../functions/batch-replace-text";
import { batchSetTextStyle } from "../functions/batch-set-text-style";
import { moveSlides } from "../functions/move-slides";
import { setHeaders } from "../functions/set-headers";
import { generateSlidesFromTemplate } from "../pipeline";
import type { SlideOperation } from "../pipeline";

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

async function createMultiSlideTemplate(): Promise<ArrayBuffer> {
	const zip = new JSZip();

	zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide3.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`);

	zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

	zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="${NS_P}" xmlns:r="${NS_R}">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
    <p:sldId id="257" r:id="rId2"/>
    <p:sldId id="258" r:id="rId3"/>
  </p:sldIdLst>
</p:presentation>`);

	zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide3.xml"/>
</Relationships>`);

	// Slide 1: bullet template with title keys (for long quotes title detection)
	zip.file("ppt/slides/slide1.xml", makeSlide(
		makeShape("bullet-title-text-box", "Title", 457200) +
		makeShape("bullet-point-1-text", "Bullet 1", 1371600) +
		makeShape("bullet-point-2-text", "Bullet 2", 1946400) +
		makeShape("bullet-point-3-text", "Bullet 3", 2521200) +
		makeShape("section-title-text-box", "Section Title", 3048000) +
		makeShape("section-subtitle-text-box", "Section Subtitle", 3657600),
	));

	// Slide 2: summary template (with enough item slots)
	zip.file("ppt/slides/slide2.xml", makeSlide(
		makeShape("summary-title-text", "Summary", 457200) +
		makeShape("summary-item-1-text", "Item 1", 1371600) +
		makeShape("summary-item-2-text", "Item 2", 1946400) +
		makeShape("summary-item-3-text", "Item 3", 2521200),
	));

	// Slide 3: quote template (also serves as long-quotes content)
	zip.file("ppt/slides/slide3.xml", makeSlide(
		makeShape("quote-text-box", "Quote", 457200) +
		makeShape("addendum-text-box", "Addendum", 1828800),
	));

	zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());
	zip.file("ppt/slides/_rels/slide2.xml.rels", makeRels());
	zip.file("ppt/slides/_rels/slide3.xml.rels", makeRels());

	return zip.generateAsync({ type: "arraybuffer" });
}

async function createHeadersIntegrationTemplate(): Promise<ArrayBuffer> {
	const zip = new JSZip();

	zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide3.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide4.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`);

	zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

	zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="${NS_P}" xmlns:r="${NS_R}">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
    <p:sldId id="257" r:id="rId2"/>
    <p:sldId id="258" r:id="rId3"/>
    <p:sldId id="259" r:id="rId4"/>
  </p:sldIdLst>
</p:presentation>`);

	zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide4.xml"/>
</Relationships>`);

	// Slide 1: header template with border + 3 topic slots
	zip.file("ppt/slides/slide1.xml", makeSlide(
		makeShape("top-bar-border-key", "", 0) +
		makeShape("top-bar-topic-1-of-3-text", "Slot 1", 100000) +
		makeShape("top-bar-topic-2-of-3-text", "Slot 2", 200000) +
		makeShape("top-bar-topic-3-of-3-text", "Slot 3", 300000),
	));

	// Slides 2-4: content slides
	for (let i = 2; i <= 4; i++) {
		zip.file(`ppt/slides/slide${i}.xml`, makeSlide(
			makeShape("content-text", `Content ${i - 1}`, 457200),
		));
		zip.file(`ppt/slides/_rels/slide${i}.xml.rels`, makeRels());
	}

	zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("integration: load template → create → verify output", () => {
	it("loads a template and creates a bullet slide", async () => {
		const template = await createMultiSlideTemplate();

		const parsed = await loadTemplate(template);
		expect(parsed.slideCount).toBe(3);

		const result = await createBulletSlide(template, {
			title: "Integration Title",
			bullets: ["Point A", "Point B"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(4);

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Integration Title");
		expect(slide4).toContain("Point A");
		expect(slide4).toContain("Point B");
	});

	it("loads a template and creates a summary slide", async () => {
		const template = await createMultiSlideTemplate();

		const result = await createSummarySlide(template, {
			title: "Agenda",
			items: ["Intro", "Body", "Conclusion"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Agenda");
		expect(slide4).toContain("Intro");
		expect(slide4).toContain("Body");
	});

	it("loads a template and creates short quotes slides", async () => {
		const template = await createMultiSlideTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Quote One", addendum: "Add One" },
				{ quote: "Quote Two", addendum: "Add Two" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(5);

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Quote One");
		expect(slide4).toContain("Add One");

		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("Quote Two");
		expect(slide5).toContain("Add Two");
	});

	it("preserves original slides after multiple operations", async () => {
		const template = await createMultiSlideTemplate();

		const result = await createBulletSlide(template, {
			title: "New Title",
			bullets: ["New Bullet"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Title");
		expect(slide1).toContain("Bullet 1");
		expect(slide1).not.toContain("New Title");
	});

	it("output ZIP can be re-loaded and parsed again", async () => {
		const template = await createMultiSlideTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "Topic", subtitle: "Sub", quote: "Long quote text here." },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const reParsed = await loadTemplate(await resultZip.generateAsync({ type: "arraybuffer" }));
		expect(reParsed.slideCount).toBeGreaterThan(3);
	});

	it("produces valid ZIP with all required OOXML files", async () => {
		const template = await createMultiSlideTemplate();

		const result = await createBulletSlide(template, {
			title: "Valid",
			bullets: ["Check"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("_rels/.rels");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/_rels/presentation.xml.rels");
		expect(fileList).toContain("ppt/slides/slide1.xml");
	});

	it("creates highlight variation slides and verifies output", async () => {
		const { createHighlightVariationSlides } = await import("../functions/create-highlight-variation-slides");

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
			makeShape("point-1-of-3-text-box", "Point 1", 457200) +
			makeShape("point-1-of-3-number-indicator-text-box", "1", 457200) +
			makeShape("point-2-of-3-text-box", "Point 2", 1371600) +
			makeShape("point-2-of-3-number-indicator-text-box", "2", 1371600) +
			makeShape("point-3-of-3-text-box", "Point 3", 2286000) +
			makeShape("point-3-of-3-number-indicator-text-box", "3", 2286000),
		));
		zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());

		const template = await zip.generateAsync({ type: "arraybuffer" });

		const result = await createHighlightVariationSlides(template, {
			highlightColor: "FF0000",
			dimmedColor: "CCCCCC",
			highlightBold: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles.length).toBeGreaterThan(1);
	});

	it("chains duplicate then background color operations", async () => {
		const { duplicateSlideRange } = await import("../functions/duplicate-slide-range");
		const { applyBackgroundColor } = await import("../functions/apply-background-color");
		const template = await createMultiSlideTemplate();

		const duplicated = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
			insertionSlideNumber: 4,
		});

		const colored = await applyBackgroundColor(duplicated, {
			color: "FF0000",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(colored);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(4);
	});

	it("pipeline generates slides from template with text replacement", async () => {
		const { generateSlidesFromTemplate } = await import("../pipeline");
		const template = await createMultiSlideTemplate();

		const result = await generateSlidesFromTemplate(template, [
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "quote-text-box": "Pipeline Generated" },
			},
		]);

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Pipeline Generated");
	});

	it("chained: createBulletSlide → batchReplaceText", async () => {
		const template = await createMultiSlideTemplate();

		const bulletResult = await createBulletSlide(template, {
			title: "Meeting Notes",
			bullets: ["Item A", "Item B"],
		});
		let resultZip = await JSZip.loadAsync(bulletResult);
		let slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Item A");

		const replacedResult = await batchReplaceText(bulletResult, {
			replacements: [{ oldText: "Item", newText: "Topic" }],
		});
		resultZip = await JSZip.loadAsync(replacedResult);
		slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Topic A");
		expect(slide4).not.toContain("Item A");
	});

	it("chained: createBulletSlide → batchSetTextStyle", async () => {
		const template = await createMultiSlideTemplate();

		const bulletResult = await createBulletSlide(template, {
			title: "Styled Title",
			bullets: ["Bullet"],
			titleItalic: true,
		});

		const styledResult = await batchSetTextStyle(bulletResult, {
			textStyles: [{
				pageElementKey: "bullet-point-1-text",
				bold: true,
				fontSize: 2400,
			}],
			lowerBoundSlideNumber: 4,
			upperBoundSlideNumber: 4,
		});

		const resultZip = await JSZip.loadAsync(styledResult);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("sz=\"2400\"");
		expect(slide4).toContain("b=\"1\"");
	});

	it("chained: duplicateSlideRange → createShortQuotesSlides", async () => {
		const { duplicateSlideRange } = await import("../functions/duplicate-slide-range");
		const template = await createMultiSlideTemplate();

		const duplicated = await duplicateSlideRange(template, {
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 4,
		});

		const result = await createShortQuotesSlides(duplicated, {
			shortQuoteItems: [
				{ quote: "Chained", addendum: "Success" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// 3 original + 1 duplicated + 1 new = 5
		expect(slideFiles).toHaveLength(5);
	});

	it("chained: applyBackgroundColor → moveSlides", async () => {
		const { applyBackgroundColor } = await import("../functions/apply-background-color");
		const template = await createMultiSlideTemplate();

		const colored = await applyBackgroundColor(template, {
			color: "ACCENT1",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const moved = await moveSlides(colored, {
			fromSlideNumber: 1,
			toSlideNumber: 1,
			targetSlideNumber: 4,
		});

		const resultZip = await JSZip.loadAsync(moved);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		expect(presXml).toContain("rId1");
		expect(presXml).toContain("rId2");
		const idMatch = presXml.match(/r:id="([^"]+)"/g);
		expect(idMatch).toBeDefined();
		expect(idMatch![0]).toBe("r:id=\"rId2\"");
	});

	it("long chain: createBulletSlide → batchReplaceText → moveSlides → applyBackgroundColor", async () => {
		const { applyBackgroundColor } = await import("../functions/apply-background-color");
		const template = await createMultiSlideTemplate();

		const bulletResult = await createBulletSlide(template, {
			title: "Pipeline Test",
			bullets: ["Step 1", "Step 2"],
		});

		const replacedResult = await batchReplaceText(bulletResult, {
			replacements: [{ oldText: "Step", newText: "Phase" }],
		});

		const movedResult = await moveSlides(replacedResult, {
			fromSlideNumber: 4,
			toSlideNumber: 4,
			targetSlideNumber: 1,
		});

		const finalResult = await applyBackgroundColor(movedResult, {
			color: "4472C4",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(finalResult);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(4);
	});

	it("pipeline with style overrides preserves original template slides", async () => {
		const template = await createMultiSlideTemplate();

		const result = await createBulletSlide(template, {
			title: "New",
			bullets: ["Point"],
			titleColor: "ACCENT2",
			bulletItalic: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Title");
		expect(slide1).toContain("Bullet 1");
		expect(slide1).not.toContain("New");
	});

	it("creates bullet slide with 3 bullets (full template capacity)", async () => {
		const template = await createMultiSlideTemplate();

		const result = await createBulletSlide(template, {
			title: "Full",
			bullets: ["Alpha", "Beta", "Gamma"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Alpha");
		expect(slide4).toContain("Beta");
		expect(slide4).toContain("Gamma");
	});

	it("creates bullet slide with single bullet", async () => {
		const template = await createMultiSlideTemplate();

		const result = await createBulletSlide(template, {
			title: "Single",
			bullets: ["Only Bullet"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(4);
	});

	it("creates bullet slide with null bullet entry (string fallback)", async () => {
		const template = await createMultiSlideTemplate();

		const result = await createBulletSlide(template, {
			title: "Null",
			bullets: ["Real", null as unknown as string],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Real");
	});

	it("pipeline handles case-sensitive batch replace", async () => {
		const template = await createMultiSlideTemplate();

		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "Title", newText: "CAPTION" }],
			matchCase: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("CAPTION");
		expect(slide1).not.toContain("Title");
	});

	it("pipeline handles case-insensitive batch replace", async () => {
		const template = await createMultiSlideTemplate();

		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "title", newText: "heading" }],
			matchCase: false,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("heading");
	});

	it("generateSlidesFromTemplate returns template unchanged for empty operations", async () => {
		const template = await createMultiSlideTemplate();
		const result = await generateSlidesFromTemplate(template, []);
		expect(result).toBe(template);
	});

	it("generateSlidesFromTemplate skips operations with non-matching keys", async () => {
		const template = await createMultiSlideTemplate();
		const ops: SlideOperation[] = [
			{ templateSourceKey: "nonexistent-key", textReplacements: { a: "b" } },
		];
		const result = await generateSlidesFromTemplate(template, ops);
		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);
	});

	it("pipeline with single operation and empty styleOverrides works", async () => {
		const template = await createMultiSlideTemplate();
		const ops: SlideOperation[] = [
			{
				templateSourceKey: "bullet-title-text-box",
				textReplacements: { "bullet-title-text-box": "Overridden Title" },
			},
		];
		const result = await generateSlidesFromTemplate(template, ops);
		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Overridden Title");
	});

	it("output template can be re-loaded and parsed again after chained operations", async () => {
		const template = await createMultiSlideTemplate();

		const step1 = await createBulletSlide(template, {
			title: "First",
			bullets: ["Bullet"],
		});

		const step2 = await batchReplaceText(step1, {
			replacements: [{ oldText: "First", newText: "Second" }],
		});

		const parsed = await loadTemplate(step2);
		expect(parsed.slideCount).toBe(4);
		expect(parsed.slides.length).toBe(4);
	});

	it("generateSlidesFromTemplate with multiple matching operations all produce output", async () => {
		const template = await createMultiSlideTemplate();
		const ops: SlideOperation[] = [
			{
				templateSourceKey: "bullet-title-text-box",
				textReplacements: { "bullet-title-text-box": "Slide A" },
			},
			{
				templateSourceKey: "quote-text-box",
				textReplacements: { "quote-text-box": "Slide B" },
			},
		];
		const result = await generateSlidesFromTemplate(template, ops);
		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide4).toContain("Slide A");
		expect(slide5).toContain("Slide B");
	});

	it("setHeaders adds header shapes to slides in range", async () => {
		const template = await createHeadersIntegrationTemplate();
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "Intro", sectionStartSlideNumber: 2, sectionEndSlideNumber: 3 },
				{ sectionName: "Body", sectionStartSlideNumber: 3, sectionEndSlideNumber: 4 },
			],
			headerLength: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("top-bar-border-key");
		expect(slide2).toContain("Intro");
		expect(slide2).not.toContain("Slot 1");

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Body");
		expect(slide4).not.toContain("Slot 1");
	});
});
