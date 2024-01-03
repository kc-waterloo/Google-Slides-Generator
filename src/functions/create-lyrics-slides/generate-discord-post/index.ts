/**
 * generate-discord-post.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

import { LyricSlideItem } from "../lyric-slide-item";
import { discordPostEndDefualt_, discordPostStartDefualt_ } from "./defaults";

export const generateDiscordPost_ = ({
	lyricsSlidesItems: lyricSlideItems,
	discordPostStart = discordPostStartDefualt_,
	discordPostEnd = discordPostEndDefualt_,
}: {
	lyricsSlidesItems: LyricSlideItem[],
	discordPostStart?: string,
	discordPostEnd?: string,
}): string => {
	return discordPostStart.concat(
		lyricSlideItems.map((lyricSlideItem: LyricSlideItem): string => {
			return `- ${lyricSlideItem.songTitle} by ${lyricSlideItem.artist}\n`;
		}).join(""),
		discordPostEnd
	);
};
