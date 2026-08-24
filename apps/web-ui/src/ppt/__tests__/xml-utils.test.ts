/**
 * xml-utils.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { findShapesByKey, parseXml, serializeXml, findMaxId } from "../xml-utils";

const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";

describe("parseXml", () => {
	it("parses valid XML into a Document", () => {
		const doc = parseXml("<root><child/></root>");
		expect(doc).not.toBeNull();
		expect(doc!.documentElement?.tagName).toBe("root");
	});

	it("returns null for malformed XML", () => {
		const doc = parseXml("not xml");
		expect(doc).toBeNull();
	});

	it("returns null for empty string", () => {
		const doc = parseXml("");
		expect(doc).toBeNull();
	});

	it("handles XML with namespaces", () => {
		const xml = `<p:sld xmlns:p="${NS_P}"><p:cSld/></p:sld>`;
		const doc = parseXml(xml);
		expect(doc).not.toBeNull();
	});

	it("returns null for XML with unclosed tags", () => {
		const doc = parseXml("<root><child>");
		expect(doc).toBeNull();
	});
});

describe("serializeXml", () => {
	it("serializes a Document back to string", () => {
		const doc = parseXml("<root><child/></root>")!;
		const result = serializeXml(doc);
		expect(result).toContain("<root>");
		expect(result).toContain("<child/>");
	});

	it("serialized output can be parsed again", () => {
		const doc = parseXml("<root><child>text</child></root>")!;
		const serialized = serializeXml(doc);
		const reparsed = parseXml(serialized);
		expect(reparsed).not.toBeNull();
	});
});

describe("findShapesByKey", () => {
	const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="${NS_P}" xmlns:a="${NS_A}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="101" name="title-box"/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="102" name="body-box"/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

	it("finds shapes by key name", () => {
		const doc = parseXml(slideXml)!;
		const shapes = findShapesByKey(doc, "title-box");
		expect(shapes).toHaveLength(1);
		expect(shapes[0]!.localName).toBe("sp");
	});

	it("returns empty array for non-matching key", () => {
		const doc = parseXml(slideXml)!;
		const shapes = findShapesByKey(doc, "nonexistent");
		expect(shapes).toEqual([]);
	});

	it("finds multiple shapes with the same key", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="${NS_P}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp><p:nvSpPr><p:cNvPr id="101" name="duplicate-key"/><p:nvPr/></p:nvSpPr></p:sp>
      <p:sp><p:nvSpPr><p:cNvPr id="102" name="duplicate-key"/><p:nvPr/></p:nvSpPr></p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
		const doc = parseXml(xml)!;
		const shapes = findShapesByKey(doc, "duplicate-key");
		expect(shapes).toHaveLength(2);
	});

	it("returns empty array for null document", () => {
		const result = findShapesByKey(null as never, "key");
		expect(result).toEqual([]);
	});

	it("skips cNvPr when its parent chain has no sp (sp null)", () => {
		const xml = `<root xmlns:p="${NS_P}"><p:cNvPr id="99" name="orphan-key"/></root>`;
		const doc = new DOMParser().parseFromString(xml, "text/xml");
		const shapes = findShapesByKey(doc, "orphan-key");
		expect(shapes).toEqual([]);
	});
});

describe("findMaxId", () => {
	it("finds the maximum ID across documents", () => {
		const doc1 = parseXml("<root><el id='10'/><el id='5'/></root>")!;
		const doc2 = parseXml("<root><el id='20'/></root>")!;
		expect(findMaxId(doc1, doc2)).toBe(20);
	});

	it("returns 0 when no IDs exist", () => {
		const doc = parseXml("<root><el/></root>")!;
		expect(findMaxId(doc)).toBe(0);
	});

	it("handles non-numeric ID values gracefully", () => {
		const doc = parseXml("<root><el id='abc'/></root>")!;
		expect(findMaxId(doc)).toBe(0);
	});

	it("handles single document", () => {
		const doc = parseXml("<root><el id='42'/></root>")!;
		expect(findMaxId(doc)).toBe(42);
	});

	it("skips elements with empty string id", () => {
		const doc = parseXml("<root><el id=''/><el id='55'/></root>")!;
		expect(findMaxId(doc)).toBe(55);
	});
});
