/**
 * duplicate-slide-generator.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { createDuplicateSlideGenerator } from "../functions/duplicate-slide-generator";

const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";

const makeShape = (name: string, text: string, id: number): string =>
	`<p:sp xmlns:p="${NS_P}">
    <p:nvSpPr>
      <p:cNvPr id="${id}" name="${name}"/>
      <p:cNvSpPr txBox="1"/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr>
      <a:xfrm xmlns:a="${NS_A}">
        <a:off x="457200" y="457200"/>
        <a:ext cx="8229600" cy="370840"/>
      </a:xfrm>
    </p:spPr>
    <p:txBody>
      <a:bodyPr/>
      <a:p>
        <a:r>
          <a:t>${text}</a:t>
        </a:r>
      </a:p>
    </p:txBody>
  </p:sp>`;

const makeSourceSlide = (): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="${NS_P}" xmlns:a="${NS_A}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      ${makeShape("title-text-box", "Title", 101)}
      ${makeShape("body-text-box", "Body content", 102)}
    </p:spTree>
  </p:cSld>
</p:sld>`;

describe("createDuplicateSlideGenerator", () => {
	it("returns empty array for count 0", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box"], 0);
		expect(result).toEqual([]);
	});

	it("returns empty array for negative count", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box"], -1);
		expect(result).toEqual([]);
	});

	it("returns single slide when count is 1", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box"], 1);
		expect(result).toHaveLength(1);
		expect(result[0]).toContain("Title");
	});

	it("generates correct number of duplicate slides", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box"], 5);
		expect(result).toHaveLength(5);
	});

	it("all generated slides contain the cloned shapes", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box", "body-text-box"], 3);
		for (const slide of result) {
			expect(slide).toContain("title-text-box");
			expect(slide).toContain("body-text-box");
			expect(slide).toContain("Title");
			expect(slide).toContain("Body content");
		}
	});

	it("does not include shapes not in the keys list", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box"], 2);
		for (const slide of result) {
			expect(slide).toContain("title-text-box");
			expect(slide).not.toContain("body-text-box");
		}
	});

	it("each slide has unique IDs within each slide (no duplicates in a single slide)", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box", "body-text-box"], 5);
		for (const slide of result) {
			const matches = slide.match(/id="(\d+)"/g) ?? [];
			const ids = matches.map((m) => parseInt(m.match(/"(\d+)"/)![1]!, 10));
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		}
	});

	it("IDs are monotonically increasing across slides (next slide IDs > previous)", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box", "body-text-box"], 5);
		const maxIds = result.map((slide) => {
			const matches = slide.match(/id="(\d+)"/g) ?? [];
			const ids = matches.map((m) => parseInt(m.match(/"(\d+)"/)![1]!, 10));
			return Math.max(...ids, 0);
		});
		for (let i = 1; i < maxIds.length; i++) {
			expect(maxIds[i]!).toBeGreaterThan(maxIds[i - 1]!);
		}
	});

	it("handles empty keys array: returns slides with no cloned shapes", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), [], 3);
		expect(result).toHaveLength(3);
		for (const slide of result) {
			expect(slide).not.toContain("title-text-box");
		}
	});

	it("handles malformed source XML", () => {
		const result = createDuplicateSlideGenerator("not xml", ["title-text-box"], 3);
		expect(result).toHaveLength(3);
	});

	it("handles source with no spTree", () => {
		const noSpTree = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="${NS_P}">
  <p:cSld>
  </p:cSld>
</p:sld>`;
		const result = createDuplicateSlideGenerator(noSpTree, ["title-text-box"], 3);
		expect(result).toHaveLength(3);
	});

	it("handles keys that match no shapes", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["nonexistent"], 3);
		expect(result).toHaveLength(3);
		for (const slide of result) {
			expect(slide).not.toContain("title-text-box");
		}
	});

	it("each slide is well-formed XML with single root", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box"], 3);
		for (const slide of result) {
			expect(slide).toContain("<p:sld");
			expect(slide).toContain("</p:sld>");
			expect(slide.match(/<p:sld/g)).toHaveLength(1);
		}
	});

	it("the first slide matches cloning directly into MINIMAL_SLIDE_SHELL", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box"], 3);
		expect(result[0]).toContain("Title");
		expect(result[1]).toContain("Title");
		expect(result[2]).toContain("Title");
	});

	it("slides are independently mutable (modifying one does not affect others)", () => {
		const result = createDuplicateSlideGenerator(makeSourceSlide(), ["title-text-box"], 2);
		const modified = result[0]!.replace("Title", "Changed");
		expect(modified).toContain("Changed");
		expect(result[1]).toContain("Title");
	});

	it("accepts themeOverride option and remaps scheme colors", () => {
		const sourceWithScheme = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="${NS_P}" xmlns:a="${NS_A}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="101" name="title-text-box"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:solidFill>
            <a:schemeClr val="accent1"/>
          </a:solidFill>
        </p:spPr>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
		const result = createDuplicateSlideGenerator(
			sourceWithScheme,
			["title-text-box"],
			2,
			{ themeOverride: { accent1: "FF0000" } },
		);
		for (const slide of result) {
			expect(slide).not.toContain("schemeClr");
			expect(slide).toContain("srgbClr");
			expect(slide).toContain("val=\"FF0000\"");
		}
	});

	it("uses countIdsInElement fallback when cloned shape has no id attributes", () => {
		const noIdShape = `<p:sp xmlns:p="${NS_P}">
    <p:nvSpPr>
      <p:cNvPr name="no-id-shape"/>
      <p:cNvSpPr txBox="1"/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr/>
  </p:sp>`;

		const source = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="${NS_P}" xmlns:a="${NS_A}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      ${noIdShape}
    </p:spTree>
  </p:cSld>
</p:sld>`;

		const result = createDuplicateSlideGenerator(source, ["no-id-shape"], 2);
		expect(result).toHaveLength(2);
		for (const slide of result) {
			expect(slide).toContain("no-id-shape");
		}
	});

	it("does not apply themeOverride when not provided", () => {
		const sourceWithScheme = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="${NS_P}" xmlns:a="${NS_A}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="101" name="title-text-box"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:solidFill>
            <a:schemeClr val="accent1"/>
          </a:solidFill>
        </p:spPr>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
		const result = createDuplicateSlideGenerator(sourceWithScheme, ["title-text-box"], 1);
		expect(result[0]).toContain("schemeClr");
		expect(result[0]).not.toContain("srgbClr");
	});
});
