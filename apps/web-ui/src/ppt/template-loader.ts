/**
 * template-loader.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 *
 * Parses a .pptx template file, extracts slide structure,
 * shape keys, and all relevant XML strings for downstream
 * modules (slide-cloner, presentation-writer, etc.).
 */

/**
 * template-loader.ts
 *
 * Created by Min-Kyu Lee on 27-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import JSZip from "jszip";

export interface SlideInfo {
	index: number;
	xml: string;
	keys: string[];
}

export interface ParsedTemplate {
	slideCount: number;
	slides: SlideInfo[];
	slideOrder: number[];
	presentationXml: string;
	contentTypeXml: string;
	relsXml: string;
	presentationRelsXml: string;
	slideRelsXmls: string[];
}

export async function loadTemplate(buffer: ArrayBuffer): Promise<ParsedTemplate> {
	if (buffer.byteLength === 0) {
		throw new Error("Empty template buffer");
	}

	const zip = await JSZip.loadAsync(buffer);

	const readFile = async (path: string): Promise<string> => {
		const file = zip.file(path);
		if (!file) throw new Error(`Missing file in template: ${path}`);
		return file.async("text");
	};

	const contentTypeXml = await readFile("[Content_Types].xml");
	const relsXml = await readFile("_rels/.rels");
	const presentationXml = await readFile("ppt/presentation.xml");
	const presentationRelsXml = await readFile("ppt/_rels/presentation.xml.rels");

	const slidePaths: string[] = [];
	const presDoc = new DOMParser().parseFromString(presentationRelsXml, "text/xml");
	const rels = presDoc.querySelectorAll("Relationship");
	for (const rel of rels) {
		const type = rel.getAttribute("Type") ?? "";
		const target = rel.getAttribute("Target") ?? "";
		if (type.endsWith("/slide") && target) {
			slidePaths.push(`ppt/${target}`);
		}
	}

	const slides: SlideInfo[] = [];
	const slideRelsXmls: string[] = [];

	for (const [i, path] of slidePaths.entries()) {
		const xml = await readFile(path);
		const slideDoc = new DOMParser().parseFromString(xml, "text/xml");
		const cNvPrs = slideDoc.getElementsByTagNameNS(
			"http://schemas.openxmlformats.org/presentationml/2006/main",
			"cNvPr",
		);

		const keys: string[] = [];
		for (const cNvPr of cNvPrs) {
			const name = cNvPr.getAttribute("name") ?? "";
			if (name) {
				keys.push(name);
			}
		}

		slides.push({ index: i, xml, keys });

		const relsPath = path.replace(/slides\/([^/]+)$/, "slides/_rels/$1.rels");
		const relsFile = zip.file(relsPath);
		slideRelsXmls.push(relsFile ? await relsFile.async("text") : "");
	}

	const slideOrder = slides.map((_, i) => i);

	return {
		slideCount: slides.length,
		slides,
		slideOrder,
		presentationXml,
		contentTypeXml,
		relsXml,
		presentationRelsXml,
		slideRelsXmls,
	};
}
