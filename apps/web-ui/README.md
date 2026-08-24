# @gsg/web-ui

Client-side React UI for the Google Slides Generator. No backend — runs entirely in the browser.

## What it does

- **Function Call Generator** — Select a GAS function, fill in parameters via a dynamic form, and get a copy-paste-ready function call string
- **Live Preview** — Shows a mock slide preview based on template layouts and current parameter values
- **Import/Export** — Import existing function calls from text, export generated calls
- **Call History** — Browse recent generated calls with the CallChain component

## Stack

- React 18
- Vite + Vitest
- Imports types, schemas, and code generation from `@gsg/shared`

## Development

```bash
# Start dev server (localhost:5173)
npm run dev

# Run tests
npm run test

# Type-check
npx -w @gsg/web-ui tsc --noEmit

# Production build
npm run build
```

## Notes

- No API calls — all data stays in the browser
- GAS types (`GoogleAppsScript.Slides.ThemeColorType`) are referenced as strings, not imported (no GAS dependency)
