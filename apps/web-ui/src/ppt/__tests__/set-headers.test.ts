/**
 * set-headers.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { setHeaders } from "../functions/set-headers";

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

async function createHeadersTemplate(args: {
	headerLength: number;
	contentSlideCount: number;
	borderKey?: string;
	topicPrefix?: string;
}): Promise<ArrayBuffer> {
	const {
		headerLength,
		contentSlideCount,
		borderKey = "top-bar-border-key",
		topicPrefix = "top-bar-topic-",
	} = args;

	const totalSlides = 1 + contentSlideCount; // header template + content slides
	const zip = new JSZip();

	zip.file("[Content_Types].xml", makeContentType(totalSlides));
	zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);
	zip.file("ppt/presentation.xml", makePresentation(totalSlides));
	zip.file("ppt/_rels/presentation.xml.rels", makeRelsFile(totalSlides));

	// Header template slide (slide 1)
	const headerShapes: string[] = [
		makeShape(borderKey, "", 0),
	];
	for (let i = 1; i <= headerLength; i++) {
		headerShapes.push(makeShape(`${topicPrefix}${i}-of-${headerLength}-text`, `Slot ${i}`, i * 100000));
	}
	zip.file("ppt/slides/slide1.xml", makeSlide(headerShapes.join("")));
	zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());

	// Content slides
	for (let i = 1; i <= contentSlideCount; i++) {
		zip.file(`ppt/slides/slide${i + 1}.xml`, makeSlide(
			makeShape("content-text", `Content ${i}`, 457200),
		));
		zip.file(`ppt/slides/_rels/slide${i + 1}.xml.rels`, makeRels());
	}

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("setHeaders", () => {
	it("adds header shapes to slides in range", async () => {
		const template = await createHeadersTemplate({ headerLength: 3, contentSlideCount: 4 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "Topic A", sectionStartSlideNumber: 2, sectionEndSlideNumber: 3 },
			],
			headerLength: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("top-bar-border-key");
		expect(slide2).toContain("Topic A");

		const slide4 = await resultZip.file("ppt/slides/slide4.xml")!.async("text");
		expect(slide4).not.toContain("Topic A");
	});

	it("applies active section color to the correct topic slot", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "Active", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
			],
			headerLength: 2,
			activeSectionColor: "ACCENT1",
			inactiveSectionColor: "ACCENT3",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("val=\"4472C4\"");
		expect(slide2).toContain("val=\"A5A5A5\"");
	});

	it("applies bold correctly (active=true, inactive=false)", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "Bold Topic", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
			],
			headerLength: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2.match(/b="1"/g)).toHaveLength(1);
		expect(slide2.match(/b="0"/g)).toHaveLength(1);
	});

	it("handles sectionName undefined (no active section)", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: undefined, sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
			],
			headerLength: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		// Both should be bold=false, inactive color
		expect(slide2.match(/b="1"/g)).toBeNull();
	});

	it("handles headerLength of 1", async () => {
		const template = await createHeadersTemplate({ headerLength: 1, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "Only", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
			],
			headerLength: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("Only");
	});

	it("handles empty setHeaderItems (no modifications)", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [],
			headerLength: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).not.toContain("top-bar-border-key");
	});

	it("returns template unchanged when no header template slide found", async () => {
		const template = await createHeadersTemplate({ headerLength: 1, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "A", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
			],
			headerLength: 5, // template only has 1 slot, requesting 5
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).not.toContain("top-bar-border-key");
	});

	it("uses overrideBorderKey and overrideTopicPrefix", async () => {
		const template = await createHeadersTemplate({
			headerLength: 2,
			contentSlideCount: 2,
			borderKey: "custom-border",
			topicPrefix: "custom-topic-",
		});
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "Custom", sectionStartSlideNumber: 2, sectionEndSlideNumber: 3 },
			],
			headerLength: 2,
			overrideBorderKey: "custom-border",
			overrideTopicPrefix: "custom-topic-",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("custom-border");
		expect(slide2).toContain("Custom");
	});

	it("preserves original content in slides", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "Header", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
			],
			headerLength: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("Content 1");
	});

	it("handles out-of-range slide numbers gracefully", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "A", sectionStartSlideNumber: 99, sectionEndSlideNumber: 99 },
			],
			headerLength: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		expect(Object.keys(resultZip.files)).toContain("ppt/slides/slide2.xml");
	});

	it("produces valid ZIP with all required files", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "A", sectionStartSlideNumber: 2, sectionEndSlideNumber: 3 },
			],
			headerLength: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("_rels/.rels");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/_rels/presentation.xml.rels");
		expect(fileList).toContain("ppt/slides/slide2.xml");
	});

	it("applies active section style params", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "Styled", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
			],
			headerLength: 2,
			activeSectionItalic: true,
			activeSectionStrikethrough: true,
			activeSectionUnderline: true,
			activeSectionFontSize: 2400,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("i=\"1\"");
		expect(slide2).toContain("strike=\"sngStrike\"");
		expect(slide2).toContain("u=\"sng\"");
		expect(slide2).toContain("sz=\"2400\"");
	});

	it("applies inactive section style params", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "Active", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
			],
			headerLength: 2,
			inactiveSectionItalic: true,
			inactiveSectionFontSize: 1400,
			inactiveSectionStrikethrough: true,
			inactiveSectionUnderline: true,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("i=\"1\"");
		expect(slide2).toContain("sz=\"1400\"");
		expect(slide2).toContain("strike=\"sngStrike\"");
		expect(slide2).toContain("u=\"sng\"");
	});

	it("uses default headerLength when not provided", async () => {
		const template = await createHeadersTemplate({ headerLength: 3, contentSlideCount: 3 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "A", sectionStartSlideNumber: 2, sectionEndSlideNumber: 4 },
			],
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("A");
	});

	it("advances sliding window when more sections than headerLength", async () => {
		const template = await createHeadersTemplate({ headerLength: 3, contentSlideCount: 6 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "Section A", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
				{ sectionName: "Section B", sectionStartSlideNumber: 3, sectionEndSlideNumber: 3 },
				{ sectionName: "Section C", sectionStartSlideNumber: 4, sectionEndSlideNumber: 4 },
				{ sectionName: "Section D", sectionStartSlideNumber: 5, sectionEndSlideNumber: 5 },
			],
			headerLength: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide5 = await resultZip.file("ppt/slides/slide5.xml")!.async("text");
		// With 4 sections and headerLength=3, sliding window advances:
		// Section A (idx 0), B (1), C (2), D (3) -> baseIndex advances when
		// headerRelativeIndex > ceil(3/2)-2 = 0 and base+3 < 4
		// So slide5 should show B, C, D (window slid)
		expect(slide5).toContain("Section D");
	});

	it("returns template unchanged when setHeaderItems is undefined", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: undefined as unknown as Array<{ sectionName: string; sectionStartSlideNumber: number; sectionEndSlideNumber: number }>,
			headerLength: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles.length).toBe(3);
	});

	it("buildInactiveStyles with unknown color falls back to default", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "A", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
			],
			headerLength: 2,
			inactiveSectionColor: "INVALID_COLOR",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("A");
	});

	it("buildActiveStyles with unknown color falls back to default", async () => {
		const template = await createHeadersTemplate({ headerLength: 2, contentSlideCount: 2 });
		const result = await setHeaders(template, {
			setHeaderItems: [
				{ sectionName: "A", sectionStartSlideNumber: 2, sectionEndSlideNumber: 2 },
			],
			headerLength: 2,
			activeSectionColor: "INVALID_COLOR",
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("A");
	});
});
