/**
 * copy-item.d.ts
 * 
 * Created by Min-Kyu Lee on 22-12-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

import { PageElementKey } from "../page-element-key/PageElementKey";
import { CopyItemActions } from "./copy-item-actions";

export interface CopyItem {
    pageElementKey: PageElementKey;
    actions: CopyItemActions;
    // To be populated by processCopyItems
    originalPageElement?: GoogleAppsScript.Slides.PageElement;
    newPageElement?: GoogleAppsScript.Slides.PageElement;
}
