/**
 * create-long-quotes-slides.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { createLongQuotesSlides } from "../functions/create-long-quotes-slides";

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

async function createLongQuotesTemplate(): Promise<ArrayBuffer> {
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

	// Slide 1: title template
	zip.file("ppt/slides/slide1.xml", makeSlide(
		makeShape("section-title-text-box", "Title Placeholder", 457200) +
		makeShape("section-subtitle-text-box", "Subtitle Placeholder", 914400),
	));

	// Slide 2: content template (quote + addendum)
	zip.file("ppt/slides/slide2.xml", makeSlide(
		makeShape("quote-text-box", "Quote Placeholder", 457200) +
		makeShape("addendum-text-box", "Addendum Placeholder", 1828800),
	));

	// Slide 3: other slide (should remain untouched — must use unique key)
	zip.file("ppt/slides/slide3.xml", makeSlide(
		makeShape("other-unique-key", "Other", 457200),
	));

	zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());
	zip.file("ppt/slides/_rels/slide2.xml.rels", makeRels());
	zip.file("ppt/slides/_rels/slide3.xml.rels", makeRels());

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("createLongQuotesSlides", () => {
	it("creates title + content slides for single item (1 split)", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "My Title", subtitle: "My Subtitle", quote: "Single chunk." },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// 3 original + 1 title + 1 content = 5
		expect(slideFiles).toHaveLength(5);

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("My Title");
		expect(slide4).toContain("My Subtitle");

		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("Single chunk.");
		expect(slide5).toContain("My Title");
	});

	it("creates multiple content slides for multiple split chunks", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{
					title: "Item",
					subtitle: "Sub",
					quote: "Paragraph one.\n\nParagraph two.\n\nParagraph three.",
				},
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// 3 original + 1 title + 3 content = 7
		expect(slideFiles).toHaveLength(7);

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Item");
		expect(slide4).toContain("Sub");

		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("Paragraph one.");
		expect(slide5).toContain("Item");

		const slide6 = await resultZip.file("ppt/slides/slide6.xml")!.async("text");
		expect(slide6).toContain("Paragraph two.");
		expect(slide6).toContain("Item");

		const slide7 = await resultZip.file("ppt/slides/slide7.xml")!.async("text");
		expect(slide7).toContain("Paragraph three.");
		expect(slide7).toContain("Item");
	});

	it("creates slides for multiple items", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "First", subtitle: "A1", quote: "First quote." },
				{ title: "Second", subtitle: "B2", quote: "Second quote." },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// 3 original + (1+1)*2 = 7
		expect(slideFiles).toHaveLength(7);

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("First");
		const slide6 = await resultZip.file("ppt/slides/slide6.xml")!.async("text");
		expect(slide6).toContain("Second");
	});

	it("returns template unchanged when longQuoteItems is empty", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);
	});

	it("returns template unchanged when longQuoteItems is undefined", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: undefined as unknown as [],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);
	});

	it("returns template unchanged when template lacks required keys", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Q." },
			],
			overrideTitleTextBoxKey: "nonexistent-key",
			overrideQuoteTextBoxKey: "also-missing",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);
	});

	it("applies title font size when specified", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "Big", subtitle: "Small", quote: "Text." },
			],
			titleFontSize: 3600,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("sz=\"3600\"");
	});

	it("applies quote color when specified", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Colored." },
			],
			quoteColor: "ACCENT1",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("val=\"4472C4\"");
	});

	it("applies title bold only when specified", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "Bold Title", subtitle: "S", quote: "Q.", titleBold: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("b=\"1\"");
	});

	it("does not apply bold when not specified (respects template defaults)", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Q." },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).not.toContain("b=\"");
	});

	it("applies subtitle bold when set to true", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "Bold Sub", quote: "Q.", subtitleBold: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("b=\"1\"");
	});

	it("applies quote bold when set to true", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Bold quote.", quoteBold: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("b=\"1\"");
	});

	it("applies addendum bold when set to true", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Q.", addendumBold: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("b=\"1\"");
	});

	it("per-item color overrides override global", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Q.", titleColor: "ACCENT2" },
			],
			titleColor: "ACCENT1",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("val=\"ED7D31\"");
		expect(slide4).not.toContain("val=\"4472C4\"");
	});

	it("preserves original slides unchanged", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "New", subtitle: "Slides", quote: "Content." },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Title Placeholder");
		expect(slide1).toContain("Subtitle Placeholder");
	});

	it("produces valid ZIP with all required files", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "Valid", subtitle: "Test", quote: "Output." },
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
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{
					title: "Styled",
					subtitle: "Sub",
					quote: "Styled quote.",
					titleColor: "ACCENT3",
					titleFontSize: 2400,
					titleItalic: true,
					titleUnderline: true,
					titleStrikethrough: true,
					subtitleColor: "ACCENT4",
					subtitleFontSize: 1800,
					subtitleBold: true,
					quoteColor: "ACCENT5",
					quoteFontSize: 1400,
					quoteItalic: true,
					quoteStrikethrough: true,
					quoteUnderline: true,
					addendumColor: "ACCENT6",
					addendumFontSize: 1200,
					addendumBold: true,
					addendumStrikethrough: true,
					addendumUnderline: true,
				},
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("sz=\"2400\"");
		expect(slide4).toContain("i=\"1\"");
		expect(slide4).toContain("u=\"sng\"");
		expect(slide4).toContain("strike=\"sngStrike\"");
		expect(slide4).toContain("val=\"A5A5A5\"");
		expect(slide4).toContain("sz=\"1800\"");
		expect(slide4).toContain("val=\"FFC000\"");

		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("sz=\"1400\"");
		expect(slide5).toContain("i=\"1\"");
		expect(slide5).toContain("strike=\"sngStrike\"");
		expect(slide5).toContain("u=\"sng\"");
		expect(slide5).toContain("val=\"5B9BD5\"");
		expect(slide5).toContain("sz=\"1200\"");
		expect(slide5).toContain("b=\"1\"");
		expect(slide5).toContain("strike=\"sngStrike\"");
		expect(slide5).toContain("u=\"sng\"");
		expect(slide5).toContain("val=\"70AD47\"");
	});

	it("handles XML-special characters", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "Title & <Summary>", subtitle: "Author > Editor", quote: "Cost > $100" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("Title &amp; &lt;Summary&gt;");
		expect(slide4).toContain("Author &gt; Editor");
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("Cost &gt; $100");
	});

	it("handles empty quote string", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "" },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// Empty quote → split returns [] → no content slide → just title slide
		expect(slideFiles).toHaveLength(4);
	});

	it("handles empty subtitle", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "", quote: "Quote." },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("section-subtitle-text-box");
	});

	it("content slide addendum uses item title", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "My Item Title", subtitle: "S", quote: "Quote content." },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("My Item Title");
	});

	it("splits by paragraph mode (default)", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{
					title: "T",
					subtitle: "S",
					quote: "Para one.\n\nPara two.\n\nPara three.",
					splitMode: "paragraph",
				},
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// 3 original + 1 title + 3 content = 7
		expect(slideFiles).toHaveLength(7);
	});

	it("splits by sentence mode", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{
					title: "T",
					subtitle: "S",
					quote: "First sentence. Second sentence! Third?",
					splitMode: "sentence",
				},
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// 3 original + 1 title + 3 content = 7
		expect(slideFiles).toHaveLength(7);
	});

	it("splits by char-count mode", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{
					title: "T",
					subtitle: "S",
					quote: "Word1 word2 word3 word4 word5 word6 word7 word8",
					splitMode: "char-count",
					splitMaxChars: 15,
				},
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		// Should produce multiple content slides
		expect(slideFiles.length).toBeGreaterThan(4);
	});

	it("none mode returns single trimmed string", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{
					title: "T",
					subtitle: "S",
					quote: "  Line1\nLine2  ",
					splitMode: "none",
				},
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("Line1\nLine2");
	});

	it("applies per-item subtitle strikethrough and underline", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Quote.", subtitleStrikethrough: true, subtitleUnderline: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("strike=\"sngStrike\"");
		expect(slide4).toContain("u=\"sng\"");
	});

	it("applies per-item quote italic override", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Italic quote.", quoteItalic: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("i=\"1\"");
	});

	it("creates slides with no style overrides (empty styleOverrides branches)", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "Plain", subtitle: "Sub", quote: "Just text." },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(5);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("Just text.");
	});

	it("applies global style fallback when per-item value is undefined", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Q." },
			],
			addendumUnderline: true,
			addendumFontSize: 1600,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("u=\"sng\"");
		expect(slide5).toContain("sz=\"1600\"");
	});

	it("per-item addendumItalic override (covers line 99)", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Q.", addendumItalic: true },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("i=\"1\"");
	});

	it("global addendumStrikethrough fallback (covers right branch of ?? on line 101)", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{ title: "T", subtitle: "S", quote: "Q." },
			],
			addendumStrikethrough: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("strike=\"sngStrike\"");
	});

	it("partial style overrides (some non-empty, some empty)", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{
					title: "Only Title Styled",
					subtitle: "No sub style",
					quote: "Only quote colored.",
					titleFontSize: 2400,
					titleBold: true,
					quoteColor: "ACCENT1",
				},
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("sz=\"2400\"");
		expect(slide4).toContain("b=\"1\"");
		// subtitle has no overrides
		expect(slide4).not.toContain("addendum");

		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("val=\"4472C4\"");
		// addendum has no overrides
	});

	it("unknown colors produce empty style objects (no color branches)", async () => {
		const template = await createLongQuotesTemplate();

		const result = await createLongQuotesSlides(template, {
			longQuoteItems: [
				{
					title: "No Color",
					subtitle: "No Color",
					quote: "No Color.",
					titleColor: "BOGUS_COLOR",
					subtitleColor: "BOGUS_COLOR",
					quoteColor: "BOGUS_COLOR",
					addendumColor: "BOGUS_COLOR",
				},
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(5);

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).toContain("No Color");

		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		expect(slide5).toContain("No Color.");
	});
});
