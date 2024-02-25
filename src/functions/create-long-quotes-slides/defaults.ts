/**
 * create-lyrics-slides/defaults.ts
 * 
 * Created by Min-Kyu Lee on 22-12-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
*/

import { Nullable } from "../../shared/nullable/nullable";
import { SlideNumber } from "../../shared/slide-number/slide-number";
import { LongQuoteItem } from "./long-quote-item";

export const templateTitleSlideNumberDefault_: Nullable<number> = null;
export const templateLongQuoteSlideNumberDefault_: Nullable<number> = null;
export const insertionSlideNumberDefault_: SlideNumber = 9;
export const longQuoteSlideItemsDefault_: LongQuoteItem[] = [
	{
		title: "Lorem Ipsum 1",
		subtitle: "Test Author 1",
		quote: `
            Lorem ipsum dolor sit amet,
            consectetur adipiscing elit.
            Sed porta lorem vel lacus
            pharetra consectetur.
            
            Integer sed tortor lobortis,
            vestibulum turpis quis,
            convallis purus.
            
            Duis sit amet mauris
            sed dolor posuere sagittis a et lorem.
            Curabitur eget quam id nunc
            semper dictum ut id erat.
            
            Duis ac mi id lectus consequat
            lacinia nec nec metus.
            Cras rhoncus felis at
            vulputate dignissim.
            
            Praesent eu lorem non turpis
            eleifend varius sed id lorem.
            Cras nec ex hendrerit,
            tincidunt est nec, iaculis urna.

        `,
	},
	{
		title: "Lorem Ipsum 2",
		subtitle: "Test Author 2",
		quote: `
            Phasellus placerat mi ut luctus auctor.
            Suspendisse semper nunc ac orci laoreet,
            et placerat purus consectetur.
            Phasellus convallis odio sed mi gravida venenatis.

            Suspendisse a orci euismod,
            elementum nibh eget, eleifend augue.
            Proin suscipit sapien vel auctor tempus.
            Mauris non metus sagittis,
            efficitur erat blandit, viverra mi.

            Suspendisse bibendum arcu sed diam gravida,
            at ultrices ex volutpat.
            Vestibulum tempus ligula id tincidunt aliquam.
            Pellentesque non risus hendrerit,
            consequat tellus eu, mattis erat.
        `,
	},
];

