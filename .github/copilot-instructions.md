# Copilot workspace instructions for InspiraMe3.0

This repository is a Next.js + TypeScript web app packaged with Capacitor for Android. It is focused on creating inspirational image/video content, using Firebase for persistence and native sharing features.

> Canonical references:
> - `README.md` — setup, installation, build, deploy, and architecture overview
> - `docs/blueprint.md` — visual/design guidance and style direction

## Key workspace areas

- `src/app/` — Next.js routes, layouts, and page entrypoints
- `src/components/` — reusable UI components and presentation logic
- `src/hooks/` — custom React hooks for editor behavior, Firebase state, gallery, sharing, and camera integration
- `src/firebase/` — Firebase client setup, authentication, Firestore, and storage helpers
- `android/` — Capacitor Android native project and Gradle build configuration
- `scripts/validate-google-sheets.js` — helper script for Google Sheets validation

## Important commands

Use these scripts as the standard workspace commands:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run validate:google-sheets`
- `npm run deploy` (runs `deploy.sh`)

Capacitor Android workflow:
- `npm run build`
- `npx cap sync`
- `npx cap open android`

## Project conventions

- Framework: Next.js 14 + React 18 + TypeScript
- Styling: Tailwind CSS
- Backend: Firebase (`firebase` package) for Auth, Firestore, Storage
- Native integration: Capacitor 6 with Android support and device APIs like camera, share, clipboard, filesystem
- Maintain UI logic in React components and move shared logic into `src/hooks/`
- Keep Firebase setup and sensitive configuration out of source control
- `.env.local` is expected to contain Firebase and API credentials; do not commit secret values

## What this file is for

Use this instruction file when working across the repository:

- editing UI pages or layouts in `src/app/`
- updating custom hooks, editor features, or share workflows
- improving Firebase integration or Firestore data handling
- adjusting Capacitor Android build settings or native plugin behavior
- preserving app structure while implementing new editor/quote features

Do not duplicate the full README or blueprint content here; link to those files instead.

## Example prompts

- "Add a new `src/app/cadastro` page with form validation and Firebase save logic."
- "Refactor `src/hooks/use-image-editor.ts` to separate filter state from canvas rendering."
- "Update Android build settings in `android/app/build.gradle` for Capacitor 6 compatibility."
- "Improve `src/components/app-header.tsx` accessibility and Tailwind layout."
