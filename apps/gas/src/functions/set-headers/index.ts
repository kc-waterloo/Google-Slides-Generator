/**
 * set-headers/index.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
*/

import { Nullable, SetHeaderItem, SlideNumber, SlideIndex, SlideId } from "@gsg/shared";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { processCopyItems_ } from "../../shared/copy-item/process-copy-items";
import { CopyItem } from "../../shared/copy-item/copy-item";
import { headerLengthDefault_, setHeadersDefaultSetHeaderItems_, setHeadersDefaultTemplateSlideNumber_ } from "./defaults";
import { slideNumberToId_ } from "../../shared/slide-number/slide-number-to-id";
import { logError, logInfo } from "../../shared/logger/logger";
import { getActivePresentation_ } from "../../shared/presentation";

const MODULE = "setHeaders";
const DEFAULT_BORDER_KEY = "top-bar-border-key";
const DEFAULT_TOPIC_PREFIX = "top-bar-topic-";


/**
 * Sets header bars across slide sections with scrolling section labels.
 * Uses a template slide with a border element and topic text boxes.
 * The active section is highlighted with bold text and activeSectionColor.
 *
 * @param {Object} parameters - parameters for the function
 * @param {Nullable<SlideNumber>} [parameters.templateSlideNumber] - Template slide (null = auto-detect)
 * @param {SetHeaderItem[]} [parameters.setHeaderItems] - Array of section definitions
 * @param {number} [parameters.headerLength] - Number of visible header slots
 * @param {string} [parameters.overrideBorderKey] - Override default "top-bar-border-key"
 * @param {string} [parameters.overrideTopicPrefix] - Override default "top-bar-topic-"
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.activeSectionColor=DARK1] - Color for active section
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.inactiveSectionColor=LIGHT1] - Color for inactive sections
 * @param {boolean} [parameters.activeSectionItalic] - Italic for active section
 * @param {boolean} [parameters.inactiveSectionItalic] - Italic for inactive sections
 * @param {boolean} [parameters.activeSectionStrikethrough] - Strikethrough for active section
 * @param {boolean} [parameters.inactiveSectionStrikethrough] - Strikethrough for inactive sections
 * @param {boolean} [parameters.activeSectionUnderline] - Underline for active section
 * @param {boolean} [parameters.inactiveSectionUnderline] - Underline for inactive sections
 * @param {number} [parameters.activeSectionFontSize] - Font size for active section
 * @param {number} [parameters.inactiveSectionFontSize] - Font size for inactive sections
 * @returns {void}
 */
export const setHeaders = ({
	templateSlideNumber = setHeadersDefaultTemplateSlideNumber_,
	setHeaderItems = setHeadersDefaultSetHeaderItems_,
	headerLength = headerLengthDefault_,
	overrideBorderKey,
	overrideTopicPrefix,
	activeSectionColor = SlidesApp.ThemeColorType.DARK1,
	inactiveSectionColor = SlidesApp.ThemeColorType.LIGHT1,
	activeSectionItalic,
	inactiveSectionItalic,
	activeSectionStrikethrough,
	inactiveSectionStrikethrough,
	activeSectionUnderline,
	inactiveSectionUnderline,
	activeSectionFontSize,
	inactiveSectionFontSize,
}: {
	templateSlideNumber: Nullable<SlideNumber>,
	setHeaderItems: SetHeaderItem[],
	headerLength: number,
	overrideBorderKey?: string,
	overrideTopicPrefix?: string,
	activeSectionColor?: GoogleAppsScript.Slides.ThemeColorType,
	inactiveSectionColor?: GoogleAppsScript.Slides.ThemeColorType,
	activeSectionItalic?: boolean,
	inactiveSectionItalic?: boolean,
	activeSectionStrikethrough?: boolean,
	inactiveSectionStrikethrough?: boolean,
	activeSectionUnderline?: boolean,
	inactiveSectionUnderline?: boolean,
	activeSectionFontSize?: number,
	inactiveSectionFontSize?: number,
} = {
	templateSlideNumber: setHeadersDefaultTemplateSlideNumber_,
	setHeaderItems: setHeadersDefaultSetHeaderItems_,	
	headerLength: headerLengthDefault_,
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	const borderKey: string = overrideBorderKey ?? DEFAULT_BORDER_KEY;
	const topicPrefix: string = overrideTopicPrefix ?? DEFAULT_TOPIC_PREFIX;

	const headerSectionsStrings: string[] = setHeaderItems
		.map((setHeaderItem: SetHeaderItem): (string | undefined) => {
			return setHeaderItem.sectionName;
		})
		.filter(
			headerString => headerString !== undefined
		) as string[];

	const templateSlideId: Nullable<SlideId> = slideNumberToId_({
		presentation: presentation,
		slideNumber: templateSlideNumber,
		pageElementKeys: [
			borderKey,
		].concat(
			Array.from({length: headerLength}, (_, i: number): number => i + 1).map((i: number): string => {
				return `${topicPrefix}${i}-of-${headerLength}-text`;
			})
		),
	});

	if (!templateSlideId) {
		logError(MODULE, "Template slide not found");
		return;
	}

	const slides: GoogleAppsScript.Slides.Slide[] = presentation.getSlides();
	const templateSlide: GoogleAppsScript.Slides.Slide = presentation.getSlideById(templateSlideId);

	let headerSectionsStringIndex: number = 0;
	let headerSectionsStringBaseIndex: number = 0;

	setHeaderItems.forEach((
		setHeaderItem: SetHeaderItem,
	): void => {
		logInfo(MODULE, `Setting headers for '${setHeaderItem.sectionName ?? "No Section Selected"}'`);
		const headerRelativeIndex: number = headerSectionsStringIndex - headerSectionsStringBaseIndex;

		const baseCopyItems: CopyItem[] = [
			{
				pageElementKey: borderKey,
				actions: {},
			},
		];

		const copyItems: CopyItem[] = baseCopyItems.concat(
			Array.from({length: headerLength}, (_, i) => i).map((i: number) => {
				return {
					pageElementKey: `${topicPrefix}${i + 1}-of-${headerLength}-text`,
					actions: {
						newText: headerSectionsStrings[headerSectionsStringBaseIndex + i] ?? "",
						newColor: inactiveSectionColor,
						bold: false,
						italic: inactiveSectionItalic,
						strikethrough: inactiveSectionStrikethrough,
						underline: inactiveSectionUnderline,
						fontSize: inactiveSectionFontSize,
					},
				} as CopyItem;
			})
		);

		if (setHeaderItem.sectionName !== undefined) {
			const boldedIndex: number = Math.min(
				headerRelativeIndex + baseCopyItems.length,
				copyItems.length - 1
			);

			copyItems[boldedIndex]!.actions.bold = true;
			copyItems[boldedIndex]!.actions.newColor = activeSectionColor;
			if (activeSectionItalic !== undefined) {
				copyItems[boldedIndex]!.actions.italic = activeSectionItalic;
			}
			if (activeSectionStrikethrough !== undefined) {
				copyItems[boldedIndex]!.actions.strikethrough = activeSectionStrikethrough;
			}
			if (activeSectionUnderline !== undefined) {
				copyItems[boldedIndex]!.actions.underline = activeSectionUnderline;
			}
			if (activeSectionFontSize !== undefined) {
				copyItems[boldedIndex]!.actions.fontSize = activeSectionFontSize;
			}
		}

		const sectionStartSlideIndex: SlideIndex = slideNumberToIndex_(setHeaderItem.sectionStartSlideNumber);
		const sectionEndSlideIndex: SlideIndex = slideNumberToIndex_(setHeaderItem.sectionEndSlideNumber);

		const clampedEndIndex: number = Math.min(sectionEndSlideIndex, slides.length - 1);
		for (let i: number = sectionStartSlideIndex; i <= clampedEndIndex; i++) {
			processCopyItems_({
				templateSlide: templateSlide,
				destinationSlide: slides[i]!,
				copyItems: copyItems,
			});
		}

		if (setHeaderItem.sectionName !== undefined) {
			headerSectionsStringIndex += 1;
			if (
				// Ensure that the base does not increment when the bolded part is not yet centred
				headerRelativeIndex > Math.ceil(headerLength / 2) - 2 &&
				// Ensure incrementing will not cause out-of-bounds index for headerSectionsStrings
				headerSectionsStringBaseIndex + headerLength < headerSectionsStrings.length
			) {
				headerSectionsStringBaseIndex += 1;
			}
		}
	});
};
