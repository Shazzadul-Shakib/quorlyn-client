# Quorlyn

Quorlyn is a multi-tenant web platform for schools and classrooms to run
timed, proctored online exams. A teacher authors a quiz — plain text,
Bangla, English, or inline mathematics/chemistry notation — publishes it,
and shares a link. A student opens that link, sits a timed attempt with
answers autosaving as they go, and the teacher gets per-question difficulty
breakdowns and a leaderboard once it closes.

This repository is the frontend only: a Next.js 16 (App Router) application
that talks to a separate NestJS backend (`quorlyn-backend`, not part of this
repo) over HTTP. It owns no database and no exam-grading logic — its job is
auth/session plumbing, the authoring UI, and the exam-taking UI, including
the parts of exam integrity (focus tracking, autosave, reconnection) that
have to run in the student's browser.

## What it can do

- **Multi-tenant organizations.** One user account can belong to several
  organizations (schools) at once, each with its own role. A platform
  superadmin creates organizations; an organization can be suspended
  platform-wide without deleting it.
- **Role-based access inside an organization.** `TEACHER` and `STUDENT` are
  the two membership roles. An organization owner has every permission by
  default; a non-owner teacher can be granted any combination of
  `MANAGE_QUIZZES`, `MANAGE_MEMBERS`, `VIEW_RESULTS`, `MANAGE_ORGANIZATION`.
- **Two ways to join an organization**: a shareable join code, or a
  per-person email invite link.
- **Quiz authoring** with single-choice, multi-choice, and true/false
  questions; a question's prompt and answer options can mix plain text,
  Bangla, and LaTeX math/chemistry notation (`$…$` inline, `$$…$$` display)
  in the same field, edited with a MathLive formula editor and rendered
  identically wherever it's shown.
- **Quiz lifecycle**: draft → published → closed → archived, plus
  duplication, a scheduled open/close window, per-question point values,
  shuffle-on-attempt, a configurable scoring policy across multiple
  attempts (best / first / latest), and a focus-violation limit.
- **Shareable exam links** with an optional label, expiry, and max-use
  count, independent of the quiz's own open/close window.
- **A timed exam runner** that is the server's clock, not the browser's: a
  15-second heartbeat keeps the attempt alive and reconciles the deadline,
  answers autosave a few hundred milliseconds after each change with
  retry-on-failure, tab/window-blur/fullscreen-exit/copy/paste are recorded
  as proctoring events, a dropped connection reconnects and catches up
  rather than losing the attempt, and the exam auto-submits on timer
  expiry, a closed quiz, an admin action, or too many focus violations —
  each with its own recorded submission cause.
- **Results and analytics**: per-attempt grading detail, a leaderboard (one
  counted attempt per student, per the quiz's scoring policy), a
  score-distribution chart, and a per-question difficulty breakdown.

## The four surfaces

| Surface | Who | Can do |
| --- | --- | --- |
| **Platform admin** | Superadmin | Create organizations, see the platform-wide list, suspend/restore an organization's access |
| **Organization dashboard** | Org owner, or a teacher with `MANAGE_MEMBERS` / `MANAGE_ORGANIZATION` | Manage members and their permissions, send/revoke invites, rotate the join code, edit org settings, see org-wide stats |
| **Teacher workspace** | Org owner, or a teacher with `MANAGE_QUIZZES` | Author and publish quizzes, manage questions, generate/revoke share links, read results and the leaderboard |
| **Student** | Any user with a `STUDENT` membership | See progress across every organization they belong to, open a shared exam link, sit the timed attempt, view their own results |

Navigation (`features/shell/nav.tsx`) only ever shows what the current
membership and permissions allow; page-level guards
(`features/shell/guard.ts`) enforce the same rule again for anyone who hits
a URL directly. The backend is the actual authority in every case — these
are UI conveniences, not the security boundary.

## End-to-end user flow

1. **A superadmin creates an organization** at `/app/admin/organizations`
   and gets a join code for it.
2. **People join the organization** one of two ways:
   - An existing member with `MANAGE_MEMBERS` sends an **email invite**
     (`/app/organization/invites`); the recipient opens `/invite/[token]`,
     sets a password if they're new, and lands in the organization as a
     `TEACHER` or `STUDENT`.
   - Anyone with the **join code** enters it at `/join`.
   - A suspended organization shows as disabled everywhere a user would
     otherwise pick it — joining or selecting into it is blocked.
3. **Logging in** (`/login`) is device-locked: a session belongs to one
   device at a time. Signing in from a second device returns a 409 and
   offers an emailed one-time code to move the session, rather than
   silently allowing two active sessions.
4. **Choosing an organization.** A user with more than one active
   membership sees an organization picker after login; a user with exactly
   one goes straight to their dashboard; a superadmin with no memberships
   goes straight to the platform admin view.
5. **A teacher authors a quiz** (`/app/quizzes` → create → the quiz's own
   editor page): set duration, subject, language, scoring policy, and
   scheduling; add questions with the MathLive formula field for anything
   beyond plain text; reorder, edit, or delete questions; publish when
   ready.
6. **The teacher shares it**: `/app/quizzes/[id]/links` generates one or
   more link tokens (each independently expirable/limited). The backend —
   not this frontend — fixes the shape of every link it hands out:
   `{FRONTEND_URL}/exam/{token}`.
7. **A student opens the link** at `/exam/[token]`: a public landing page
   (no login required to preview) showing the quiz's title, duration, and
   window, with a start/resume action once the student is signed in.
8. **The student sits the exam** at `/exam/attempt/[attemptId]`: a
   full-screen, chrome-free timer view. Requesting fullscreen, the
   heartbeat, autosave, and proctoring-event loops all start only after the
   student clicks "Begin". The countdown is reconciled against the
   server's clock on every heartbeat, not the browser's local timer.
9. **Submission** happens manually (a confirm dialog, not
   `window.confirm`) or automatically — timer expiry, the quiz closing,
   an admin closing it, or exceeding the focus-violation limit each set a
   distinct `submissionCause` the student and teacher both see later.
10. **Results**: the student sees their own outcome immediately; the
    teacher sees the full roster, per-attempt detail, the leaderboard, and
    the difficulty/score-distribution charts at
    `/app/quizzes/[id]/results`.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), Server Components by default |
| UI library | React 19 |
| Language | TypeScript (`strict`) |
| Styling | Tailwind CSS v4 — CSS-first tokens in `app/globals.css`, no `tailwind.config.js` |
| Client state | Zustand — only for state nothing else can own (e.g. the toast queue) |
| Math input/rendering | MathLive — client-side editing, server-side static rendering (no KaTeX, no client JS to *read* a formula) |
| Auth session | httpOnly cookies set by the frontend itself; the browser never holds a token |
| Lint/typecheck | ESLint 9 (flat config), `tsc --noEmit` |

Nothing else is a dependency — see `AGENTS.md` before adding one.

## How data fetching, auth, and caching work

There is no client-visible API layer and no HTTP response cache: every
request is treated as user- and organization-specific, so this app
deliberately fetches with `cache: "no-store"` everywhere and relies on
Next's request revalidation instead of a data cache.

- **Tokens live in httpOnly cookies** (`qr_at` access, `qr_rt` refresh,
  `qr_org` selected organization, `qr_did` device id) — never in
  `localStorage` or a client-readable cookie, so no script, ours or
  injected, can read them. See `lib/session.ts`.
- **`proxy.ts`** (Next's replacement for `middleware.ts`) runs on every
  request: it generates a device id on first visit, refreshes the access
  token ~90 seconds before it expires so a Server Component render never
  hits a 401, redirects unauthenticated requests to `/login` (except the
  public routes it lists explicitly — the landing page, login, join,
  invite, and the `/exam/{token}` link-landing page), and drops the whole
  session if a refresh attempt fails.
- **Two read/write paths in `lib/api/`**, both server-only:
  - `api()` (`lib/api/server.ts`) — for Server Components. It reads the
    session cookies and calls the backend, but *cannot* write a rotated
    token back (React forbids writing cookies during render); `proxy.ts`'s
    ahead-of-expiry refresh is what keeps this path from ever meeting a
    401 in practice.
  - `apiMutate()` — for Server Actions and Route Handlers, where cookies
    *can* be written. It retries once on a 401 by refreshing the token
    first, then persists the rotated pair.
  - Both sit on top of `apiRequest`/`apiRequestRaw` (`lib/api/client.ts`),
    which attach `Authorization` and `X-Device-Id` and default every call
    to `no-store`.
- **A single `ApiError` type** (`lib/api/errors.ts`) normalizes every
  backend failure — NestJS's `message` can be a string or an array of
  validation errors, this collapses both — and exposes named checks used
  throughout the UI (`isDeviceConflict`, `needsOrganization`,
  `activeDevice`).
- **Mutations revalidate by path, not by tag.** Server Actions
  (`features/*/actions.ts`) call the relevant `revalidatePath()` after a
  write so the next render reflects it — there's no cross-cutting cache
  tag to invalidate because nothing is cached in the first place.
- **The exam runner's client-side loops don't call the backend
  directly.** Heartbeat, autosave, proctoring events, and submit
  (`features/exam/use-exam-runner.ts`) call this app's own Route Handlers
  under `app/api/attempts/[id]/...`, which proxy to the backend using
  `apiMutate()` and the session cookie. This is the one place a browser
  makes a request at all during an exam, and it still never sees a token.
- **Math renders server-side.** `components/math/rendered-content.tsx`
  uses MathLive's `mathlive/ssr` converter to turn LaTeX into markup at
  render time — reading a question ships no MathLive JavaScript at all.
  Only the *editing* surface (`components/math/math-field.tsx`) is a
  client component, and it's loaded via `next/dynamic({ ssr: false })`
  from a lazy wrapper so the rest of the app never imports the web
  component directly.

## Project structure

```
app/                       # Routes only — page/layout/loading/error/route.
  (auth)/                  # Login, join, invite-accept, org picker — public-ish
  (app)/app/               # Everything behind the app shell (sidebar/topbar)
  exam/[token]/            # Public link-landing page for a shared exam link
  exam/attempt/[attemptId]/# The full-screen timed exam runner
  api/attempts/[id]/...    # Route Handlers the exam runner's client loops call
components/
  ui/                      # Generic primitives: Button, Card, Table, Modal, Toast, charts…
  math/                    # MathLive editor + server-rendered math/content display
features/<name>/           # One folder per domain slice, each with its own:
  api.ts                   #   typed calls into lib/api
  actions.ts               #   "use server" Server Actions (mutations + revalidation)
  components/              #   feature-specific UI
  (store.ts, hooks)        #   only where a feature actually needs client state
lib/
  api/                     # client.ts (fetch), server.ts (session-aware), errors.ts, route-handler.ts
  session.ts               # Cookie read/write, device id, token TTL
  utils.ts                 # cn() and other framework-agnostic helpers
hooks/                     # Cross-feature hooks (e.g. use-toast, use-click-outside)
stores/                    # Cross-feature Zustand stores (currently: the toast queue)
types/api.ts               # Every type mirrors the backend contract exactly
styles/                    # MathLive's font-face and static-rendering CSS
docs/                      # The backend contract and build-progress log this was built from
proxy.ts                   # Auth/session middleware (Next 16 renamed this from middleware.ts)
```

The `features/<name>` slices in this app: `auth`, `admin` (superadmin),
`organization`, `quizzes`, `exam`, `results`, `student`, `dashboard`,
`shell` (nav/sidebar/topbar/guards).

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A running instance of the **Quorlyn backend** (`quorlyn-backend`) — this
  frontend has no data of its own and every page that isn't the marketing
  landing page needs it. By default it expects the backend at
  `http://localhost:5000`.

### Setup

```bash
git clone <this-repo-url>
cd quorlyn-frontend
npm install
cp .env.example .env.local   # then edit if your backend isn't on localhost:5000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the
marketing page; `/login` needs a real account in whatever backend
`API_URL` points at (ask whoever runs your backend instance for seed
credentials, or register the first organization through the backend
directly since there's no public sign-up in this UI — organizations are
created by a superadmin and everyone else joins one).

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `API_URL` | `.env.local`, server-only | Base URL of the Quorlyn backend. Never sent to the browser — only `NEXT_PUBLIC_*` variables would be, and this app has none. Defaults to `http://localhost:5000` if unset. |

### Scripts

```bash
npm run dev         # next dev (Turbopack), http://localhost:3000
npm run build        # production build — also the real correctness check
                      # (catches CSS-order and prerender problems dev hides)
npm run start        # serve a production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

Definition of done for any change here: `typecheck`, `lint`, and `build`
all clean, plus a manual pass in the running app for anything visual or
interactive.

