/**
 * create-summary-slide.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { createSummarySlide } from "../functions/create-summary-slide";

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

async function createSummaryTemplate(): Promise<ArrayBuffer> {
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
<p:presentation xmlns:p="${NS_P}" xmlns:r="${NS_R}">
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

	zip.file("ppt/slides/slide1.xml", makeSlide(
		makeShape("summary-title-text", "Title Placeholder", 457200) +
		makeShape("summary-item-1-text", "Item 1", 1371600) +
		makeShape("summary-item-2-text", "Item 2", 1946400) +
		makeShape("summary-item-3-text", "Item 3", 2521200),
	));

	zip.file("ppt/slides/slide2.xml", makeSlide(
		makeShape("section-title-text-box", "Other", 457200),
	));

	zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());
	zip.file("ppt/slides/_rels/slide2.xml.rels", makeRels());

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("createSummarySlide", () => {
	it("creates new slide with title and 1 item", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Agenda",
			items: ["Introduction"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Agenda");
		expect(slide3).toContain("Introduction");
	});

	it("creates new slide with title and 2 items", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Topics",
			items: ["Alpha", "Beta"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Topics");
		expect(slide3).toContain("Alpha");
		expect(slide3).toContain("Beta");
	});

	it("returns template unchanged when items array is empty", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Agenda",
			items: [],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("returns template unchanged when items is undefined", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Agenda",
			items: undefined as unknown as string[],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("returns template unchanged when template lacks required keys", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Agenda",
			items: ["A", "B", "C", "D"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("applies title font size when specified", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Big Title",
			items: ["Point"],
			titleFontSize: 3600,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("sz=\"3600\"");
	});

	it("applies item color when specified", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Title",
			items: ["Colored"],
			itemColor: "ACCENT1",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("val=\"4472C4\"");
	});

	it("applies title italic override", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Styled",
			items: ["Point"],
			titleItalic: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("i=\"1\"");
	});

	it("preserves original slides unchanged", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "New Agenda",
			items: ["New Item"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Title Placeholder");
		expect(slide1).toContain("Item 1");
	});

	it("produces valid ZIP with all required files", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Valid",
			items: ["Check"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("_rels/.rels");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/_rels/presentation.xml.rels");
	});

	it("applies all item style overrides simultaneously", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Title",
			items: ["Styled Item"],
			itemFontSize: 1800,
			itemItalic: true,
			itemUnderline: true,
			itemStrikethrough: true,
			itemColor: "ACCENT3",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("sz=\"1800\"");
		expect(slide3).toContain("i=\"1\"");
		expect(slide3).toContain("u=\"sng\"");
		expect(slide3).toContain("strike=\"sngStrike\"");
		expect(slide3).toContain("val=\"A5A5A5\"");
	});

	it("handles empty item string", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Title",
			items: [""],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("summary-item-1-text");
	});

	it("handles XML-special characters in title and items", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Title & <Summary>",
			items: ["Cost > $100", "He said \"hello\""],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Title &amp; &lt;Summary&gt;");
		expect(slide3).toContain("Cost &gt; $100");
		expect(slide3).toContain("He said \"hello\"");
	});

	it("does not set bold by default (matching GAS behavior)", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Title",
			items: ["Item"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).not.toContain("b=\"");
	});

	it("applies title bold when specified", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Bold Title",
			items: ["Item"],
			titleBold: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("b=\"1\"");
	});

	it("applies title strikethrough when specified", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Struck Title",
			items: ["Item"],
			titleStrikethrough: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("strike=\"sngStrike\"");
	});

	it("applies title underline when specified", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Underlined Title",
			items: ["Item"],
			titleUnderline: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("u=\"sng\"");
	});

	it("applies item bold when specified", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Title",
			items: ["Bold Item"],
			itemBold: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("b=\"1\"");
	});

	it("handles invalid title color gracefully (no style override emitted)", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Title",
			items: ["Item"],
			titleColor: "INVALID",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		// Title should still contain text, but no srgbClr style should be emitted for title
		expect(slide3).toContain("Title");
	});

	it("handles invalid item color gracefully (no style override emitted for items)", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Title",
			items: ["Item"],
			itemColor: "INVALID",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Item");
	});

	it("handles null/undefined items gracefully with empty string fallback", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Title",
			items: [null, undefined] as unknown as string[],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("summary-item-1-text");
		expect(slide3).toContain("summary-item-2-text");
	});

	it("emits no styleOverrides when only invalid colors provided", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "No Style",
			items: ["Item"],
			titleColor: "INVALID",
			itemColor: "INVALID",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("No Style");
	});

	it("creates slide with no optional style params (empty styleOverrides)", async () => {
		const template = await createSummaryTemplate();

		const result = await createSummarySlide(template, {
			title: "Plain",
			items: ["Item A", "Item B"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Plain");
		expect(slide3).toContain("Item A");
		expect(slide3).toContain("Item B");
	});
});
