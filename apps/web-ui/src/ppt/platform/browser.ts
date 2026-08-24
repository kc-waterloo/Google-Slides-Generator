/**
 * browser.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 *
 * Browser implementation of PptPlatformAdapter using standard Web APIs:
 * <input type="file"> for opening, URL.createObjectURL + <a> click for saving.
 */

/**
 * browser.ts
 *
 * Created by Min-Kyu Lee on 27-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { PptPlatformAdapter, TemplateFile } from "./adapter";

const CANCEL_TIMEOUT_MS = 300;

export const browserAdapter: PptPlatformAdapter = {
	openTemplate(): Promise<TemplateFile | null> {
		return new Promise((resolve, reject) => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".pptx";

			let resolved = false;
			let focusTimeoutId: ReturnType<typeof setTimeout> | undefined;

			const onWindowFocus = (): void => {
				focusTimeoutId = setTimeout(() => {
					if (!resolved) {
						resolved = true;
						resolve(null);
					}
				}, CANCEL_TIMEOUT_MS);
			};

			window.addEventListener("focus", onWindowFocus, { once: true });

			input.addEventListener("change", () => {
				clearTimeout(focusTimeoutId);
				window.removeEventListener("focus", onWindowFocus);
				const file = input.files?.[0];
				if (!file) {
					resolved = true;
					resolve(null);
					return;
				}
				file.arrayBuffer().then((buffer: ArrayBuffer) => {
					resolved = true;
					resolve({ name: file.name, buffer });
				}).catch((err: unknown) => {
					resolved = true;
					reject(err);
				});
			});

			input.click();
		});
	},

	async savePresentation(
		buffer: ArrayBuffer,
		defaultName: string,
	): Promise<boolean> {
		const blob = new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = defaultName.endsWith(".pptx") ? defaultName : `${defaultName}.pptx`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		return true;
	},
};
