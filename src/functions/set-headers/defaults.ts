import { Nullable } from "../../shared/functions/nullable/Nullable";
/**
 * set-headers/defaults.ts
 * 
 * Created by Min-Kyu Lee on 22-12-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

import { SlideNumber } from "../../shared/functions/slide-number/SlideNumber";
import { SetHeaderItem } from "./set-header-item";

export const templateSlideNumberDefault_: Nullable<SlideNumber> = null;
export const setHeaderItemsDefault_: SetHeaderItem[] = [
	{
		sectionName: undefined,
		sectionStartSlideNumber: 1,
		sectionEndSlideNumber: 2,
	},
	{
		sectionName: "Section 1",
		sectionStartSlideNumber: 3,
		sectionEndSlideNumber: 4,
	},
	{
		sectionName: "Section 2",
		sectionStartSlideNumber: 5,
		sectionEndSlideNumber: 5,
	},
	{
		sectionName: "Section 3",
		sectionStartSlideNumber: 6,
		sectionEndSlideNumber: 7,
	},
	{
		sectionName: "Section 4",
		sectionStartSlideNumber: 8,
		sectionEndSlideNumber: 12,
	},
	{
		sectionName: "Section 5",
		sectionStartSlideNumber: 13,
		sectionEndSlideNumber: 15,
	},
	{
		sectionName: undefined,
		sectionStartSlideNumber: 28,
		sectionEndSlideNumber: 31,
	},
];