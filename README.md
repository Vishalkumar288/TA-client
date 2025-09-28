Summary — TA-client repository

What it is
- A small Next.js (App router) client application that provides a form for logging "distance" entries (date, distance, from/to places) and submitting them to a backend.
- Focused on a simple single-page UI (max width ~430px) with a multi-tag input for places, a date picker, local cache of form values, and an MFA step (6-digit token) before submit.
- It is ment for logging your day-to-day travel distance by your vehicle to generate a TA Bill sheet

Primary technologies
- Next.js (app directory) — next 15.x (app router)
- React 19
- TypeScript (project configured for TS)
- Tailwind CSS + PostCSS
- Axios for HTTP client
- @tanstack/react-query for mutation and devtools
- Lucide icons for small UI icons

Repository structure (important files/directories)
- app/
  - components/LogSheetForm/index.tsx — main form component and business logic (local cache, validation, MFA flow)
  - page.tsx — renders the LogSheetForm
  - layout.tsx — provides global QueryClientProvider + React Query Devtools
  - globals.css — basic Tailwind + simple theme variables
  - shared/
    - formInputs/TextInput.tsx and MultiTagInput.tsx — reusable form controls (multi-chip input with suggestions)
    - layouts/AlertMessage.tsx — small alert component
    - constants/ — small constant files (queryKeys, storageKeys)
  - queryHooks/
    - LogSheet/service.ts — createLog wrapper calling axios client
    - LogSheet/useCreateLog.ts — react-query mutation hook
    - client/index.ts — axios client configured with baseURL from NEXT_PUBLIC_API_URL
- public/ — SVG assets and favicon (favicon referenced by raw URL)
- .env.sample — NEXT_PUBLIC_API_URL default
- package.json, tailwind.config.js, postcss.config.mjs, tsconfig.json, eslint config, etc.

Key behavior / UX
- Form fields: Distance (string), From (multi-tag), To (multi-tag), Date, and a conditional Google Authenticator 6-digit code.
- Local caching: distance/from/to cached in localStorage under storageKeys.CACHE_KEY ("lOG-SHEET-VALUES") — the app restores those after successful submit or on mount.
- Client-side validation: required fields, token must be 6 digits before request.
- Submits via axios to POST /log-entry (base URL from NEXT_PUBLIC_API_URL) using a react-query mutation.
- React Query DevTools integrated in layout.

Notable implementation details & observations
- Uses "use client" at component and layout levels (app router + client components).
- Query client instance is created at module scope in layout.tsx — acceptable for a simple app but be mindful of SSR/edge constraints.
- MultiTagInput: supports suggestions, enter-to-add, backspace-to-remove-last, and blur auto-converts typed text into a chip.
- Token validation is a simple regex /^\d{6}$/.
- storageKeys.CACHE_KEY has unusual casing ("lOG-SHEET-VALUES") — likely intentional but worth checking for consistency.
- NEXT_PUBLIC_API_URL is required to connect to the API; .env.sample points to http://localhost:40002.
- Tailwind content paths reference "./pages" and "./components", but this repo uses ./src/app — tailwind.config.js content globs may need updating to avoid missing classes in production builds.

How to run (quick)
1. Copy .env.sample to .env and set NEXT_PUBLIC_API_URL as needed.
2. npm install
3. npm run dev (package.json uses next dev --turbopack) — then open the app (default Next port).
