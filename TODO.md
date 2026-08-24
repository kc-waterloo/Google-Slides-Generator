# TODO

- [x] All feature work complete ✓

## Documentation

- [x] **Add README usage section** — Document exported functions: `createLongQuotesSlides`, `createShortQuotesSlides`, `createHighlightVariationSlides`, `replaceAll`, `setHeaders`, `createLongQuoteSlidesFromDoc`. Include parameter descriptions and expected page element key conventions
- [x] **Add inline JSDoc to all exported functions** — Many functions lack parameter/return documentation
- [x] **Document template slide requirements** — Describe the page element keys each function expects (e.g., `quote-text-box`, `section-title-text-box`, `top-bar-topic-1-of-3-text`)

## Code Quality

- [x] **Add `npm run format` with Prettier** — ESLint handles linting but not formatting. Prettier would auto-format tabs, quotes, semicolons consistently
- [x] **Add `npm run typecheck`** — Separate type-checking step using `tsc --noEmit` so CI can validate types without building
- [x] **Add `npm run check` script** — Consolidates `lint`, `typecheck`, and `test` into one command for CI pipelines
- [x] **Set up GitHub Actions CI** — Run `check` on every push and PR

## Edge Cases / Bugs

- [x] **`set-headers/:89` — `headerSectionsStrings[base + i]` is undefined when all `sectionName` values are undefined or `headerSectionsStrings` is shorter than `headerLength`**. The resulting `setText_(undefined)` is guarded by `if (actions.newText)`, but no text is set on those copy items, producing empty header bars. Fixed: fallback `?? ""` + changed guard from truthy to `!== undefined` so empty string clears text.
- [x] **`set-headers/:100-101` — `copyItems[boldedIndex]` is undefined when `boldedIndex >= copyItems.length`**. Fixed: clamped to `copyItems.length - 1`.
- [x] **Inconsistent page element key matching** — `processCopyItems_` now trims `copyItem.pageElementKey` in destination Map lookup for consistency with template matching. Verified no callers depend on substring matching.

## Testing

- [x] **Add integration tests** — Test the full pipeline: `parseDocument_` → `parseDocumentItemsToLongQuoteItems_` → `createLongQuotesSlides` end-to-end. 7 new tests covering title/content, multi-paragraph, filtering, empty body, override keys, and mock isolation.
- [x] **Add mock for SpreadsheetApp** — Added `mockSpreadsheetApp` with `openByUrl`, `getActiveSpreadsheet`, `create`, and `setActiveSpreadsheet`.
- [x] **Increase mock coverage for nested GAS types** — Fixed `getMockShapeState` helper to correctly merge text range state (`text`) with text style state (`bold`, `fontSize`, etc.). Also improved `resetMocks()` to clear DocumentApp and SpreadsheetApp state between tests.

## Web UI

- [x] **Multi-call chaining** — Combine multiple function calls into one script output (e.g., `setHeaders` then `createLongQuotesSlides`)
- [x] **Function call history** — Save previously generated calls to localStorage with browse/recall UI
- [x] **Number formatting toggle** — Option to show numbers as typed (e.g., `SlideNumber(1)`) in generated code

## Infrastructure

- [x] **Set up GitHub Actions CI** — Run `check` (lint + typecheck + test) on every push and PR
- [x] **Deploy web UI to GitHub Pages** — Auto-deploy `apps/web-ui` via GitHub Actions (`.github/workflows/deploy.yml`)
- [x] **Dependabot / Renovate** — Add automated dependency update config for npm packages (`.github/dependabot.yml`)
- [x] **Release script** — Automate version bumping, changelog generation, and `clasp push` for deployment (`.release.sh`)
