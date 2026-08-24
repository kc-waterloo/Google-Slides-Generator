/**
 * verse-version-source.d.ts
 *
 * Created by Min-Kyu Lee on 23-08-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export interface VerseVersionSource {
	/** Version token as it appears in a reference, e.g. 개역개정. */
	version: string;
	/** Drive URL or file id of the JSON holding that version's verses. */
	fileUrl: string;
}
