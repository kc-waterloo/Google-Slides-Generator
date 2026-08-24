/**
 * verse-api-response.d.ts
 *
 * Created by Min-Kyu Lee on 25-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

export interface VerseApiResponse {
	book: string | undefined,
	chapter: string | undefined,
	verses: string | undefined,
	text: string | undefined,
	version: string | undefined,
	bid: string | undefined,
}
