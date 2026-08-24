/**
 * batch-replace-text.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { batchReplaceText, type BatchReplaceTextParams } from "../functions/batch-replace-text";

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

async function createBatchReplaceTemplate(slideCount: number): Promise<ArrayBuffer> {
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
			makeShape("text-box", `Hello foo ${i} bar`, 457200),
		));
		zip.file(`ppt/slides/_rels/slide${i}.xml.rels`,
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
	}

	return zip.generateAsync({ type: "arraybuffer" });
}

describe("batchReplaceText", () => {
	it("replaces text on slides within the given range", async () => {
		const template = await createBatchReplaceTemplate(3);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "foo", newText: "bar" }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		for (let i = 1; i <= 3; i++) {
			const slide = await resultZip.file(`ppt/slides/slide${i}.xml`)!.async("text");
			expect(slide).not.toContain("foo");
			expect(slide).toContain("bar");
		}
	});

	it("only targets slides within the specified range", async () => {
		const template = await createBatchReplaceTemplate(4);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "foo", newText: "bar" }],
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide2 = await resultZip.file("ppt/slides/slide2.xml")!.async("text");
		expect(slide2).toContain("foo");
		const slide3 = await resultZip.file("ppt/slides/slide3.xml")!.async("text");
		expect(slide3).toContain("bar");
	});

	it("handles case-insensitive replacement by default", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "FOO", newText: "baz" }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("baz");
		expect(slide1).not.toContain("foo");
	});

	it("respects case-sensitive matching when matchCase is true", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "FOO", newText: "baz" }],
			matchCase: true,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("foo");
		expect(slide1).not.toContain("baz");
	});

	it("does nothing with empty replacements array", async () => {
		const template = await createBatchReplaceTemplate(2);
		const result = await batchReplaceText(template, {
			replacements: [],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("foo");
	});

	it("does nothing when lowerBound exceeds upperBound", async () => {
		const template = await createBatchReplaceTemplate(2);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "foo", newText: "bar" }],
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("foo");
	});

	it("handles multiple replacement pairs", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, {
			replacements: [
				{ oldText: "foo", newText: "first" },
				{ oldText: "Hello", newText: "Hi" },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("first");
		expect(slide1).toContain("Hi");
	});

	it("produces valid ZIP with all required files", async () => {
		const template = await createBatchReplaceTemplate(2);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "foo", newText: "bar" }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
		});

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("_rels/.rels");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/slides/slide1.xml");
	});

	it("handles empty oldText gracefully", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "", newText: "replacement" }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("foo");
	});

	it("handles empty newText by removing oldText", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "foo", newText: "" }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).not.toContain("foo");
	});

	it("performs case-sensitive replacement when matchCase is true", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "Foo", newText: "Replaced" }],
			matchCase: true,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		// "Foo" (uppercase) should not match "foo" (lowercase) in match-case mode
		expect(slide1).toContain("foo");
		expect(slide1).not.toContain("Replaced");
	});

	it("returns template unchanged when no slides in range", async () => {
		const template = await createBatchReplaceTemplate(2);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "foo", newText: "bar" }],
			lowerBoundSlideNumber: 10,
			upperBoundSlideNumber: 20,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slideFiles = Object.keys(resultZip.files).filter((k) =>
			k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
		);
		expect(slideFiles).toHaveLength(2);
	});

	it("performs case-insensitive replacement by default (matchCase false)", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "Foo", newText: "Replaced" }],
			matchCase: false,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("Replaced");
		expect(slide1).not.toContain("foo");
	});

	it("handles empty oldText with matchCase true (replaceAllCase branch)", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "", newText: "nope" }],
			matchCase: true,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("foo");
	});

	it("handles missing replacements param (falls back to empty array)", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, {
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		} as BatchReplaceTextParams);

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("foo");
	});

	it("uses defaults when lowerBound and upperBound are omitted", async () => {
		const template = await createBatchReplaceTemplate(2);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "foo", newText: "bar" }],
		} as BatchReplaceTextParams);

		const resultZip = await JSZip.loadAsync(result);
		for (let i = 1; i <= 2; i++) {
			const slide = await resultZip.file(`ppt/slides/slide${i}.xml`)!.async("text");
			expect(slide).not.toContain("foo");
			expect(slide).toContain("bar");
		}
	});

	it("returns template unchanged when params is null", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, null as never);

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("foo");
	});

	it("returns template unchanged when params is undefined", async () => {
		const template = await createBatchReplaceTemplate(1);
		const result = await batchReplaceText(template, undefined as never);

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("foo");
	});

	it("handles range beyond available slide files (missing slide XML)", async () => {
		const template = await createBatchReplaceTemplate(2);
		const result = await batchReplaceText(template, {
			replacements: [{ oldText: "foo", newText: "bar" }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const resultZip = await JSZip.loadAsync(result);
		for (let i = 1; i <= 2; i++) {
			const slide = await resultZip.file(`ppt/slides/slide${i}.xml`)!.async("text");
			expect(slide).toContain("bar");
		}
	});

	it("preserves slides with empty a:t elements (no textContent)", async () => {
		const zip = new JSZip();
		zip.file("[Content_Types].xml", makeContentType(1));
		zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);
		zip.file("ppt/presentation.xml", makePresentation(1));
		zip.file("ppt/_rels/presentation.xml.rels", makeRelsFile(1));
		const emptyA = makeSlide(
			`<p:sp>
    <p:nvSpPr>
      <p:cNvPr id="4" name="text-box"/>
      <p:cNvSpPr txBox="1"/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr/>
    <p:txBody>
      <a:bodyPr/>
      <a:p>
        <a:r>
          <a:t></a:t>
        </a:r>
      </a:p>
    </p:txBody>
  </p:sp>`,
		);
		zip.file("ppt/slides/slide1.xml", emptyA);
		zip.file("ppt/slides/_rels/slide1.xml.rels",
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
		const buffer = await zip.generateAsync({ type: "arraybuffer" });

		const result = await batchReplaceText(buffer, {
			replacements: [{ oldText: "foo", newText: "bar" }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("<a:t>");
	});

	it("handles malformed slide XML gracefully", async () => {
		const zip = new JSZip();
		zip.file("[Content_Types].xml", makeContentType(1));
		zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);
		zip.file("ppt/presentation.xml", makePresentation(1));
		zip.file("ppt/_rels/presentation.xml.rels", makeRelsFile(1));
		zip.file("ppt/slides/slide1.xml", "NOT VALID XML at all <<!!>>");
		zip.file("ppt/slides/_rels/slide1.xml.rels",
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
		const buffer = await zip.generateAsync({ type: "arraybuffer" });

		const result = await batchReplaceText(buffer, {
			replacements: [{ oldText: "foo", newText: "bar" }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const slide1 = await resultZip.file("ppt/slides/slide1.xml")!.async("text");
		expect(slide1).toContain("NOT VALID XML");
	});
});
