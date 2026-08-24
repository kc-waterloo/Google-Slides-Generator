/**
 * slide-cloner.test.ts
 *
 * Created by Min-Kyu Lee on 30-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { cloneShapesIntoSlide, SlideClonerBuilder, applyThemeOverride, countIdsInElement, reassignIdsSequential } from "./slide-cloner";

const SOURCE_SLIDE = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="101" name="title-text-box"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="914400" y="685800"/>
            <a:ext cx="8229600" cy="1371600"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:rPr sz="4400" b="1"/>
              <a:t>Title Text</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="102" name="quote-text-box"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="914400" y="2286000"/>
            <a:ext cx="8229600" cy="1371600"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:t>Quote text</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

const TARGET_SLIDE = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="200" name="existing-shape"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="0" y="0"/>
            <a:ext cx="100" cy="100"/>
          </a:xfrm>
        </p:spPr>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

const xml = (s: string): string => s.replace(/>\s+</g, "><").trim();

describe("cloneShapesIntoSlide", () => {
	it("clones a single shape by key into target slide", () => {
		const result = cloneShapesIntoSlide(SOURCE_SLIDE, TARGET_SLIDE, ["quote-text-box"]);

		expect(result).toContain("quote-text-box");
		expect(result).toContain("existing-shape");
		expect(result).toContain("Quote text");
	});

	it("preserves all existing shapes in the target", () => {
		const result = cloneShapesIntoSlide(SOURCE_SLIDE, TARGET_SLIDE, ["title-text-box"]);

		expect(result).toContain("existing-shape");
		expect(result).toContain("Title Text");
	});

	it("skips shapes whose keys are not in the requested list", () => {
		const result = cloneShapesIntoSlide(SOURCE_SLIDE, TARGET_SLIDE, ["quote-text-box"]);

		expect(result).not.toContain("Title Text");
	});

	it("returns target unchanged when no keys match", () => {
		const result = cloneShapesIntoSlide(SOURCE_SLIDE, TARGET_SLIDE, ["nonexistent-key"]);

		expect(xml(result)).toBe(xml(TARGET_SLIDE));
	});

	it("assigns unique IDs to cloned shapes to avoid collision", () => {
		const result = cloneShapesIntoSlide(SOURCE_SLIDE, TARGET_SLIDE, ["title-text-box", "quote-text-box"]);

		const idMatches = result.match(/id="(\d+)"/g) ?? [];
		const ids = idMatches.map((m) => parseInt(m.match(/"(\d+)"/)![1]!, 10));
		const uniqueIds = new Set(ids);

		expect(uniqueIds.size).toBe(ids.length);
	});

	it("cloned shapes have cNvPr id higher than any existing ID", () => {
		const sourceMaxId = SOURCE_SLIDE.match(/id="(\d+)"/g)!
			.map((m) => parseInt(m.match(/\d+/)![0]!, 10))
			.reduce((a, b) => Math.max(a, b), 0);
		const targetMaxId = TARGET_SLIDE.match(/id="(\d+)"/g)!
			.map((m) => parseInt(m.match(/\d+/)![0]!, 10))
			.reduce((a, b) => Math.max(a, b), 0);
		const maxExistingId = Math.max(sourceMaxId, targetMaxId);

		const result = cloneShapesIntoSlide(SOURCE_SLIDE, TARGET_SLIDE, ["title-text-box"]);

		const clonedIdMatch = result.match(/id="(\d+)"/g)!.find((m) => {
			const id = parseInt(m.match(/\d+/)![0]!, 10);
			return id > maxExistingId;
		});
		expect(clonedIdMatch).toBeTruthy();
	});

	it("clones multiple shapes in a single call", () => {
		const result = cloneShapesIntoSlide(SOURCE_SLIDE, TARGET_SLIDE, ["title-text-box", "quote-text-box"]);

		expect(result).toContain("Title Text");
		expect(result).toContain("Quote text");
		expect(result).toContain("existing-shape");
	});

	it("does not mutate the source slide XML", () => {
		const original = SOURCE_SLIDE;
		cloneShapesIntoSlide(SOURCE_SLIDE, TARGET_SLIDE, ["title-text-box"]);

		expect(SOURCE_SLIDE).toBe(original);
	});

	it("output is well-formed XML with single root element", () => {
		const result = cloneShapesIntoSlide(SOURCE_SLIDE, TARGET_SLIDE, ["quote-text-box"]);

		expect(result).toContain("<p:sld");
		expect(result).toContain("</p:sld>");
		expect(result.match(/<p:sld/g)).toHaveLength(1);
	});

	it("handles empty keys array: returns target unchanged", () => {
		const result = cloneShapesIntoSlide(SOURCE_SLIDE, TARGET_SLIDE, []);
		expect(result).toBe(TARGET_SLIDE);
	});

	it("handles malformed source XML: returns target unchanged", () => {
		const result = cloneShapesIntoSlide("not xml", TARGET_SLIDE, ["title-text-box"]);
		expect(result).toBe(TARGET_SLIDE);
	});

	it("handles malformed target XML: returns target unchanged", () => {
		const result = cloneShapesIntoSlide(SOURCE_SLIDE, "not xml", ["title-text-box"]);
		expect(result).toBe("not xml");
	});

	it("handles source with no spTree element: returns target unchanged", () => {
		const noSpTreeSlide = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
  </p:cSld>
</p:sld>`;
		const result = cloneShapesIntoSlide(noSpTreeSlide, TARGET_SLIDE, ["title-text-box"]);
		expect(result).toBe(TARGET_SLIDE);
	});

	it("accepts themeOverride and remaps schemeClr to srgbClr", () => {
		const SOURCE_WITH_SCHEME = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="101" name="title-text-box"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:solidFill><a:schemeClr val="accent1"/></a:solidFill>
        </p:spPr>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
		const result = cloneShapesIntoSlide(SOURCE_WITH_SCHEME, TARGET_SLIDE, ["title-text-box"], {
			themeOverride: { accent1: "FF0000" },
		});
		expect(result).not.toContain("schemeClr");
		expect(result).toContain("srgbClr");
		expect(result).toContain("val=\"FF0000\"");
	});

	it("skips shapes with no name attribute when a named key is requested", () => {
		const noNameShape = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="101"/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
		const result = cloneShapesIntoSlide(noNameShape, TARGET_SLIDE, ["title-text-box"]);
		expect(result).toBe(TARGET_SLIDE);
	});

	it("does NOT remap theme colors when themeOverride is empty", () => {
		const SOURCE_WITH_SCHEME = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="101" name="title-text-box"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:solidFill><a:schemeClr val="accent1"/></a:solidFill>
        </p:spPr>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
		const result = cloneShapesIntoSlide(SOURCE_WITH_SCHEME, TARGET_SLIDE, ["title-text-box"]);
		expect(result).toContain("schemeClr");
		expect(result).not.toContain("srgbClr");
	});
});

describe("SlideClonerBuilder", () => {
	it("clones shapes via builder pattern", () => {
		const result = new SlideClonerBuilder()
			.withSourceXml(SOURCE_SLIDE)
			.withTargetXml(TARGET_SLIDE)
			.withKeys(["quote-text-box"])
			.clone();
		expect(result).toContain("Quote text");
		expect(result).toContain("existing-shape");
	});

	it("builder with themeOverride remaps scheme colors", () => {
		const SOURCE_WITH_SCHEME = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="101" name="title-text-box"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:solidFill><a:schemeClr val="accent1"/></a:solidFill>
        </p:spPr>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
		const result = new SlideClonerBuilder()
			.withSourceXml(SOURCE_WITH_SCHEME)
			.withTargetXml(TARGET_SLIDE)
			.withKeys(["title-text-box"])
			.withThemeOverride({ accent1: "00FF00" })
			.clone();
		expect(result).not.toContain("schemeClr");
		expect(result).toContain("val=\"00FF00\"");
	});

	it("builder with no keys returns target unchanged", () => {
		const result = new SlideClonerBuilder()
			.withSourceXml(SOURCE_SLIDE)
			.withTargetXml(TARGET_SLIDE)
			.withKeys([])
			.clone();
		expect(xml(result)).toBe(xml(TARGET_SLIDE));
	});

	it("builder is chainable (returns same instance)", () => {
		const builder = new SlideClonerBuilder();
		const chainResult = builder.withSourceXml(SOURCE_SLIDE).withTargetXml(TARGET_SLIDE).withKeys(["title-text-box"]);
		expect(chainResult).toBe(builder);
	});

	it("builder clones multiple shapes", () => {
		const result = new SlideClonerBuilder()
			.withSourceXml(SOURCE_SLIDE)
			.withTargetXml(TARGET_SLIDE)
			.withKeys(["title-text-box", "quote-text-box"])
			.clone();
		expect(result).toContain("Title Text");
		expect(result).toContain("Quote text");
		expect(result).toContain("existing-shape");
	});
});

describe("applyThemeOverride", () => {
	it("replaces schemeClr with srgbClr for matching override", () => {
		const xml = "<root xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\"><a:solidFill><a:schemeClr val=\"accent1\"/></a:solidFill></root>";
		const doc = new DOMParser().parseFromString(xml, "text/xml");
		applyThemeOverride(doc, { accent1: "FF0000" });
		const result = new XMLSerializer().serializeToString(doc);
		expect(result).not.toContain("schemeClr");
		expect(result).toContain("srgbClr");
	});

	it("leaves schemeClr unchanged for non-matching override", () => {
		const xml = "<root xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\"><a:solidFill><a:schemeClr val=\"accent1\"/></a:solidFill></root>";
		const doc = new DOMParser().parseFromString(xml, "text/xml");
		applyThemeOverride(doc, { accent2: "00FF00" });
		const result = new XMLSerializer().serializeToString(doc);
		expect(result).toContain("schemeClr");
		expect(result).not.toContain("srgbClr");
	});

	it("handles document with no schemeClr elements", () => {
		const xml = "<root xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\"><a:solidFill><a:srgbClr val=\"FF0000\"/></a:solidFill></root>";
		const doc = new DOMParser().parseFromString(xml, "text/xml");
		expect(() => applyThemeOverride(doc, { accent1: "FF0000" })).not.toThrow();
	});
});

describe("countIdsInElement", () => {
	it("counts elements with id attribute", () => {
		const xml = "<root><el id=\"1\"/><el id=\"2\"/><el/></root>";
		const doc = new DOMParser().parseFromString(xml, "text/xml");
		expect(countIdsInElement(doc.documentElement)).toBe(2);
	});

	it("returns 0 when no elements have id", () => {
		const xml = "<root><el/><el/></root>";
		const doc = new DOMParser().parseFromString(xml, "text/xml");
		expect(countIdsInElement(doc.documentElement)).toBe(0);
	});
});

describe("reassignIdsSequential", () => {
	it("reassigns IDs starting from the given number", () => {
		const xml = "<root><el id=\"100\"/><el id=\"200\"/></root>";
		const doc = new DOMParser().parseFromString(xml, "text/xml");
		reassignIdsSequential(doc.documentElement, 1);
		const els = doc.documentElement.querySelectorAll("[id]");
		expect(els[0]!.getAttribute("id")).toBe("1");
		expect(els[1]!.getAttribute("id")).toBe("2");
	});

	it("handles element with no id children", () => {
		const xml = "<root><el/><el/></root>";
		const doc = new DOMParser().parseFromString(xml, "text/xml");
		expect(() => reassignIdsSequential(doc.documentElement, 1)).not.toThrow();
	});

	it("uses fallback of 1 when cloned shape has no id-bearing children", () => {
		const sourceNoIds = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr name="no-id-shape"/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
		const target = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
    </p:spTree>
  </p:cSld>
</p:sld>`;
		const result = cloneShapesIntoSlide(sourceNoIds, target, ["no-id-shape"]);
		expect(result).toContain("no-id-shape");
	});

	it("reassigns IDs with a shape that has multiple id attributes", () => {
		const xml = "<root><el id=\"10\"/><el id=\"20\" extra-id=\"30\"/></root>";
		const doc = new DOMParser().parseFromString(xml, "text/xml");
		reassignIdsSequential(doc.documentElement, 100);
		const els = doc.documentElement.querySelectorAll("[id]");
		expect(els[0]!.getAttribute("id")).toBe("100");
		expect(els[1]!.getAttribute("id")).toBe("101");
	});
});
