/**
 * create-short-quotes-slides.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { createShortQuotesSlides } from "../functions/create-short-quotes-slides";

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

async function createShortQuotesTemplate(): Promise<ArrayBuffer> {
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
		makeShape("quote-text-box", "Quote Placeholder", 457200) +
		makeShape("addendum-text-box", "Addendum Placeholder", 1828800),
	));

	zip.file("ppt/slides/slide2.xml", makeSlide(
		makeShape("section-title-text-box", "Other", 457200),
	));

	zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());
	zip.file("ppt/slides/_rels/slide2.xml.rels", makeRels());

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("createShortQuotesSlides", () => {
	it("creates one slide per short quote item", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Hello", addendum: "World" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Hello");
		expect(slide3).toContain("World");
	});

	it("creates multiple slides for multiple items", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "First", addendum: "Addendum 1" },
				{ quote: "Second", addendum: "Addendum 2" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(4);

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("First");
		expect(slide3).toContain("Addendum 1");

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Second");
		expect(slide4).toContain("Addendum 2");
	});

	it("returns template unchanged when shortQuoteItems is empty", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("returns template unchanged when shortQuoteItems is undefined", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: undefined as unknown as [],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("returns template unchanged when template lacks required keys", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Q", addendum: "A" },
			],
			overrideQuoteTextBoxKey: "nonexistent-key",
			overrideAddendumTextBoxKey: "also-missing",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("applies quote font size when specified", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Big Quote", addendum: "Small" },
			],
			quoteFontSize: 3600,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("sz=\"3600\"");
	});

	it("applies addendum color when specified", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Q", addendum: "Colored" },
			],
			addendumColor: "ACCENT1",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("val=\"4472C4\"");
	});

	it("applies per-item quote italic override", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Italicized", addendum: "Normal", quoteItalic: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("i=\"1\"");
	});

	it("does not apply bold when not specified (respects template defaults)", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Q", addendum: "No Bold" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).not.toContain("b=\"");
	});

	it("per-item color overrides override global", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Q", addendum: "A", quoteColor: "ACCENT2" },
			],
			quoteColor: "ACCENT1",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("val=\"ED7D31\"");
		expect(slide3).not.toContain("val=\"4472C4\"");
	});

	it("preserves original slides unchanged", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "New", addendum: "Slides" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Quote Placeholder");
		expect(slide1).toContain("Addendum Placeholder");
	});

	it("produces valid ZIP with all required files", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Valid", addendum: "Output" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("_rels/.rels");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/_rels/presentation.xml.rels");
	});

	it("applies all style overrides simultaneously", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{
					quote: "Styled Quote",
					addendum: "Styled Addendum",
					quoteColor: "ACCENT3",
					quoteFontSize: 1800,
					quoteItalic: true,
					quoteUnderline: true,
					quoteStrikethrough: true,
					addendumColor: "ACCENT4",
					addendumFontSize: 1200,
					addendumBold: true,
				},
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("sz=\"1800\"");
		expect(slide3).toContain("i=\"1\"");
		expect(slide3).toContain("u=\"sng\"");
		expect(slide3).toContain("strike=\"sngStrike\"");
		expect(slide3).toContain("val=\"A5A5A5\"");
		expect(slide3).toContain("sz=\"1200\"");
		expect(slide3).toContain("b=\"1\"");
		expect(slide3).toContain("val=\"FFC000\"");
	});

	it("handles XML-special characters in quote and addendum", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Cost > $100", addendum: "He said \"ok\"" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Cost &gt; $100");
		expect(slide3).toContain("He said \"ok\"");
	});

	it("handles empty quote string", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "", addendum: "Only Addendum" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Only Addendum");
		expect(slide3).toContain("quote-text-box");
	});

	it("handles empty addendum string", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Only Quote", addendum: "" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Only Quote");
		expect(slide3).toContain("addendum-text-box");
	});

	it("applies per-item quote bold override", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Bold Quote", addendum: "Addendum", quoteBold: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("b=\"1\"");
	});

	it("applies per-item addendum italic override", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Q", addendum: "Italic Addendum", addendumItalic: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("i=\"1\"");
	});

	it("per-item quoteStrikethrough and addendumStrikethrough override global", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{
					quote: "Struck Quote",
					addendum: "Struck Addendum",
					quoteStrikethrough: true,
					addendumStrikethrough: true,
				},
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("strike=\"sngStrike\"");
	});

	it("per-item addendumUnderline override (covers line 109)", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Q", addendum: "Underlined", addendumUnderline: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("u=\"sng\"");
	});

	it("invalid addendumColor falsy branch (covers line 105 false)", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Q", addendum: "No color override", addendumColor: "INVALID" as never },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("No color override");
	});

	it("unknown colors for quote and addendum cover falsy branches", async () => {
		const template = await createShortQuotesTemplate();

		const result = await createShortQuotesSlides(template, {
			shortQuoteItems: [
				{ quote: "Quote only", addendum: "Addendum only", quoteColor: "NONEXISTENT" as never, addendumColor: "NONEXISTENT" as never },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Quote only");
		expect(slide3).toContain("Addendum only");
	});
});
