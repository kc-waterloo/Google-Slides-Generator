/**
 * verse-item.d.ts
 *
 * Created by Min-Kyu Lee on 25-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { VerseApiResponse } from "./verse-api-response";
import { VerseItemInput } from "./verse-item-inputs";

export interface VerseItem {
	input: VerseItemInput,
	responses: VerseApiResponse[],
}
