# Copilot Workspace Instructions

These instructions guide AI coding agents working in this repository. They codify how this project is built, tested, and structured so an agent can contribute productively and safely.

## Project overview

- Library name: `dom-once` — utilities to run DOM actions once per element using a whitespace-delimited data attribute (default `data-dom-once`).
- Public API (src/dom-once.ts): `querySelectorOnce`, `doOnce`, `removeOnce`, `findOnce`, and `version` (re-exported from `src/version.ts`).
- Core design: pure, framework-agnostic functions operating on standard DOM types; no global mutation beyond data attributes on elements.
- Key patterns: strict input validation via assertion helpers, read-modify-write on a single data attribute, and selector-type branching for performance.

## Conventions and patterns

- Top-of-file header: JSDoc banner with a brief API summary and an `@module` tag matching the package name (e.g., `@briantbailey/dom-once`). License and author are documented in `LICENSE` and `package.json` and are not repeated in source headers.
- Types: `DataAttribute` is a branded template string type (e.g., `data-foo`) that must start with `data-` and allows `[a-z0-9.:-]`; `OnceId` is a validated string (alphanumeric plus `_` and `-`).
- Validation helpers throw early (`assertValidOnceId`, `assertValidDataAttribute`, `assertValidSelectorTypes`, `assertValidContext`). Reflect these behaviors in new APIs.
- Attribute name constant: default is `data-dom-once` (see `ONCE_ATTRIBUTE_NAME`). Keep tokens space-delimited; match with CSS `[attr~="token"]`.
- Performance: prefer `element.matches(`[${attr}~="${id}"]`)` to avoid string splitting when checking membership.
- Do not hardcode the package version; import `{ version }` from `src/version.ts`.
- Also re-export `version` at the top of `src/dom-once.ts` with a brief one-line JSDoc for discoverability in editors and docs.
- Maintain exhaustive but minimal branching for selector shapes: string | Element | Iterable<Element> | ArrayLike<Element>.
- Public API JSDoc: include `@param`, `@returns`, `@template` (for generics), and a few concise `@example` blocks to aid IntelliSense and JSR docs. Keep examples short and practical.
- Keep public JSDoc concise overall to balance readability and JSR-generated docs; prefer focused descriptions over exhaustive prose.
- Prefer 1–2 short `@example` blocks per function; reference `tests/dom-once.test.ts` for extended scenarios.
- Section organization: place region markers above the visual separators so folding collapses the entire section (header + separator + content).

## Build, test, and lint

- Package manager: pnpm.
- Primary scripts:
  - `pnpm run check` — ESLint + `tsc --noEmit` + `vitest run` (CI-style).
  - `pnpm run dev` — build with tsdown in watch mode.
  - `pnpm run build` — generate version then bundle via tsdown.
  - `pnpm run test` / `pnpm run test:ci` — Vitest; coverage via `pnpm run coverage`.
- Test environment: `happy-dom` (see `devDependencies`); write tests in `tests/*.test.ts` and use DOM APIs directly.

## Source layout

- `src/dom-once.ts` — main implementation with exported API and internal helpers. Uses region comments and small focused functions.
- `src/version.ts` — auto-generated; contains `export const version = "x.y.z"`.
- `scripts/generate-version.js` — populates `src/version.ts` during `prebuild`.
- Build output: `dist/` (types and ESM bundle). Do not edit `dist`.

## API contracts (examples)

- `querySelectorOnce(onceId, selector, { onceAttribute?, context? }) => Element[]`
  - Returns only elements newly marked with the token; empty string selector returns `[]`.
- `doOnce(onceId, selector, callback, opts) => Element[]`
  - Executes callback only for unmarked elements; adds token after callback.
- `removeOnce(onceId, selector, opts) => Element[]`
  - Returns only elements actually modified; removes attribute when last token is removed.
- `findOnce(onceId, opts) => Element[]`
  - Read-only; finds all elements with the exact token using `[attr~="token"]`.
- All functions validate inputs and throw `TypeError` or `Error` with specific messages when invalid.

## When adding or changing code

- Preserve public API names and parameter shapes; update tests if behavior changes are intentional.
- Follow the validation-first pattern and section headers; avoid reformatting unrelated code.
- Keep DOM operations minimal and side-effect free beyond updating the once attribute.
- Add unit tests in `tests/dom-once.test.ts` that mirror the existing style (happy-dom, explicit edge cases, order guarantees).

## Common tasks (commands)

```bash
pnpm install
pnpm run check      # lint + typecheck + tests
pnpm run dev        # watch build
pnpm run build      # generate version + bundle
pnpm run coverage   # vitest coverage
```

## References

- Example implementation: `src/dom-once.ts`
- Tests that define behavior: `tests/dom-once.test.ts`
- Build config: `tsdown.config.ts`, `tsconfig.json`, `vitest.config.ts`
- Lint config: `eslint.config.ts`
- License: `LICENSE` (MIT)
