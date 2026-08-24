/**
 * usePptTemplate.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { renderHook, act } from "@testing-library/react";
import JSZip from "jszip";
import { usePptTemplate } from "./usePptTemplate";

const createMockPptx = async (): Promise<File> => {
	const zip = new JSZip();
	zip.file("[Content_Types].xml", `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
	<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
	<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
	</Types>`);
	zip.file("_rels/.rels", "<?xml version=\"1.0\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"/>");
	zip.file("ppt/presentation.xml", "<?xml version=\"1.0\"?><p:presentation xmlns:p=\"http://schemas.openxmlformats.org/presentationml/2006/main\"><p:sldIdLst><p:sldId id=\"256\" r:id=\"rId1\"/></p:sldIdLst></p:presentation>");
	zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
	<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
	</Relationships>`);
	zip.file("ppt/slides/slide1.xml", `<?xml version="1.0"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
	<p:cSld>
		<p:spTree>
			<p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
			<p:grpSpPr/>
			<p:sp>
				<p:nvSpPr><p:cNvPr id="2" name="title-text-box"/></p:nvSpPr>
				<p:txBody><a:bodyPr/><a:p><a:r><a:t>Title</a:t></a:r></a:p></p:txBody>
			</p:sp>
		</p:spTree>
	</p:cSld>
</p:sld>`);
	zip.file("ppt/slides/_rels/slide1.xml.rels", "<?xml version=\"1.0\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"/>");

	const blob = await zip.generateAsync({ type: "blob" });
	return new File([blob], "template.pptx", { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
};

describe("usePptTemplate", () => {
	it("starts with no template loaded", () => {
		const { result } = renderHook(() => usePptTemplate());
		expect(result.current.template).toBeNull();
		expect(result.current.slideCount).toBe(0);
		expect(result.current.detectedKeys).toEqual([]);
	});

	it("loads a template file and detects keys", async () => {
		const { result } = renderHook(() => usePptTemplate());

		const file = await createMockPptx();
		await act(async () => {
			await result.current.loadTemplate(file);
		});

		expect(result.current.template).not.toBeNull();
		expect(result.current.fileName).toBe("template.pptx");
		expect(result.current.slideCount).toBe(1);
		expect(result.current.detectedKeys).toContain("title-text-box");
	});

	it("generates .pptx blob from call chain", async () => {
		const { result } = renderHook(() => usePptTemplate());

		const file = await createMockPptx();
		await act(async () => {
			await result.current.loadTemplate(file);
		});

		let blob: Blob | null = null;
		await act(async () => {
			blob = await result.current.generatePptx([
				{
					templateSourceKey: "title-text-box",
					textReplacements: { "title-text-box": "Test" },
				},
			]);
		});

		expect(blob).not.toBeNull();
		expect(blob!.type).toBe("application/vnd.openxmlformats-officedocument.presentationml.presentation");
	});

	it("throws generatePptx when no template loaded", async () => {
		const { result } = renderHook(() => usePptTemplate());

		await expect(
			result.current.generatePptx([]),
		).rejects.toThrow("No template loaded");
	});

	it("clears the template", async () => {
		const { result } = renderHook(() => usePptTemplate());

		const file = await createMockPptx();
		await act(async () => {
			await result.current.loadTemplate(file);
		});
		act(() => {
			result.current.clearTemplate();
		});

		expect(result.current.template).toBeNull();
		expect(result.current.fileName).toBeNull();
	});

	it("rejects invalid file type", async () => {
		const { result } = renderHook(() => usePptTemplate());
		const badFile = new File(["not a pptx"], "test.txt", { type: "text/plain" });

		await expect(
			act(async () => {
				await result.current.loadTemplate(badFile);
			}),
		).rejects.toThrow(/not a valid/i);
	});

	it("openFromAdapter uses adapter to load template", async () => {
		const mockPptx = await createMockPptx();
		const mockBuffer = await mockPptx.arrayBuffer();

		const mockAdapter = {
			openTemplate: async () => ({ name: "from-adapter.pptx", buffer: mockBuffer }),
			savePresentation: async () => true,
		};

		const { result } = renderHook(() => usePptTemplate(mockAdapter));

		let success = false;
		await act(async () => {
			success = await result.current.openFromAdapter();
		});

		expect(success).toBe(true);
		expect(result.current.fileName).toBe("from-adapter.pptx");
		expect(result.current.slideCount).toBe(1);
	});

	it("openFromAdapter returns false when user cancels", async () => {
		const mockAdapter = {
			openTemplate: async () => null,
			savePresentation: async () => true,
		};

		const { result } = renderHook(() => usePptTemplate(mockAdapter));

		let success: boolean | undefined;
		await act(async () => {
			success = await result.current.openFromAdapter();
		});

		expect(success).toBe(false);
		expect(result.current.template).toBeNull();
	});

	it("saveViaAdapter delegates to adapter", async () => {
		const saveFn = () => Promise.resolve(true);
		const mockAdapter = {
			openTemplate: async () => null,
			savePresentation: saveFn,
		};

		const { result } = renderHook(() => usePptTemplate(mockAdapter));

		let saved = false;
		await act(async () => {
			saved = await result.current.saveViaAdapter(new ArrayBuffer(0), "test.pptx");
		});

		expect(saved).toBe(true);
	});

	it("isElectron is false in browser environment", () => {
		const { result } = renderHook(() => usePptTemplate());
		expect(result.current.isElectron).toBe(false);
	});

	it("loadFromBuffer loads template from ArrayBuffer", async () => {
		const mockPptx = await createMockPptx();
		const mockBuffer = await mockPptx.arrayBuffer();

		const { result } = renderHook(() => usePptTemplate());

		await act(async () => {
			await result.current.loadFromBuffer(mockBuffer, "buffer.pptx");
		});

		expect(result.current.fileName).toBe("buffer.pptx");
		expect(result.current.slideCount).toBe(1);
		expect(result.current.detectedKeys).toContain("title-text-box");
		expect(result.current.template).not.toBeNull();
	});

	it("deduplicates keys across slides", async () => {
		const zip = new JSZip();
		zip.file("[Content_Types].xml", `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
	<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
	<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
	<Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
	</Types>`);
		zip.file("_rels/.rels", "<?xml version=\"1.0\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"/>");
		zip.file("ppt/presentation.xml", "<?xml version=\"1.0\"?><p:presentation xmlns:p=\"http://schemas.openxmlformats.org/presentationml/2006/main\"><p:sldIdLst><p:sldId id=\"256\" r:id=\"rId1\"/><p:sldId id=\"257\" r:id=\"rId2\"/></p:sldIdLst></p:presentation>");
		zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
	<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
	<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
	</Relationships>`);
		const slideXml = `<?xml version="1.0"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
	<p:cSld>
		<p:spTree>
			<p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
			<p:grpSpPr/>
			<p:sp>
				<p:nvSpPr><p:cNvPr id="2" name="title-text-box"/></p:nvSpPr>
				<p:txBody><a:bodyPr/><a:p><a:r><a:t>Title</a:t></a:r></a:p></p:txBody>
			</p:sp>
		</p:spTree>
	</p:cSld>
</p:sld>`;
		zip.file("ppt/slides/slide1.xml", slideXml);
		zip.file("ppt/slides/slide2.xml", slideXml);
		zip.file("ppt/slides/_rels/slide1.xml.rels", "<?xml version=\"1.0\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"/>");
		zip.file("ppt/slides/_rels/slide2.xml.rels", "<?xml version=\"1.0\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"/>");

		const blob = await zip.generateAsync({ type: "blob" });
		const file = new File([blob], "multi.pptx", { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });

		const { result } = renderHook(() => usePptTemplate());
		await act(async () => {
			await result.current.loadTemplate(file);
		});

		expect(result.current.detectedKeys).toEqual(["title-text-box"]);
	});

	it("sorts detectedKeys alphabetically", async () => {
		const zip = new JSZip();
		zip.file("[Content_Types].xml", `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
	<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
	<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
	</Types>`);
		zip.file("_rels/.rels", "<?xml version=\"1.0\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"/>");
		zip.file("ppt/presentation.xml", "<?xml version=\"1.0\"?><p:presentation xmlns:p=\"http://schemas.openxmlformats.org/presentationml/2006/main\"><p:sldIdLst><p:sldId id=\"256\" r:id=\"rId1\"/></p:sldIdLst></p:presentation>");
		zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
	<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
	</Relationships>`);
		zip.file("ppt/slides/slide1.xml", `<?xml version="1.0"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
	<p:cSld>
		<p:spTree>
			<p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
			<p:grpSpPr/>
			<p:sp><p:nvSpPr><p:cNvPr id="2" name="z-key"/></p:nvSpPr><p:txBody><a:bodyPr/><a:p><a:r><a:t>Z</a:t></a:r></a:p></p:txBody></p:sp>
			<p:sp><p:nvSpPr><p:cNvPr id="3" name="a-key"/></p:nvSpPr><p:txBody><a:bodyPr/><a:p><a:r><a:t>A</a:t></a:r></a:p></p:txBody></p:sp>
			<p:sp><p:nvSpPr><p:cNvPr id="4" name="m-key"/></p:nvSpPr><p:txBody><a:bodyPr/><a:p><a:r><a:t>M</a:t></a:r></a:p></p:txBody></p:sp>
		</p:spTree>
	</p:cSld>
</p:sld>`);
		zip.file("ppt/slides/_rels/slide1.xml.rels", "<?xml version=\"1.0\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"/>");

		const blob = await zip.generateAsync({ type: "blob" });
		const file = new File([blob], "sorted.pptx");

		const { result } = renderHook(() => usePptTemplate());
		await act(async () => {
			await result.current.loadTemplate(file);
		});

		expect(result.current.detectedKeys).toEqual(["a-key", "m-key", "z-key"]);
	});

	it("isElectron is true when window.electronAPI exists", () => {
		const origElectronAPI = (window as unknown as Record<string, unknown>).electronAPI;
		(window as unknown as Record<string, unknown>).electronAPI = {};

		const { result } = renderHook(() => usePptTemplate());

		expect(result.current.isElectron).toBe(true);

		if (origElectronAPI === undefined) {
			delete (window as unknown as Record<string, unknown>).electronAPI;
		} else {
			(window as unknown as Record<string, unknown>).electronAPI = origElectronAPI;
		}
	});

	it("re-loading replaces previous template state", async () => {
		const file1 = await createMockPptx();

		const { result } = renderHook(() => usePptTemplate());

		await act(async () => {
			await result.current.loadTemplate(file1);
		});

		expect(result.current.fileName).toBe("template.pptx");

		const zip = new JSZip();
		zip.file("[Content_Types].xml", `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
	<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
	<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
	</Types>`);
		zip.file("_rels/.rels", "<?xml version=\"1.0\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"/>");
		zip.file("ppt/presentation.xml", "<?xml version=\"1.0\"?><p:presentation xmlns:p=\"http://schemas.openxmlformats.org/presentationml/2006/main\"><p:sldIdLst><p:sldId id=\"256\" r:id=\"rId1\"/></p:sldIdLst></p:presentation>");
		zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
	<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
	</Relationships>`);
		zip.file("ppt/slides/slide1.xml", `<?xml version="1.0"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
	<p:cSld>
		<p:spTree>
			<p:nvGrpSpPr><p:cNvPr id="1" name=""/></p:nvGrpSpPr>
			<p:grpSpPr/>
			<p:sp><p:nvSpPr><p:cNvPr id="2" name="new-key"/></p:nvSpPr><p:txBody><a:bodyPr/><a:p><a:r><a:t>New</a:t></a:r></a:p></p:txBody></p:sp>
		</p:spTree>
	</p:cSld>
</p:sld>`);
		zip.file("ppt/slides/_rels/slide1.xml.rels", "<?xml version=\"1.0\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"/>");

		const blob2 = await zip.generateAsync({ type: "blob" });
		const file2 = new File([blob2], "replacement.pptx");

		await act(async () => {
			await result.current.loadTemplate(file2);
		});

		expect(result.current.fileName).toBe("replacement.pptx");
		expect(result.current.detectedKeys).toEqual(["new-key"]);
	});
});
