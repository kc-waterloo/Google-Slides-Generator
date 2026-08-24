/**
 * functions-edge-cases.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { createBulletSlide } from "../functions/create-bullet-slide";
import { createSummarySlide } from "../functions/create-summary-slide";
import { createShortQuotesSlides } from "../functions/create-short-quotes-slides";
import { createLongQuotesSlides } from "../functions/create-long-quotes-slides";
import { createHighlightVariationSlides } from "../functions/create-highlight-variation-slides";
import { setHeaders } from "../functions/set-headers";
import { batchReplaceText } from "../functions/batch-replace-text";
import { batchSetTextStyle } from "../functions/batch-set-text-style";
import { duplicateSlideRange } from "../functions/duplicate-slide-range";
import { moveSlides } from "../functions/move-slides";
import { applyBackgroundColor } from "../functions/apply-background-color";

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

async function createMinimalTemplate(): Promise<ArrayBuffer> {
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
		makeShape("bullet-title-text-box", "Default", 457200) +
		makeShape("bullet-point-1-text", "Bullet", 1371600),
	));

	zip.file("ppt/slides/_rels/slide1.xml.rels", makeRels());

	return zip.generateAsync({ type: "arraybuffer" });
}

const slideCountAssertion = async (fn: (b: ArrayBuffer, p: never) => Promise<ArrayBuffer>, param: never): Promise<void> => {
	const buffer = await createMinimalTemplate();
	const result = await fn(buffer, param);
	const resultZip = await JSZip.loadAsync(result);
	const slideFiles = Object.keys(resultZip.files).filter((k) =>
		k.startsWith("ppt/slides/slide") && k.endsWith(".xml") && !k.includes("_rels"),
	);
	expect(slideFiles).toHaveLength(1);
};

const edgeCaseFns: Array<{ name: string; fn: (b: ArrayBuffer, p: never) => Promise<ArrayBuffer> }> = [
	{ name: "createBulletSlide", fn: createBulletSlide as never },
	{ name: "createSummarySlide", fn: createSummarySlide as never },
	{ name: "createShortQuotesSlides", fn: createShortQuotesSlides as never },
	{ name: "createLongQuotesSlides", fn: createLongQuotesSlides as never },
	{ name: "setHeaders", fn: setHeaders as never },
	{ name: "batchReplaceText", fn: batchReplaceText as never },
	{ name: "batchSetTextStyle", fn: batchSetTextStyle as never },
	{ name: "duplicateSlideRange", fn: duplicateSlideRange as never },
	{ name: "moveSlides", fn: moveSlides as never },
	{ name: "applyBackgroundColor", fn: applyBackgroundColor as never },
	{ name: "createHighlightVariationSlides", fn: createHighlightVariationSlides as never },
];

const scalarParamFns = edgeCaseFns.filter(
	({ name }) => name !== "duplicateSlideRange",
);

describe.each(edgeCaseFns)("$name edge cases", ({ fn }) => {
	it("returns buffer unchanged when params is null", async () => {
		await slideCountAssertion(fn, null as never);
	});

	it("returns buffer unchanged when params is undefined", async () => {
		await slideCountAssertion(fn, undefined as never);
	});
});

describe.each(scalarParamFns)("$name NaN/Infinity params", ({ fn }) => {
	it("returns buffer unchanged when params is NaN", async () => {
		await slideCountAssertion(fn, NaN as never);
	});

	it("returns buffer unchanged when params is Infinity", async () => {
		await slideCountAssertion(fn, Infinity as never);
	});
});
