/**
 * copy-item-actions.d.ts
 * 
 * Created by Min-Kyu Lee on 22-12-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

export interface CopyItemActions {
    newText?: string;
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    fontSize?: number;
    newColor?: GoogleAppsScript.Slides.ThemeColorType;
    newBorderColor?: GoogleAppsScript.Slides.ThemeColorType;
}
