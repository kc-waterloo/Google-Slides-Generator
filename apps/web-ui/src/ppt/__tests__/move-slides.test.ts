/**
 * move-slides.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { moveSlides } from "../functions/move-slides";

const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";

const makeShape = (name: string, text: string): string =>
	`<p:sp><p:nvSpPr><p:cNvPr id="4" name="${name}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp>`;

const makeSlide = (shapes: string): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="${NS_A}" xmlns:r="${NS_R}" xmlns:p="${NS_P}">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapes}</p:spTree></p:cSld>
</p:sld>`;

const makeRels = (n: number): string[] => {
	const rels: string[] = [];
	for (let i = 1; i <= n; i++) {
		rels.push(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
	}
	return rels;
};

async function createMoveTemplate(): Promise<ArrayBuffer> {
	const zip = new JSZip();
	const slideCount = 4;

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

	const labels = ["Slide A", "Slide B", "Slide C", "Slide D"];
	for (let i = 1; i <= slideCount; i++) {
		zip.file(`ppt/slides/slide${i}.xml`, makeSlide(makeShape("label", labels[i - 1]!)));
	}

	const rels = makeRels(slideCount);
	for (let i = 1; i <= slideCount; i++) {
		zip.file(`ppt/slides/_rels/slide${i}.xml.rels`, rels[i - 1]!);
	}

	return zip.generateAsync({ type: "arraybuffer" });
}

function getSlideOrder(presXml: string): string[] {
	const idMatch = presXml.match(/r:id="([^"]+)"/g);
	if (!idMatch) return [];
	return idMatch.map((m) => m.replace(/r:id="/, "").replace(/"$/, ""));
}

describe("moveSlides", () => {
	it("moves slides forward (target after source)", async () => {
		const template = await createMoveTemplate();
		// Initial order: A(1) B(2) C(3) D(4)
		// Move slides 2-3 (B,C) to position 5 (after D)
		// Expected order: A(1) D(4) B(2) C(3)

		const result = await moveSlides(template, {
			fromSlideNumber: 2,
			toSlideNumber: 3,
			targetSlideNumber: 5,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);

		expect(order).toHaveLength(4);
		expect(order[0]).toBe("rId1"); // A
		expect(order[1]).toBe("rId4"); // D
		expect(order[2]).toBe("rId2"); // B
		expect(order[3]).toBe("rId3"); // C
	});

	it("moves slides backward (target before source)", async () => {
		const template = await createMoveTemplate();
		// Initial order: A(1) B(2) C(3) D(4)
		// Move slides 3-4 (C,D) to position 1
		// Expected order: C(3) D(4) A(1) B(2)

		const result = await moveSlides(template, {
			fromSlideNumber: 3,
			toSlideNumber: 4,
			targetSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);

		expect(order).toHaveLength(4);
		expect(order[0]).toBe("rId3"); // C
		expect(order[1]).toBe("rId4"); // D
		expect(order[2]).toBe("rId1"); // A
		expect(order[3]).toBe("rId2"); // B
	});

	it("moves a single slide", async () => {
		const template = await createMoveTemplate();
		// Move slide 1 (A) to position 3
		// Expected order: B(2) A(1) C(3) D(4)

		const result = await moveSlides(template, {
			fromSlideNumber: 1,
			toSlideNumber: 1,
			targetSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);

		expect(order[0]).toBe("rId2");
		expect(order[1]).toBe("rId1");
		expect(order[2]).toBe("rId3");
		expect(order[3]).toBe("rId4");
	});

	it("returns template unchanged when fromSlideNumber > toSlideNumber", async () => {
		const template = await createMoveTemplate();

		const result = await moveSlides(template, {
			fromSlideNumber: 4,
			toSlideNumber: 2,
			targetSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);

		expect(order[0]).toBe("rId1");
		expect(order[1]).toBe("rId2");
		expect(order[2]).toBe("rId3");
		expect(order[3]).toBe("rId4");
	});

	it("handles range beyond available slides", async () => {
		const template = await createMoveTemplate();
		// Try to move slides 3-99 (only 3 and 4 exist)

		const result = await moveSlides(template, {
			fromSlideNumber: 3,
			toSlideNumber: 99,
			targetSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);

		expect(order).toHaveLength(4);
		// Slides 3-4 moved to beginning -> C(3) D(4) A(1) B(2)
		expect(order[0]).toBe("rId3");
		expect(order[1]).toBe("rId4");
	});

	it("moves slides to the end of the presentation", async () => {
		const template = await createMoveTemplate();
		// Move slides 1-2 (A,B) to position 100 (end)
		// Expected order: C(3) D(4) A(1) B(2)

		const result = await moveSlides(template, {
			fromSlideNumber: 1,
			toSlideNumber: 2,
			targetSlideNumber: 100,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);

		expect(order[0]).toBe("rId3");
		expect(order[1]).toBe("rId4");
		expect(order[2]).toBe("rId1");
		expect(order[3]).toBe("rId2");
	});

	it("preserves other ZIP file structure", async () => {
		const template = await createMoveTemplate();

		const result = await moveSlides(template, {
			fromSlideNumber: 2,
			toSlideNumber: 3,
			targetSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const fileList = Object.keys(resultZip.files);
		expect(fileList).toContain("[Content_Types].xml");
		expect(fileList).toContain("_rels/.rels");
		expect(fileList).toContain("ppt/presentation.xml");
		expect(fileList).toContain("ppt/_rels/presentation.xml.rels");
		expect(fileList).toContain("ppt/slides/slide1.xml");
		expect(fileList).toContain("ppt/slides/slide2.xml");
		expect(fileList).toContain("ppt/slides/slide3.xml");
		expect(fileList).toContain("ppt/slides/slide4.xml");
	});

	it("preserves total slide count", async () => {
		const template = await createMoveTemplate();

		const result = await moveSlides(template, {
			fromSlideNumber: 1,
			toSlideNumber: 2,
			targetSlideNumber: 4,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);

		expect(order).toHaveLength(4);
	});

	it("returns template unchanged when fromSlide exceeds slide count", async () => {
		const template = await createMoveTemplate();
		const result = await moveSlides(template, {
			fromSlideNumber: 10,
			toSlideNumber: 12,
			targetSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);
		expect(order).toHaveLength(4);
		expect(order[0]).toBe("rId1");
	});

	it("returns template unchanged when params is null", async () => {
		const template = await createMoveTemplate();
		const result = await moveSlides(template, null as never);

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);
		expect(order).toHaveLength(4);
	});

	it("returns template unchanged when presentation has no slides (empty sldIdLst)", async () => {
		const zip = new JSZip();
		zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
</Types>`);
		zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);
		zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="${NS_P}" xmlns:r="${NS_R}">
  <p:sldIdLst>
  </p:sldIdLst>
</p:presentation>`);
		zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);
		const buffer = await zip.generateAsync({ type: "arraybuffer" });

		const result = await moveSlides(buffer, {
			fromSlideNumber: 1,
			toSlideNumber: 1,
			targetSlideNumber: 1,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		expect(presXml).toContain("sldIdLst");
	});

	it("move slides target inside the moved range does not crash", async () => {
		const template = await createMoveTemplate();
		const result = await moveSlides(template, {
			fromSlideNumber: 2,
			toSlideNumber: 4,
			targetSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);
		expect(order).toHaveLength(4);
	});

	it("rejects fromSlideNumber 0 (slide numbers must be >= 1)", async () => {
		const template = await createMoveTemplate();
		const result = await moveSlides(template, {
			fromSlideNumber: 0,
			toSlideNumber: 1,
			targetSlideNumber: 3,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);
		expect(order).toEqual(["rId1", "rId2", "rId3", "rId4"]);
	});

	it("rejects targetSlideNumber 0 (slide numbers must be >= 1)", async () => {
		const template = await createMoveTemplate();
		const result = await moveSlides(template, {
			fromSlideNumber: 3,
			toSlideNumber: 4,
			targetSlideNumber: 0,
		});

		const resultZip = await JSZip.loadAsync(result);
		const presXml = await resultZip.file("ppt/presentation.xml")!.async("text");
		const order = getSlideOrder(presXml);
		expect(order).toEqual(["rId1", "rId2", "rId3", "rId4"]);
	});

	it("throws descriptive error when presentation.xml is missing from ZIP", async () => {
		const zip = new JSZip();
		zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
</Types>`);
		zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);
		const buffer = await zip.generateAsync({ type: "arraybuffer" });

		await expect(moveSlides(buffer, {
			fromSlideNumber: 1,
			toSlideNumber: 1,
			targetSlideNumber: 1,
		})).rejects.toThrow("Missing required file in template: ppt/presentation.xml");
	});
});
