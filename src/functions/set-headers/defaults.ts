import { Nullable } from "../../shared/nullable/nullable";
/**
 * set-headers/defaults.ts
 * 
 * Created by Min-Kyu Lee on 22-12-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

import { SlideNumber } from "../../shared/slide-number/slide-number";
import { SetHeaderItem } from "./set-header-item";

export const setHeadersDefaultTemplateSlideNumber_: Nullable<SlideNumber> = null;
export const setHeadersDefaultSetHeaderItems_: SetHeaderItem[] = [
	{
		sectionName: undefined,
		sectionStartSlideNumber: 1,
		sectionEndSlideNumber: 2,
	},
	{
		sectionName: "Topic A",
		sectionStartSlideNumber: 3,
		sectionEndSlideNumber: 4,
	},
	{
		sectionName: "Topic B",
		sectionStartSlideNumber: 5,
		sectionEndSlideNumber: 5,
	},
	{
		sectionName: "Topic C",
		sectionStartSlideNumber: 6,
		sectionEndSlideNumber: 7,
	},
	{
		sectionName: "Topic D",
		sectionStartSlideNumber: 8,
		sectionEndSlideNumber: 12,
	},
	{
		sectionName: "Topic E",
		sectionStartSlideNumber: 13,
		sectionEndSlideNumber: 15,
	},
	{
		sectionName: "Topic F",
		sectionStartSlideNumber: 16,
		sectionEndSlideNumber: 19,
	},
	{
		sectionName: "Topic G",
		sectionStartSlideNumber: 20,
		sectionEndSlideNumber: 20,
	},
	{
		sectionName: "Topic H",
		sectionStartSlideNumber: 21,
		sectionEndSlideNumber: 27,
	},
	{
		sectionName: undefined,
		sectionStartSlideNumber: 28,
		sectionEndSlideNumber: 31,
	},
];
export const headerLengthDefault_ = 3;
