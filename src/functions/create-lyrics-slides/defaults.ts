/**
 * create-lyrics-slides/defaults.ts
 * 
 * Created by Min-Kyu Lee on 22-12-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
*/

import { Nullable } from "../../shared/functions/nullable/Nullable";
import { SlideNumber } from "../../shared/functions/slide-number/SlideNumber";
import { LyricSlideItem } from "./lyric-slide-item";

export const templateTitleSlideNumberDefault_: Nullable<number> = null;
export const templateLyricSlideNumberDefault_: Nullable<number> = null;
export const insertionSlideNumberDefault_: SlideNumber = 1;
export const lyricSlideItemsDefault_: LyricSlideItem[] = [
	{
		songTitle: "Song Title 1",
		artist: "Artist for Song 1",
		lyrics: `
        Lorem ipsum dolor sit amet,
        consectetur adipiscing elit,
        sed do eiusmod tempor incididunt
        ut labore et dolore magna aliqua.

        Ut enim ad minim veniam,
        quis nostrud exercitation
        ullamco laboris nisi ut aliquip
        ex ea commodo consequat.

        Duis aute irure dolor in reprehenderit
        in voluptate velit esse cillum dolore eu
        fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident,
        sunt in culpa qui officia deserunt
        mollit anim id est laborum.
        `,
	},
	{
		songTitle: "Song Title 2",
		artist: "Artist for Song 2",
		lyrics: `
        Lorem ipsum dolor sit amet,
        consectetur adipiscing elit,
        sed do eiusmod tempor incididunt
        ut labore et dolore magna aliqua.

        Ut enim ad minim veniam,
        quis nostrud exercitation
        ullamco laboris nisi ut aliquip
        ex ea commodo consequat.

        Duis aute irure dolor in reprehenderit
        in voluptate velit esse cillum dolore eu
        fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident,
        sunt in culpa qui officia deserunt
        mollit anim id est laborum
        `,
	},
	{
		songTitle: "Song Title 3",
		artist: "Artist for Song 3",
		lyrics: `
        Lorem ipsum dolor sit amet,
        consectetur adipiscing elit,
        sed do eiusmod tempor incididunt
        ut labore et dolore magna aliqua.

        Ut enim ad minim veniam,
        quis nostrud exercitation
        ullamco laboris nisi ut aliquip
        ex ea commodo consequat.

        Duis aute irure dolor in reprehenderit
        in voluptate velit esse cillum dolore eu
        fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident,
        sunt in culpa qui officia deserunt
        mollit anim id est laborum.
        `,
	},
];

