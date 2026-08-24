/**
 * text-style-override.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export interface TextStyleOverride {
	pageElementKey: string;
	fontSize?: number;
	italic?: boolean;
	bold?: boolean;
	strikethrough?: boolean;
	underline?: boolean;
	color?: string;
	borderColor?: string;
}
