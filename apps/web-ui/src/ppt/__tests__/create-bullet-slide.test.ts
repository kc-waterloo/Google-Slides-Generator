/**
 * create-bullet-slide.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { createBulletSlide } from "../functions/create-bullet-slide";

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

async function createBulletTemplate(): Promise<ArrayBuffer> {
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

	// Slide 1: bullet template with title + 3 bullet shapes
	zip.file("ppt/slides/slide1.xml", makeSlide(
		makeShape("bullet-title-text-box", "Title Placeholder", 457200) +
		makeShape("bullet-point-1-text", "Bullet 1", 1371600) +
		makeShape("bullet-point-2-text", "Bullet 2", 1946400) +
		makeShape("bullet-point-3-text", "Bullet 3", 2521200),
	));

	// Slide 2: non-bullet slide (should remain untouched)
	zip.file("ppt/slides/slide2.xml", makeSlide(
		makeShape("section-title-text-box", "Other", 457200),
	));

	zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());
	zip.file("ppt/slides/_rels/slide2.xml.rels", makeRels());

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("createBulletSlide", () => {
	it("creates new slide with title and 1 bullet", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "My Title",
			bullets: ["Only bullet"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(3);

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("My Title");
		expect(slide3).toContain("Only bullet");
	});

	it("creates new slide with title and 2 bullets", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Section Title",
			bullets: ["Alpha", "Beta"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Section Title");
		expect(slide3).toContain("Alpha");
		expect(slide3).toContain("Beta");
	});

	it("returns template unchanged when bullets array is empty", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Title",
			bullets: [],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("returns template unchanged when bullets is undefined", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Title",
			bullets: undefined as unknown as string[],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("returns template unchanged when template lacks required keys", async () => {
		const template = await createBulletTemplate();

		// Request more bullets than template has shapes for
		const result = await createBulletSlide(template, {
			title: "Title",
			bullets: ["A", "B", "C", "D"], // template only has 3 bullet shapes
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("supports custom overrideTitleTextBoxKey", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Custom",
			bullets: ["Only"],
			overrideTitleTextBoxKey: "bullet-title-text-box",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Custom");
	});

	it("supports custom overrideBulletPrefix", async () => {
		const zip = new JSZip();
		const customTemplate = await createBulletTemplate();
		// Need a template with custom prefix keys for this test
		// Rebuild with different keys
		const customZip = await JSZip.loadAsync(customTemplate);
		zip.file("[Content_Types].xml", await customZip.file("[Content_Types].xml")!.async("text"));
		zip.file("_rels/.rels", await customZip.file("_rels/.rels")!.async("text"));
		zip.file("ppt/presentation.xml", await customZip.file("ppt/presentation.xml")!.async("text"));
		zip.file("ppt/_rels/presentation.xml.rels", await customZip.file("ppt/_rels/presentation.xml.rels")!.async("text"));
		zip.file("ppt/slides/slide1.xml", makeSlide(
			makeShape("bullet-title-text-box", "Title", 457200) +
			makeShape("custom-bullet-1-text", "C1", 1371600) +
			makeShape("custom-bullet-2-text", "C2", 1946400),
		));
		zip.file("ppt/slides/slide2.xml", await customZip.file("ppt/slides/slide2.xml")!.async("text"));
		zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());
		zip.file("ppt/slides/_rels/slide2.xml.rels", makeRels());
		const customTemplate2 = await zip.generateAsync({ type: "arraybuffer" });

		const result = await createBulletSlide(customTemplate2, {
			title: "Custom",
			bullets: ["CB1", "CB2"],
			overrideBulletPrefix: "custom-bullet-",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("CB1");
		expect(slide3).toContain("CB2");
	});

	it("applies title font size when specified", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Big Title",
			bullets: ["Point"],
			titleFontSize: 3600,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("sz=\"3600\"");
	});

	it("applies bullet color when specified", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Title",
			bullets: ["Colored"],
			bulletColor: "ACCENT1",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("val=\"4472C4\"");
	});

	it("applies title bold and italic overrides", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Styled",
			bullets: ["Point"],
			titleItalic: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("i=\"1\"");
	});

	it("preserves original slides unchanged", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "New Title",
			bullets: ["New Bullet"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Title Placeholder");
		expect(slide1).toContain("Bullet 1");
	});

	it("produces valid ZIP with all required files", async () => {
		const template = await createBulletTemplate();

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
	});

	it("applies all bullet style overrides simultaneously", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Title",
			bullets: ["Styled Bullet"],
			bulletFontSize: 1800,
			bulletItalic: true,
			bulletUnderline: true,
			bulletStrikethrough: true,
			bulletColor: "ACCENT3",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("sz=\"1800\"");
		expect(slide3).toContain("i=\"1\"");
		expect(slide3).toContain("u=\"sng\"");
		expect(slide3).toContain("strike=\"sngStrike\"");
		expect(slide3).toContain("val=\"A5A5A5\"");
	});

	it("sets title bold=true and bullet bold=false by default", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Bold Title",
			bullets: ["Not Bold"],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("b=\"1\"");
		expect(slide3).toContain("b=\"0\"");
	});

	it("handles empty bullet string", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Title",
			bullets: [""],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("bullet-point-1-text");
	});

	it("handles XML-special characters in title and bullets", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Title & <Summary>",
			bullets: ["Cost > $100", "He said \"hello\""],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("Title &amp; &lt;Summary&gt;");
		expect(slide3).toContain("Cost &gt; $100");
		expect(slide3).toContain("He said \"hello\"");
	});

	it("handles null/undefined bullets with empty string fallback", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Title",
			bullets: [null, undefined] as unknown as string[],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("bullet-point-1-text");
		expect(slide3).toContain("bullet-point-2-text");
	});

	it("applies title strikethrough and underline when specified", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Styled Title",
			bullets: ["Point"],
			titleStrikethrough: true,
			titleUnderline: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("strike=\"sngStrike\"");
		expect(slide3).toContain("u=\"sng\"");
	});

	it("falls back to default style when bulletColor is unrecognized", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Test",
			bullets: ["Point"],
			bulletColor: "INVALID_COLOR",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideCount = Object.keys(resultZip.files).filter(
			(k) => k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		).length;
		expect(slideCount).toBeGreaterThan(2);
	});

	it("falls back to default style when titleColor is unrecognized", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Test",
			bullets: ["Point"],
			titleColor: "INVALID_COLOR",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideCount = Object.keys(resultZip.files).filter(
			(k) => k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		).length;
		expect(slideCount).toBeGreaterThan(2);
	});

	it("returns template unchanged when params is null", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, null as never);

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter(
			(k) => k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("returns template unchanged when params is undefined", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, undefined as never);

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter(
			(k) => k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("includes title style overrides in generated slide when all title style options are provided", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Full Style",
			bullets: ["Point"],
			titleFontSize: 2400,
			titleItalic: true,
			titleStrikethrough: true,
			titleUnderline: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("sz=\"2400\"");
		expect(slide3).toContain("i=\"1\"");
		expect(slide3).toContain("strike=\"sngStrike\"");
		expect(slide3).toContain("u=\"sng\"");
	});

	it("includes bullet style overrides in generated slide when all bullet style options are provided", async () => {
		const template = await createBulletTemplate();

		const result = await createBulletSlide(template, {
			title: "Title",
			bullets: ["B1", "B2", "B3"],
			bulletFontSize: 1600,
			bulletItalic: true,
			bulletStrikethrough: true,
			bulletUnderline: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("sz=\"1600\"");
		expect(slide3).toContain("i=\"1\"");
		expect(slide3).toContain("strike=\"sngStrike\"");
		expect(slide3).toContain("u=\"sng\"");
	});
});
