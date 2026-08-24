/**
 * update-slide-links.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { logInfo, logWarn } from "../logger/logger";

const MODULE = "updateSlideLinks_";

/**
 * After duplicating slides, updates shape links so that if a shape
 * on a copied slide links to another original slide that was also
 * duplicated, the link is redirected to the duplicate.
 */
export const updateSlideLinks_ = ({
	originalToCopyMap,
}: {
	originalToCopyMap: Map<string, GoogleAppsScript.Slides.Slide>,
}): void => {
	let updatedCount = 0;

	originalToCopyMap.forEach((newSlide: GoogleAppsScript.Slides.Slide): void => {
		newSlide.getPageElements().forEach((element: GoogleAppsScript.Slides.PageElement): void => {
			let shape: GoogleAppsScript.Slides.Shape | null = null;
			try {
				shape = element.asShape();
			}
			// eslint-disable-next-line no-empty
			catch (_) {}
			if (!shape) {
				return;
			}

			let link: GoogleAppsScript.Slides.Link | null;
			try {
				link = shape.getLink();
			} catch (_) {
				return;
			}
			if (!link) {
				return;
			}

			let linkType: string | null;
			try {
				linkType = link.getLinkType() as unknown as string;
			} catch (_) {
				return;
			}

			if (
				linkType !== "SLIDE_ID" &&
				linkType !== "SLIDE_INDEX" &&
				linkType !== "SLIDE_POSITION"
			) {
				return;
			}

			let targetSlideId: string | null;
			try {
				targetSlideId = link.getSlideId();
			} catch (_) {
				return;
			}

			if (!targetSlideId) {
				return;
			}

			const targetCopy: GoogleAppsScript.Slides.Slide | undefined = originalToCopyMap.get(targetSlideId);
			if (targetCopy) {
				try {
					shape.setLinkSlide(targetCopy);
					updatedCount++;
				} catch (_) {
					logWarn(MODULE, "setLinkSlide failed for shape, skipping");
				}
			}
		});
	});

	if (updatedCount > 0) {
		logInfo(MODULE, `Updated ${updatedCount} slide links to point to duplicated targets`);
	}
};
