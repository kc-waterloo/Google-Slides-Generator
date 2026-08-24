/**
 * generate-discord-post/index.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

import { LongQuoteItem } from "@gsg/shared";
import { discordPostEndDefault_, discordPostStartDefault_ } from "./defaults";

export const generateDiscordPost_ = ({
	longQuoteItems,
	discordPostStart = discordPostStartDefault_,
	discordPostEnd = discordPostEndDefault_,
}: {
	longQuoteItems: LongQuoteItem[],
	discordPostStart?: string,
	discordPostEnd?: string,
}): string => {
	return discordPostStart.concat(
		longQuoteItems.map((lyricSlideItem: LongQuoteItem): string => {
			return `- ${lyricSlideItem.title} by ${lyricSlideItem.subtitle}\n`;
		}).join(""),
		discordPostEnd
	);
};
