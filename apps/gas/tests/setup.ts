/**
 * tests/setup.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 *
 * Jest setup: register Google Apps Script global mocks before tests.
 */

/**
 * setup.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import {
	mockSlidesApp,
	mockDocumentApp,
} from "./__mocks__/google-apps-script";

// Register GAS globals
(globalThis as Record<string, unknown>).SlidesApp = mockSlidesApp;
(globalThis as Record<string, unknown>).DocumentApp = mockDocumentApp;
