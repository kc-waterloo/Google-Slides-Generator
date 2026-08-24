# @gsg/shared

Shared types, schemas, validation, and code generation for the Google Slides Generator.

## What it provides

- **Types** — `SlideNumber`, `SlideIndex`, `SlideId`, `Nullable`, `LongQuoteItem`, `ShortQuoteItem`, `SetHeaderItem`, `ReplacePair`, `TextStyleOverride`, page element key types
- **Schemas** — Runtime-validated parameter schemas for all GAS functions (`createLongQuotesSlides`, `createBulletSlide`, etc.)
- **Validation** — `validateParams()` checks function call parameters against schemas, returns typed error messages
- **Code Generation** — `generateCallString()` produces copy-paste-ready GAS function call strings; `parseFunctionCall()` reverse-engineers them
- **Template Layouts** — Metadata for the web UI's live slide preview feature

## Usage

```typescript
import { validateParams, generateCallString } from "@gsg/shared";

const params = { title: "Hello", bullets: ["A", "B"] };
validateParams("createBulletSlide", params);
// → null (valid)

const callString = generateCallString("createBulletSlide", params);
// → createBulletSlide({\n  title: "Hello",\n  bullets: ["A", "B"],\n})
```

## Tests

Run `npx -w @gsg/shared jest` or `npx -w @gsg/shared jest --coverage`.

Framework-agnostic (no GAS runtime mocks needed — pure TypeScript logic).
