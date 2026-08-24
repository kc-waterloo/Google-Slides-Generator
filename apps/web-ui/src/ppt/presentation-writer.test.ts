/**
 * presentation-writer.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { addSlideToPresentation } from "./presentation-writer";

const PRESENTATION_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId2"/>
    <p:sldId id="257" r:id="rId3"/>
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;

const PRESENTATION_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
</Relationships>`;

const slideRelsXmls: string[] = [
	`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`,
	`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`,
];

describe("addSlideToPresentation", () => {
	it("adds a new sldId entry to presentation.xml", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		const sldIdCount = (result.presentationXml.match(/<p:sldId /g) ?? []).length;
		expect(sldIdCount).toBe(3);
	});

	it("adds a new Override entry to [Content_Types].xml", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		const slideCount = (result.contentTypeXml.match(/slides\//g) ?? []).length;
		expect(slideCount).toBe(3);
	});

	it("adds a new Relationship entry to presentation.xml.rels", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		const slideRelCount = (result.presentationRelsXml.match(/slides\/slide/g) ?? []).length;
		expect(slideRelCount).toBe(3);
	});

	it("returns additional slide rels XMLs for new slides", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		expect(result.slideRelsXmls).toHaveLength(3);
	});

	it("adds multiple slides in a single call", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 3,
		});

		const sldIdCount = (result.presentationXml.match(/<p:sldId /g) ?? []).length;
		expect(sldIdCount).toBe(5);

		const slideRelCount = (result.presentationRelsXml.match(/slides\/slide/g) ?? []).length;
		expect(slideRelCount).toBe(5);

		const slideCtypeCount = (result.contentTypeXml.match(/slides\//g) ?? []).length;
		expect(slideCtypeCount).toBe(5);

		expect(result.slideRelsXmls).toHaveLength(5);
	});

	it("uses sequential rIds for new slide relationships", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 2,
		});

		const rIdMatches = result.presentationRelsXml.match(/rId\d+/g) ?? [];
		const maxNum = Math.max(...rIdMatches.map((s) => parseInt(s.slice(3), 10)));
		expect(rIdMatches).toContain(`rId${maxNum}`);
	});

	it("uses sequential sldId values starting above existing max", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		const idMatches = result.presentationXml.match(/id="(\d+)"/g) ?? [];
		const nums = idMatches.map((m) => parseInt(m.match(/\d+/)![0]!, 10));
		const maxId = Math.max(...nums);
		expect(maxId).toBeGreaterThan(257);
	});

	it("output XMLs are well-formed", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		const xmlKeys = ["presentationXml", "contentTypeXml", "presentationRelsXml"] as const;
		for (const key of xmlKeys) {
			const str = result[key];
			expect(str).toContain("<");
			expect(str).toContain(">");
		}
	});

	it("uses template slide rels for new slides", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 2,
		});

		expect(result.slideRelsXmls[2]).toBe(slideRelsXmls[0]);
		expect(result.slideRelsXmls[3]).toBe(slideRelsXmls[0]);
	});

	it("handles newSlideCount of 0: returns input unchanged", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 0,
		});

		expect(result.presentationXml).toBe(PRESENTATION_XML);
		expect(result.contentTypeXml).toBe(CONTENT_TYPES_XML);
		expect(result.relsXml).toBe(RELS_XML);
		expect(result.presentationRelsXml).toBe(PRESENTATION_RELS_XML);
		expect(result.slideRelsXmls).toBe(slideRelsXmls);
	});

	it("handles malformed presentation XML: returns input unchanged", () => {
		const result = addSlideToPresentation({
			presentationXml: "not xml",
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		expect(result.presentationXml).toBe("not xml");
		expect(result.contentTypeXml).toBe(CONTENT_TYPES_XML);
	});

	it("handles malformed contentType XML: returns input unchanged", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: "bad xml",
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		expect(result.contentTypeXml).toBe("bad xml");
	});

	it("handles malformed presentationRels XML: returns input unchanged", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: "broken",
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		expect(result.presentationRelsXml).toBe("broken");
	});

	it("handles missing sldIdLst in presentation XML: returns input unchanged", () => {
		const noSldIdXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldSz cx="12192000" cy="6858000"/>
</p:presentation>`;
		const result = addSlideToPresentation({
			presentationXml: noSldIdXml,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		expect(result.presentationXml).toBe(noSldIdXml);
	});

	it("falls back to first slide rels when templateSlideIndex is out of bounds", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 999,
			newSlideCount: 1,
		});

		expect(result.slideRelsXmls).toHaveLength(3);
	});

	it("handles empty slideRelsXmls array gracefully", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls: [],
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		expect(result.slideRelsXmls).toHaveLength(1);
		expect(result.slideRelsXmls[0]).toBe("");
	});

	it("handles all three XML parses failing simultaneously", () => {
		const result = addSlideToPresentation({
			presentationXml: "bad xml",
			contentTypeXml: "bad xml",
			relsXml: RELS_XML,
			presentationRelsXml: "bad xml",
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 5,
		});

		expect(result.presentationXml).toBe("bad xml");
		expect(result.contentTypeXml).toBe("bad xml");
		expect(result.slideRelsXmls).toBe(slideRelsXmls);
	});

	it("findMaxRId handles Relationship with no Id attribute", () => {
		const relsWithNoId = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://..." Target="t.xml"/>
  <Relationship Id="rId5" Type="http://..." Target="t.xml"/>
</Relationships>`;
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: relsWithNoId,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		expect(result.presentationRelsXml).toContain("rId6");
	});

	it("findMaxRId handles Relationship with non-rId Id attribute", () => {
		const relsWithCustomId = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="custom1" Type="http://..." Target="t.xml"/>
  <Relationship Id="rId5" Type="http://..." Target="t.xml"/>
</Relationships>`;
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: relsWithCustomId,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		expect(result.presentationRelsXml).toContain("rId6");
	});

	it("findMaxRId handles non-numeric rId suffix gracefully", () => {
		const relsWithBadRId = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdabc" Type="http://..." Target="t.xml"/>
  <Relationship Id="rId5" Type="http://..." Target="t.xml"/>
</Relationships>`;
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: relsWithBadRId,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
		});

		expect(result.presentationRelsXml).toContain("rId6");
	});

	it("inserts new slide before first slide when insertBeforeSlideNumber is 1", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
			insertBeforeSlideNumber: 1,
		});

		const sldIdCount = (result.presentationXml.match(/<p:sldId /g) ?? []).length;
		expect(sldIdCount).toBe(3);
	});

	it("inserts multiple new slides before first slide in correct order", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 2,
			insertBeforeSlideNumber: 1,
		});

		const sldIdCount = (result.presentationXml.match(/<p:sldId /g) ?? []).length;
		expect(sldIdCount).toBe(4);
	});

	it("inserts new slide before middle slide when insertBeforeSlideNumber is 2", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
			insertBeforeSlideNumber: 2,
		});

		const sldIdCount = (result.presentationXml.match(/<p:sldId /g) ?? []).length;
		expect(sldIdCount).toBe(3);
	});

	it("insertBeforeSlideNumber equal to existingSlideCount+1 appends (falls through)", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
			insertBeforeSlideNumber: 3,
		});

		const sldIdCount = (result.presentationXml.match(/<p:sldId /g) ?? []).length;
		expect(sldIdCount).toBe(3);
	});

	it("insertBeforeSlideNumber out of range appends", () => {
		const result = addSlideToPresentation({
			presentationXml: PRESENTATION_XML,
			contentTypeXml: CONTENT_TYPES_XML,
			relsXml: RELS_XML,
			presentationRelsXml: PRESENTATION_RELS_XML,
			slideRelsXmls,
			templateSlideIndex: 0,
			newSlideCount: 1,
			insertBeforeSlideNumber: 999,
		});

		const sldIdCount = (result.presentationXml.match(/<p:sldId /g) ?? []).length;
		expect(sldIdCount).toBe(3);
	});
});
