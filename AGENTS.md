<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Quorlyn Frontend — Project Instructions

Everything below the managed block above is project-owned. `next dev` only rewrites the block between the `BEGIN:/END:nextjs-agent-rules` markers, so keep additions here.

## Stack (verify versions in `package.json` before using an API)

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16.3.x, App Router | Server Components by default. Docs: `node_modules/next/dist/docs/01-app/` |
| React | 19.2.x | Async components, `use()`, Actions, native custom-element support |
| Language | TypeScript, `strict: true` | Path alias `@/*` → repo root |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) | CSS-first config in `app/globals.css`. **No `tailwind.config.js`** |
| Client state | Zustand | Only for state React/URL/server can't own — see rules below |
| Math input/render | MathLive | Client-only web component — see rules below |
| Lint | ESLint 9 flat config (`eslint.config.mjs`) | `next lint` was removed in 16; run `npm run lint` |

Anything not in this table is **not** a dependency yet. Do not add a library (form lib, data-fetching lib, UI kit, animation lib, date lib) without asking first — say what problem it solves and what the no-dependency alternative costs.

## How we work: docs in, frontend out

The user supplies the specs (API docs, design references, feature briefs, endpoint contracts). The implementation is yours.

1. **Read the supplied docs completely before writing code.** Put durable ones in `docs/` (see `docs/README.md`); pasted-in-chat docs are equally binding for that task.
2. **The doc is the contract.** Match endpoint paths, HTTP methods, payload shapes, field names, enum values, and error codes exactly as written. Never invent a field, rename one to something nicer, or guess a shape the doc doesn't define.
3. **Never invent an API surface to stub past a gap.** If the doc is missing something you need, do everything that doesn't depend on it, then ask one specific question naming the gap.
4. **Contradiction between the doc and existing code:** follow the doc, and say in your reply which existing code now disagrees.
5. **Framework questions never come from memory.** Next.js 16 broke APIs you know. Read `node_modules/next/dist/docs/` first; for Zustand/MathLive/Tailwind read the installed package's own docs and types under `node_modules/`.
6. **Report honestly.** If a build fails, paste the failure. If you skipped part of the scope, say which part and why.

## Commands

```bash
npm run dev        # next dev (Turbopack). Writes .next/dev/lock with PID/port/URL
npm run build      # next build — the real check; CSS order and prerender errors only show here
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

- Do not start a second `next dev`. If one is running, reuse it — the lock file names the port; a second launch prints the running URL and PID.
- `next dev` forwards browser console errors and warnings to the terminal. Read them; that's the client-side view you otherwise can't see.
- The dev server exposes an MCP endpoint at `/_next/mcp` (routes, server logs, `get_compilation_issues`, `compile_route`) — cheaper than a full build for "does it compile".

## Project structure

```
app/                     # routes ONLY: page, layout, loading, error, not-found, route, template
  (marketing)/           # route groups for layout boundaries, not for vanity URLs
  api/                   # Route Handlers
components/
  ui/                    # generic primitives (Button, Input, Dialog) — no domain knowledge
  <shared>.tsx           # shared composites
features/<feature>/      # domain slice: components/, hooks/, store.ts, api.ts, types.ts, schema.ts
lib/                     # framework-agnostic helpers: api client, utils, formatters, constants
hooks/                   # cross-feature hooks
types/                   # cross-feature types
stores/                  # cross-feature Zustand stores (feature stores live in the feature)
docs/                    # user-supplied specs
public/                  # static assets
```

Rules: keep `app/` thin — a route file composes feature components and does data fetching, nothing more. Code used by one feature lives in that feature; promote to `components/`, `lib/`, or `hooks/` only on the second consumer. No cross-imports between sibling `features/` — hoist the shared piece instead.

**Naming:** files and folders `kebab-case`; components `PascalCase` exported by name; hooks `use-x.ts` → `useX`; stores `x-store.ts` → `useXStore`; types `PascalCase`; constants `SCREAMING_SNAKE`. One component per file when it's exported; small private subcomponents may share the file.

## Rendering: server-first is the default

- Every component is a Server Component unless it needs state, effects, event handlers, or browser APIs.
- `"use client"` goes on **leaves**, as deep as possible. Putting it on a page or layout drags the whole subtree into the client bundle.
- Pass fetched data down as props. Never lift a component to the client just to hand data to a client child — pass Server Components through as `children`/props instead.
- Never `useEffect` + `fetch` for initial page data. Fetch it in the Server Component.
- Client Components must not import server-only modules (db clients, secrets, `server-only` code). Keep API keys and tokens in Server Components, Route Handlers, and Server Actions only. Only `NEXT_PUBLIC_*` env vars reach the browser.
- Streaming is the mechanism for slow data: return the shell immediately, wrap slow subtrees in `<Suspense>` with a real fallback (skeleton matching the final layout, not a spinner in an empty page).

## Next.js 16 specifics that differ from older training data

- **Request APIs are async — no sync fallback.** `await cookies()`, `await headers()`, `await draftMode()`, `await params`, `await searchParams`. Same for `params` in `route.ts`, `default.tsx`, `opengraph-image`, `icon`, and the `id` in `sitemap`.
- **Use the generated prop helpers**, don't hand-write prop types:
  ```tsx
  export default async function Page(props: PageProps<'/problems/[slug]'>) {
    const { slug } = await props.params
    const { page } = await props.searchParams
  }
  export default function Layout(props: LayoutProps<'/problems'>) {}
  export async function GET(req: Request, ctx: RouteContext<'/api/items/[id]'>) {}
  ```
  Run `npx next typegen` if a route's type isn't recognized yet.
- **`middleware.ts` is deprecated → `proxy.ts`** at project root, exporting `proxy()`. Node.js runtime only. Config flags renamed (`skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`). Proxy is for redirects/rewrites/headers/cookies — not for data loading or shared module state.
- **`revalidateTag(tag)` now takes a cacheLife profile: `revalidateTag('problems', 'max')`.** One-arg form is deprecated and errors in TS.
- **`updateTag(tag)`** (Server Actions only) for read-your-writes: expire + refresh in the same request, so the user sees their own mutation immediately. `revalidateTag` is stale-while-revalidate — use it when a short delay is fine.
- **`refresh()`** from `next/cache` refreshes the client router from a Server Action.
- `cacheLife` / `cacheTag` are stable — import from `next/cache` without `unstable_`.
- `experimental.dynamicIO` / `experimental.useCache` are gone. **Do not enable `cacheComponents` or `instant` without asking** — Cache Components changes the whole prerender model and surfaces build errors for uncached data outside `<Suspense>`. Until then, follow `02-guides/caching-without-cache-components.md`, not `01-getting-started/08-caching.md`.
- `next lint` is removed; AMP support is removed; `images.domains` is deprecated in favor of `images.remotePatterns`; Parallel Routes require `default.js`.
- `next/dynamic` with `ssr: false` **only works inside a Client Component** — it errors in a Server Component.

## Data fetching

- Fetch in Server Components, close to where the data is used; parallelize independent requests with `Promise.all` rather than awaiting in sequence.
- Centralize network access in `lib/api/` (or `features/<x>/api.ts`): base URL from env, typed request/response, one place that maps HTTP errors to app errors. No raw `fetch` scattered through components.
- Validate/narrow external responses at the boundary and export the resulting types — don't let `any` from an API leak into components.
- Mutations go through Server Actions (`"use server"`) or Route Handlers, then `updateTag`/`revalidateTag`/`refresh`. Never mutate from a client-side `fetch` that bypasses revalidation and then patch local state to compensate.
- Server Actions are public HTTP endpoints: re-check auth and re-validate input inside the action, every time.

## Zustand

Zustand holds **client-only, cross-component UI state** — editor mode, panel/dialog state, multi-step wizard progress, unsaved local draft, user preferences. It is not a cache for server data (that's the server's job) and not a substitute for `useState` in one component or for URL state (filters, tabs, pagination belong in `searchParams` so they're shareable and SSR-correct).

**SSR rules — these prevent cross-request data leaks:**

- A module-scope `create()` store is a **module-level singleton shared by every request on the server**. That is only acceptable for stores that hold no request- or user-specific data and are never written during render.
- Any store seeded with server data (user, session, problem set, submission) must be **per-request**, via `createStore` + a Context provider:

  ```tsx
  // features/editor/store.ts
  import { createStore } from 'zustand/vanilla'

  export type EditorState = { latex: string; setLatex: (v: string) => void }

  export const createEditorStore = (init: Pick<EditorState, 'latex'>) =>
    createStore<EditorState>()((set) => ({
      ...init,
      setLatex: (latex) => set({ latex }),
    }))
  ```

  ```tsx
  // features/editor/store-provider.tsx
  'use client'
  import { createContext, useContext, useRef } from 'react'
  import { useStore } from 'zustand'
  import { createEditorStore, type EditorState } from './store'

  type Store = ReturnType<typeof createEditorStore>
  const EditorStoreContext = createContext<Store | null>(null)

  export function EditorStoreProvider({ children, latex }: { children: React.ReactNode; latex: string }) {
    const storeRef = useRef<Store | null>(null)
    if (storeRef.current === null) storeRef.current = createEditorStore({ latex })
    return <EditorStoreContext.Provider value={storeRef.current}>{children}</EditorStoreContext.Provider>
  }

  export function useEditorStore<T>(selector: (s: EditorState) => T): T {
    const store = useContext(EditorStoreContext)
    if (!store) throw new Error('useEditorStore must be used inside EditorStoreProvider')
    return useStore(store, selector)
  }
  ```

  The Server Component renders `<EditorStoreProvider latex={...}>` with server data; the provider itself is the `"use client"` boundary.
- **Never call a store hook in a Server Component**, and never `getState()` during render.
- **Always select narrowly**: `useEditorStore((s) => s.latex)`. Selecting the whole store re-renders on every change. For object/array selections use `useShallow` (`zustand/react/shallow` in v5) — returning a fresh object from a selector without it causes infinite re-renders.
- Keep actions inside the store next to the state they touch; components call actions, never `set` directly.
- **`persist` middleware causes hydration mismatches.** Use `skipHydration: true` and rehydrate in an effect, or render the persisted value only after mount. Never let server HTML depend on `localStorage`.
- Split by domain into several small stores over one god-store.

## MathLive

MathLive is a web component (`<math-field>` / `MathfieldElement`) that touches `window`, `document`, and `customElements` at import time. **It cannot be imported into anything that renders on the server.**

- Wrap it in exactly one `"use client"` component (e.g. `components/math-field.tsx`), import `mathlive` inside that module (or lazily in an effect), and let the rest of the app use only the wrapper.
- Load the wrapper with `next/dynamic` + `ssr: false` **from a Client Component**, with a `loading` placeholder sized like the field so layout doesn't shift.
- Configure statics (`MathfieldElement.fontsDirectory`, `soundsDirectory`) once, on the client, before the first field mounts. Copy the fonts shipped in the installed `mathlive` package into `public/` and point `fontsDirectory` at that public path — verify the actual directory in `node_modules/mathlive/` rather than assuming it.
- **The mathfield owns its own editing state.** Keep LaTeX in React/Zustand as a plain string, write back to the element imperatively only when the incoming value differs from `mf.value`, and read changes from the element's `input` event. Re-assigning `value` on every render resets the cursor mid-typing.
- Declare the custom element for TSX once (a `math-field` entry in a global JSX intrinsics declaration) instead of casting at each use site.
- Render-only math (no editing) should be static/read-only output, not an editable field.
- Accessibility: every field needs a label and a keyboard-reachable path; don't trap focus inside the virtual keyboard.
- Before writing MathLive code, read the installed package's types (`node_modules/mathlive/dist/types/`) and any MathLive doc the user has put in `docs/`.

## Tailwind v4

- Config is CSS-first in `app/globals.css`: `@import "tailwindcss";` then `@theme { --color-*, --font-*, --spacing-*, ... }` for design tokens. **There is no `tailwind.config.js` — don't create one** and don't use v3-era `theme.extend` JS config.
- Define colors, fonts, radii, and breakpoints as theme tokens and use the generated utilities. No arbitrary hex values sprinkled across components (`bg-[#3b82f6]`) once a token exists.
- Fonts come from `next/font` and are wired as CSS variables in `app/layout.tsx` (`--font-geist-sans`, `--font-geist-mono`) — reference the variables, never `<link>` a font.
- Utilities in JSX are the default. Reach for `@apply` or a CSS Module only for something utilities genuinely can't express (complex selectors, third-party overrides, `::part()` styling for MathLive).
- Use a `cn()` helper in `lib/utils.ts` for conditional classes; never build class names by string concatenation of dynamic fragments (Tailwind can't see them).
- Mobile-first responsive; support dark mode via tokens rather than duplicating palettes per component.
- Keep global CSS truly global (resets, tokens, base element styles). Import CSS from a single entry point so build-time CSS order stays predictable — and confirm order in `next build`, not just `dev`.

## Components, forms, and UX

- Props typed explicitly; no `any`, no `React.FC`. Prefer discriminated unions over boolean-flag soup.
- Every route that fetches gets a `loading.tsx` (or `<Suspense>`) and an `error.tsx` (Client Component with `reset`); `not-found.tsx` where a resource can be missing.
- Forms: native `<form>` + Server Action where the mutation is server-side; `useActionState` for pending/error, `useFormStatus` in submit buttons. Validate on the server always, client-side only as a UX nicety.
- Loading states are skeletons shaped like the content. Disable submit buttons while pending. Show real error messages, never a silent failure.
- Accessibility is not optional: semantic elements, labels tied to inputs, visible focus, `aria-*` only when semantics can't carry it, keyboard paths for every interaction, alt text on meaningful images.
- Images through `next/image` with explicit sizing; `next/link` for internal navigation.
- Metadata: export `metadata` or `generateMetadata` per route — no route ships the `create-next-app` defaults.

## Definition of done

1. `npm run typecheck` clean (no new `any`, no `@ts-ignore` without a comment saying why).
2. `npm run lint` clean.
3. `npm run build` succeeds — it catches prerender and CSS-order problems `dev` hides.
4. Verified in the running app for anything visual or interactive, including the client-side console output that `next dev` forwards to the terminal.
5. The reply states what changed, what was verified, what was assumed, and anything left out.

## Never do

- Never mark a component `"use client"` to make an error disappear without understanding why it was server-side.
- Never fetch initial data in `useEffect`, and never mirror server data into Zustand as a cache.
- Never put user-specific state in a module-scope store used during SSR.
- Never re-assign `math-field.value` on every render.
- Never create `tailwind.config.js`, resurrect `middleware.ts`, or call `revalidateTag` with one argument.
- Never invent API fields, endpoints, or response shapes the supplied docs don't define.
- Never leave `TODO`/placeholder UI in a feature reported as complete.
- Never commit, push, or install packages unless asked.
