<p align="center">
    <img
        alt="Google Slides Generator Icon"
        src="./readme-assets/icon-rounded.png"
        width="100px"
    />
    <h1 align="center"> Google Slides Generator </h1>
</p>

> A Google App Script that generates slides based on given templates

<h2> Table of Contents </h2>

- [Technologies Used](#technologies-used)
- [Setup](#setup)
- [Usage](#usage)
- [Template Requirements](#template-requirements)

## Technologies Used

<table>
<tbody>
    <tr align="center" valign="center">
        <td width="20.00000%" align="center">
            <a href="https://github.com/google/clasp">
                <img
                    alt="Clasp Logo"
                    src="./readme-assets/google.svg"
                    width="100%"
                >
            </a>
        </td>		
        <td width="20.00000%" align="center">
            <a href="https://nodejs.org/en">
                <img
                    alt="Node.js Logo"
                    src="./readme-assets/nodejs.svg"
                    width="100%"
                >
            </a>
        </td>		
        <td width="20.00000%" align="center">
            <a href="https://www.typescriptlang.org/">
                <img
                    alt="Typescript Logo"
                    src="./readme-assets/typescript.svg"
                    width="100%"
                >
            </a>
        </td>		
        <td width="20.00000%" align="center">
            <a href="https://rollupjs.org/">
                <img
                    alt="Rollup Logo"
                    src="./readme-assets/rollup.svg"
                    width="100%"
                >
            </a>
        </td>		
        <td width="20.00000%" align="center">
            <a href="https://eslint.org/">
                <img
                    alt="ESLint Logo"
                    src="./readme-assets/eslint.svg"
                    width="100%"
                >
            </a>
        </td>		
    </tr>
    <tr align="center" valign="center">
        <td width="20.00000%" align="center">
            <a href="https://github.com/google/clasp">
                <b>
                    Clasp
                </b>
            </a>
        </td>
        <td width="20.00000%" align="center">
            <a href="https://nodejs.org/en">
                <b>
                    Node.js
                </b>
            </a>
        </td>
        <td width="20.00000%" align="center">
            <a href="https://www.typescriptlang.org/">
                <b>
                    Typescript
                </b>
            </a>
        </td>
        <td width="20.00000%" align="center">
            <a href="https://rollupjs.org/">
                <b>
                    Rollup
                </b>
            </a>
        </td>
        <td width="20.00000%" align="center">
            <a href="https://eslint.org/">
                <b>
                    ESLint
                </b>
            </a>
        </td>
    </tr>
</tbody>
</table>

## Setup

1. Run `npm i`
2. In this directory (the root directory for this repository), create a file named `.clasp.json` with the following contents

    ```json
    {
        "scriptId":"REPLACE_THIS_WITH_YOUR_SCRIPT_ID",
        "rootDir":"./dist"
    }
    ```

3. Run `npm run push` and confirm that the contents of the repo are properly pushed to the Google App Script project

## Usage

All functions are exposed globally in the GAS runtime. Call them from your GAS `Code.gs` or the script editor.

### Slide Generation

| Function | Description | Template Keys |
|----------|-------------|---------------|
| `createLongQuotesSlides` | Generates title + content slides from quote items (split by paragraph) | Title: `section-title-text-box`, `section-subtitle-text-box`; Content: `quote-text-box`, `addendum-text-box` |
| `createShortQuotesSlides` | Generates slides from quote/addendum pairs | `quote-text-box`, `addendum-text-box` |
| `createLongQuoteSlidesFromDoc` | Parses a Google Doc, then delegates to `createLongQuotesSlides` | Same as above |
| `createBulletSlide` | Creates a single slide with title + bullet points | `bullet-title-text-box`, `bullet-point-N-text` |
| `createSummarySlide` | Auto-generates a table-of-contents from section titles | Scans `section-title-text-box`; fills `summary-title-text`, `summary-item-N-text` |
| `createHighlightVariationSlides` | Creates highlight variations from a multi-page input slide | `point-N-of-M-text-box`, `point-N-of-M-number-indicator-text-box` |
| `createVerseSlides` | Turns Bible references into slides, then delegates to `createShortQuotesSlides` | `quote-text-box`, `addendum-text-box` |

### Slide Management

| Function | Description |
|----------|-------------|
| `duplicateSlideRange` | Duplicates a range of slides and inserts copies at a target position |
| `moveSlides` | Moves a range of slides to a new position (copy + remove originals) |
| `applyBackgroundColor` | Sets a solid background color on a range of slides |
| `replaceAll` | Replaces text across slides using `slide.replaceAllText()` |
| `batchReplaceText` | Performs multiple text replacement pairs across slides |
| `batchSetTextStyle` | Applies font/color/style overrides to page elements matching keys |
| `setHeaders` | Sets header bars with scrolling section labels across slide ranges |

### Verse Sources

`createVerseSlides` takes references as strings and fetches the text for you:

```js
createVerseSlides({
  verseItemInputs: ["Psalms 42:5 niv", "창세기 1:1-3 개역개정", "고전13:4-7 개역개정"],
  templateSlideNumber: null,
  insertionSlideNumber: 9,
  versionSources: [
    {
      version: "개역개정",
      fileUrl: "https://drive.google.com/file/d/<file-id>/view"
    }
  ]
})
```

A version listed in `versionSources` is read from a JSON file in Google Drive; every
other version goes to the jsonbible.com API as before.

The Drive file must be a flat object keyed `<book abbreviation><chapter>:<verse>`:

```json
{ "창1:1": "태초에 하나님이 천지를 창조하시니라", "창1:2": "..." }
```

Books may be written as the file's abbreviation (`창1:1`) or as the full Korean name
(`창세기 1:1`) — all 66 books are mapped. Keys that cover a range (`겔24:4-5`) are
expanded on load, so each verse in them is still reachable on its own. A verse the
file lacks is logged and renders as `API ERROR: Not found` rather than failing the run.

**These JSON files are never committed** — `.gitignore` blocks them. Upload the file to
Drive and pass its URL. Reading it needs the Drive scope, so re-authorize the script the
first time you use a version source.

### Template Requirements

Functions that use template slides auto-detect the correct template by scanning for specific page element keys. Set `templateSlideNumber: null` to enable auto-detection (recommended), or specify a slide number to use that slide as the template.

| Key Pattern | Used By | Description |
|-------------|---------|-------------|
| `quote-text-box` | Short/Long Quotes | Quote text content |
| `addendum-text-box` | Short/Long Quotes | Addendum/source text |
| `section-title-text-box` | Long Quotes, Summary Slide | Section title text |
| `section-subtitle-text-box` | Long Quotes | Section subtitle text |
| `bullet-title-text-box` | Bullet Slide | Bullet slide title |
| `bullet-point-N-text` | Bullet Slide | Bullet point text (N = 1, 2, 3...) |
| `summary-title-text` | Summary Slide | Summary slide heading |
| `summary-item-N-text` | Summary Slide | Summary entry text (N = 1, 2, 3...) |
| `top-bar-border-key` | Set Headers | Header bar border element |
| `top-bar-topic-N-of-M-text` | Set Headers | Header section labels |
| `point-N-of-M-text-box` | Highlight Variations | Highlight page text |
| `point-N-of-M-number-indicator-text-box` | Highlight Variations | Highlight page number indicator |

Most keys can be overridden via corresponding `override*` parameters.

## Architecture

This monorepo has three workspaces:

| Package | Location | Purpose |
|---------|----------|---------|
| **gas** | `apps/gas/` | GAS source code. TypeScript → Rollup → `dist/bundle.js` → `clasp push`. Uses `@types/google-apps-script`. |
| **shared** | `apps/shared/` | Framework-agnostic types, schemas, validation, and code generation. No GAS types. Pure TypeScript. |
| **web-ui** | `apps/web-ui/` | Vite + React app for generating function call strings. Client-side only. No backend. |

### Import rules

- `@gsg/shared` types (`Nullable`, `SlideNumber`, etc.) must be imported from the shared package, never defined locally.
- GAS-specific types (`PageElementKey`, `CopyItem`, `TitleItem`) stay in `apps/gas/`.
- Web UI imports schemas, validation, and code generation from `@gsg/shared`.

## Contributing

1. **Commits** follow conventional commits (`feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`, `ci:`). Enforced by commitlint in the pre-commit hook.
2. **Pre-commit hook** runs lint-staged (ESLint --fix + jest --findRelatedTests).
3. **Always run `npm run test`** before committing — 796+ tests across all three packages.
4. **Type-check affected packages** with `npx -w <package> tsc --noEmit`.
5. **Coverage** — check with `npx -w @gsg/gas jest --coverage` or `npx -w @gsg/shared jest --coverage`.
6. **Code style** — tabs for indentation, double quotes, semicolons. ESLint rules in root config.

### Key Commands

| Command | What it does |
|---|---|
| `npm run test` | Runs all tests (GAS + shared + web UI) |
| `npm run dev` | Starts Vite dev server at localhost:5173 |
| `npm run build:gas` | Rollup build for GAS deployment |
| `npm run lint` | ESLint across all apps/ |
| `npm run push` | Build + clasp push GAS code |
| `npx -w @gsg/web-ui tsc --noEmit` | Type-check web UI only |
| `npx -w @gsg/shared jest` | Run shared package tests only |

### Example

```javascript
createLongQuotesSlides({
  longQuoteItems: [
    {
      title: "Introduction",
      subtitle: "Chapter 1",
      quote: "First paragraph.\n\nSecond paragraph.",
      addendum: "Source A",
      splitMode: "paragraph",
    },
  ],
  templateTitleSlideNumber: null,
  templateContentSlideNumber: null,
  insertionSlideNumber: 3,
});
```
