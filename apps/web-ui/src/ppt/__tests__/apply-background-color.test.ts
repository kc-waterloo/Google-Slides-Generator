/**
 * apply-background-color.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { loadTemplate } from "../template-loader";
import { applyBackgroundColor } from "../functions/apply-background-color";

const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";

const makeSlide = (hasBg: boolean): string => {
	const bg = hasBg
		? "<p:bg><a:solidFill><a:srgbClr val=\"FF0000\"/></a:solidFill></p:bg>"
		: "";
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="${NS_A}" xmlns:r="${NS_R}" xmlns:p="${NS_P}">
  <p:cSld>${bg}
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
</p:sld>`;
};

async function createBgTemplate(slideCount: number): Promise<ArrayBuffer> {
	const zip = new JSZip();

	let ctXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>`;
	for (let i = 1; i <= slideCount; i++) {
		ctXml += `\n  <Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
	}
	ctXml += "\n</Types>";
	zip.file("[Content_Types].xml", ctXml);

	zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

	let presRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;
	for (let i = 1; i <= slideCount; i++) {
		presRels += `\n  <Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>`;
	}
	presRels += "\n</Relationships>";
	zip.file("ppt/_rels/presentation.xml.rels", presRels);

	let presXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="${NS_P}" xmlns:r="${NS_R}">
  <p:sldIdLst>`;
	for (let i = 1; i <= slideCount; i++) {
		presXml += `\n    <p:sldId id="${255 + i}" r:id="rId${i}"/>`;
	}
	presXml += `\n  </p:sldIdLst>
</p:presentation>`;
	zip.file("ppt/presentation.xml", presXml);

	for (let i = 1; i <= slideCount; i++) {
		zip.file(`ppt/slides/slide${i}.xml`, makeSlide(false));
	}

	for (let i = 1; i <= slideCount; i++) {
		zip.file(`ppt/slides/_rels/slide${i}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
	}

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("applyBackgroundColor", () => {
	it("adds background color to slides in range", async () => {
		const template = await createBgTemplate(3);

		const result = await applyBackgroundColor(template, {
			color: "DARK1",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		for (let i = 1; i <= 3; i++) {
			const slideXml = await resultZip.file(`ppt/slides/slide${i}.xml`)!.async("text");
			expect(slideXml).toContain("p:bg");
			expect(slideXml).toContain("val=\"000000\"");
		}
	});

	it("respects lower bound (only affects slides in range)", async () => {
		const template = await createBgTemplate(4);

		const result = await applyBackgroundColor(template, {
			color: "ACCENT1",
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("p:bg");

		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("val=\"4472C4\"");

		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("val=\"4472C4\"");

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).not.toContain("p:bg");
	});

	it("does nothing when lowerBound exceeds upperBound", async () => {
		const template = await createBgTemplate(3);

		const result = await applyBackgroundColor(template, {
			color: "DARK1",
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		for (let i = 1; i <= 3; i++) {
			const slideXml = await resultZip.file(`ppt/slides/slide${i}.xml`)!.async("text");
			expect(slideXml).not.toContain("p:bg");
		}
	});

	it("throws when presentation.xml is missing", async () => {
		const emptyZip = new JSZip();
		const buffer = await emptyZip.generateAsync({ type: "arraybuffer" });
		await expect(applyBackgroundColor(buffer, { color: "ACCENT1" })).rejects.toThrow("Missing required file");
	});

	it("skips slides whose file does not exist in zip", async () => {
		const zip = new JSZip();
		zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
</Types>`);
		zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`);
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
		// DELIBERATELY omit slide1.xml

		const buffer = await zip.generateAsync({ type: "arraybuffer" });
		const result = await applyBackgroundColor(buffer, { color: "ACCENT1" });
		const resultZip = await JSZip.loadAsync(result);
		expect(resultZip.file("ppt/presentation.xml")).toBeDefined();
	});

	it("handles range beyond available slides", async () => {
		const template = await createBgTemplate(2);

		const result = await applyBackgroundColor(template, {
			color: "ACCENT2",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 99,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("val=\"ED7D31\"");
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("val=\"ED7D31\"");
	});

	it("replaces existing background color", async () => {
		const template = await createBgTemplate(1);
		// Manually set an existing bg on slide1
		const zip = await JSZip.loadAsync(template);
		zip.file("ppt/slides/slide1.xml", makeSlide(true));
		const modifiedTemplate = await zip.generateAsync({ type: "arraybuffer" });

		const result = await applyBackgroundColor(modifiedTemplate, {
			color: "ACCENT3",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("val=\"A5A5A5\"");
		expect(slide1).not.toContain("val=\"FF0000\"");
	});

	it("produces valid ZIP output", async () => {
		const template = await createBgTemplate(3);

		const result = await applyBackgroundColor(template, {
			color: "LIGHT1",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/_rels/presentation.xml.rels");
		expect(fileList).toContain("ppt/slides/slide1.xml");
	});

	it("works on a single slide when lowerBound equals upperBound", async () => {
		const template = await createBgTemplate(3);

		const result = await applyBackgroundColor(template, {
			color: "ACCENT4",
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("p:bg");
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("val=\"FFC000\"");
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).not.toContain("p:bg");
	});

	it("handles unknown color name gracefully", async () => {
		const template = await createBgTemplate(1);

		const result = await applyBackgroundColor(template, {
			color: "NONEXISTENT",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("p:bg");
	});

	it("skips slides where r:id maps to no slide relationship", async () => {
		const template = await createBgTemplate(2);
		const zip = await JSZip.loadAsync(template);

		// Add an extra sldId with a non-existent rId that won't resolve to a slide
		const presXml = await zip.file("ppt/presentation.xml")!.async("text");
		const modifiedPres = presXml.replace(
			"</p:sldIdLst>",
			"    <p:sldId id=\"999\" r:id=\"rId999\"/>\n  </p:sldIdLst>",
		);
		zip.file("ppt/presentation.xml", modifiedPres);
		const modifiedTemplate = await zip.generateAsync({ type: "arraybuffer" });

		const result = await applyBackgroundColor(modifiedTemplate, {
			color: "DARK1",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("val=\"000000\"");
	});

	it("returns template unchanged when params is null or undefined", async () => {
		const template = await createBgTemplate(1);
		const result1 = await applyBackgroundColor(template, null as never);
		const result2 = await applyBackgroundColor(template, undefined as never);

		const resultZip1 = await JSZip.loadAsync(result1);
		const slide1 = await resultZip1.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("p:bg");

		const resultZip2 = await JSZip.loadAsync(result2);
		const slide1b = await resultZip2.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1b).not.toContain("p:bg");
	});

	it("uses default bounds when lowerBound is omitted (covers ?? operator)", async () => {
		const template = await createBgTemplate(2);

		const result = await applyBackgroundColor(template, {
			color: "ACCENT1",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("p:bg");
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("p:bg");
	});

	it("skips slides with empty r:id attribute", async () => {
		const template = await createBgTemplate(1);
		const zip = await JSZip.loadAsync(template);

		const presXml = await zip.file("ppt/presentation.xml")!.async("text");
		const modifiedPres = presXml.replace(
			"<p:sldId id=\"256\" r:id=\"rId1\"/>",
			"<p:sldId id=\"256\" r:id=\"\"/>",
		);
		zip.file("ppt/presentation.xml", modifiedPres);
		const modifiedTemplate = await zip.generateAsync({ type: "arraybuffer" });

		const result = await applyBackgroundColor(modifiedTemplate, {
			color: "DARK1",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("p:bg");
	});

	it("skips slides without cSld element", async () => {
		const template = await createBgTemplate(1);
		const zip = await JSZip.loadAsync(template);

		const noCSldSlide = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="${NS_A}" xmlns:r="${NS_R}" xmlns:p="${NS_P}">
  <p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm></p:grpSpPr>
  </p:spTree>
</p:sld>`;
		zip.file("ppt/slides/slide1.xml", noCSldSlide);
		const modifiedTemplate = await zip.generateAsync({ type: "arraybuffer" });
		const parsed = await loadTemplate(modifiedTemplate);
		expect(parsed.slideCount).toBe(1);

		const result = await applyBackgroundColor(modifiedTemplate, {
			color: "DARK1",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("p:bg");
	});
});
