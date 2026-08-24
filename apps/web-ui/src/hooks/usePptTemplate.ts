/**
 * usePptTemplate.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState, useCallback, useRef } from "react";
import { loadTemplate } from "../ppt/template-loader";
import { generateSlidesFromTemplate } from "../ppt/pipeline";
import type { SlideOperation } from "../ppt/pipeline";
import { getPlatformAdapter } from "../ppt/platform";
import type { PptPlatformAdapter } from "../ppt/platform";

export interface PptTemplate {
	buffer: ArrayBuffer;
	fileName: string;
}

export function usePptTemplate(adapter?: PptPlatformAdapter) {
	const [template, setTemplate] = useState<PptTemplate | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [slideCount, setSlideCount] = useState(0);
	const [detectedKeys, setDetectedKeys] = useState<string[]>([]);
	const bufferRef = useRef<ArrayBuffer | null>(null);

	const platformAdapter = adapter ?? getPlatformAdapter();
	const isElectron = typeof window !== "undefined" && !!window.electronAPI;

	const loadFromBuffer = useCallback(async (buffer: ArrayBuffer, name: string) => {
		const parsed = await loadTemplate(buffer);

		const allKeys = new Set<string>();
		for (const slide of parsed.slides) {
			for (const key of slide.keys) {
				allKeys.add(key);
			}
		}

		bufferRef.current = buffer;
		setTemplate({ buffer, fileName: name });
		setFileName(name);
		setSlideCount(parsed.slideCount);
		setDetectedKeys(Array.from(allKeys).sort());
		console.info(`[ppt] Loaded template "${name}": ${parsed.slideCount} slides, ${allKeys.size} keys`);
	}, []);

	const loadTemplateFile = useCallback(async (file: File) => {
		if (!file.name.toLowerCase().endsWith(".pptx")) {
			throw new Error(`"${file.name}" is not a valid .pptx template`);
		}

		const buffer = await file.arrayBuffer();
		await loadFromBuffer(buffer, file.name);
	}, [loadFromBuffer]);

	const openFromAdapter = useCallback(async (): Promise<boolean> => {
		const result = await platformAdapter.openTemplate();
		if (!result) return false;

		await loadFromBuffer(result.buffer, result.name);
		return true;
	}, [loadFromBuffer, platformAdapter]);

	const generatePptx = useCallback(
		async (operations: SlideOperation[]): Promise<Blob> => {
			const buf = bufferRef.current;
			if (!buf) {
				throw new Error("No template loaded");
			}

			const result = await generateSlidesFromTemplate(buf, operations);
			console.info(`[ppt] Generated presentation: ${operations.length} operations`);
			return new Blob([result], {
				type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
			});
		},
		[],
	);

	const saveViaAdapter = useCallback(
		async (buffer: ArrayBuffer, defaultName: string): Promise<boolean> => {
			return platformAdapter.savePresentation(buffer, defaultName);
		},
		[platformAdapter],
	);

	const clearTemplate = useCallback(() => {
		console.info("[ppt] Template cleared");
		bufferRef.current = null;
		setTemplate(null);
		setFileName(null);
		setSlideCount(0);
		setDetectedKeys([]);
	}, []);

	return {
		template,
		fileName,
		slideCount,
		detectedKeys,
		loadTemplate: loadTemplateFile,
		loadFromBuffer,
		openFromAdapter,
		generatePptx,
		saveViaAdapter,
		clearTemplate,
		isElectron,
	};
}
