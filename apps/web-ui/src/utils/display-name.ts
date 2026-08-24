/**
 * display-name.ts
 *
 * Created by Min-Kyu Lee on 30-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export const toDisplayName = (name: string): string => {
	return name
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (s) => s.toUpperCase())
		.trim();
};
