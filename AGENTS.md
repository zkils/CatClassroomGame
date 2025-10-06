# Repository Guidelines

## Project Structure & Module Organization
The Vue 3 application lives under src/. Core bootstrapping happens in src/main.js, while page flows reside in src/views (e.g., CharacterSelectPage.vue, KoreanClassGame.vue). Shared UI pieces belong in src/components, and feature state is managed in Pinia stores inside src/stores with persisted state enabled. Route definitions live in src/router, static assets sit in src/assets, and public-facing files (favicons, index template) stay in public/. Built bundles are emitted to dist/; avoid editing generated output directly.

## Build, Test, and Development Commands
Run 
pm install once per machine to pull dependencies. Use 
pm run serve for a hot-reloading dev server at localhost; update routes or stores to see instant feedback. 
pm run build creates the production bundle in dist/ and should stay warning-free before release. 
pm run lint enforces the Vue + ESLint ruleset; run it before committing to keep diffs small. 
pm run deploy builds and publishes dist/ to GitHub Pages via gh-pages; ensure the branch is clean and authenticated first.

## Coding Style & Naming Conventions
Follow the ESLint config (plugin:vue/vue3-essential, eslint:recommended). Keep two-space indentation, prefer single quotes, and terminate statements without semicolons to match existing files. Name Vue components in PascalCase (CharacterSelectPage.vue) and export stores with camelCase (koreanGameStore). Group related composables and store helpers near their feature folders, and document non-obvious game logic with concise comments.

## Testing Guidelines
Automated tests are not yet configured; prioritize adding Vue Test Utils-driven unit specs under 	ests/unit named *.spec.js when introducing new mechanics. Until then, rely on 
pm run lint and manual QA that covers onboarding (Intro → Character → Game select) and each mini-game flow. Record edge cases?missing player names, locked classrooms, mobile viewport quirks?in PR notes so they can be replicated later.

## Commit & Pull Request Guidelines
Existing commits are short, imperative summaries (often in Korean) such as 게임선택 화면. Continue that pattern: a one-line present-tense change description, optionally prefixed with the feature area (한글, UI). Reference related issues with #123 when available, and include before/after screenshots or GIFs for UI changes. PR descriptions should list test evidence (commands run, manual checks) and call out any follow-up tasks like content additions or localization.
