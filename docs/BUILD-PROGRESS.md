# Build progress — Quorlyn frontend

Living checklist so work resumes exactly where it stopped. Update the status
column when a phase lands; never delete rows.

**Source of truth:** [docs/api/backend-contract.md](api/backend-contract.md)
(copy of the backend's `docs/FRONTEND.md`). Conventions: `AGENTS.md`.

## Architecture decisions taken (do not re-litigate)

1. **Tokens live in httpOnly cookies, not localStorage.** The contract's
   storage table describes a generic SPA; `AGENTS.md` requires server-first
   data fetching and forbids tokens in client JS. Cookies satisfy both — the
   backend only cares that `Authorization` and `X-Device-Id` arrive.
   `proxy.ts` refreshes the access token before it expires and writes the
   rotated pair back as cookies.
2. **`X-Device-Id` is a readable (non-httpOnly) cookie**, generated in
   `proxy.ts` on first visit, so both server fetches and client fetches send
   the same stable id.
3. **Math renders on the server** via `mathlive/ssr`
   (`convertLatexToMarkup`) — no KaTeX dependency, no client JS for reading a
   question. MathLive bundles mhchem, so `\ce{...}` works. The contract
   suggests KaTeX; this supersedes that, same delimiters and same behaviour.
4. **Colors only in `app/globals.css`** as Tailwind v4 `@theme inline`
   tokens over `:root` / `.dark` custom properties. No hex, rgb, oklch or
   `bg-[...]` anywhere else in the codebase.
5. **`cn()` is dependency-free** (no clsx / tailwind-merge — `AGENTS.md`
   forbids unasked dependencies). Order matters: later classes must not
   conflict with earlier ones.
6. Client-side loops (exam heartbeat, autosave, proctor events) call
   **Route Handlers under `app/api/`** that proxy to the backend with the
   cookie token, so the browser never holds a token.

## Phases

| # | Phase | Status |
| --- | --- | --- |
| 0 | Tokens, layout, fonts, `cn`, env, docs | done |
| 1 | API client, types, session cookies, `proxy.ts` | done |
| 2 | UI primitives (Button, Input, Card, Badge, Table, …) | done |
| 3 | Auth: login, device change, org picker, invite accept, join code | done |
| 4 | App shell: sidebar, topbar, org switcher, role-aware nav, role home dashboards | done |
| 5 | Superadmin: organizations | done |
| 6 | Organization: members, invites, settings, overview | done |
| 7 | Teacher: quiz list, editor, questions + MathLive, links | done |
| 8 | Results: attempts, leaderboard, quiz analytics | done |
| 9 | Student: home, link landing, exam runner, results | done |
| 10 | Verify: typecheck, lint, build | done (re-run after every phase above; also spot-checked against a live backend — see note below) |

Note (2026-08-23, cont.): phase 7 required a few decisions the contract
left implicit — logged here so later work stays consistent and so the
user can correct any of them:
- Question create/update request bodies aren't specified (only the answer-key
  GET response shape is); `QuestionInput` in `features/quizzes/api.ts` mirrors
  that response's field names (`type`, `prompt`, `contentFormat`, `points`,
  `options: [{text, isCorrect}]`) rather than inventing new ones.
- `contentFormat` (`PLAIN` vs `LATEX_MIXED`) is derived automatically from
  whether the prompt/options contain `$`, rather than exposed as a manual
  toggle — same real field, just not teacher-facing as a separate control.
- Reordering questions uses up/down buttons, not drag-and-drop — the stack
  has no DnD library and AGENTS.md disallows adding one without asking.
- The `closesAt - opensAt < durationSeconds` warning the contract mentions
  is not implemented client-side; the 400 from `/publish` still surfaces via
  the existing error Alert, just not pre-emptively.

Note (2026-08-23, cont. — live backend verification, superseded by the note
below): a real backend was running locally, and Swagger vs. a couple of live
calls turned up the pagination-envelope inconsistency. Two rounds of
category-based guessing about which *other* endpoints followed which pattern
both turned out wrong and crashed real pages for the user
(`/app/admin/organizations`, then `/app/organization/invites` and the
student `/app`, then `/app/quizzes`) — see the source-verified note below
for what actually fixed it. Left here as a record of what didn't work:
inferring one endpoint's envelope from another's, in either direction, is
not reliable on this backend.

Note (2026-08-23, cont. — source-verified, authoritative): rather than keep
guessing from Swagger or single live calls, read every controller in
`quorlyn-backend/src/module/**/*.controller.ts` directly — the method's
hand-written `Promise<...>` return type is ground truth regardless of what
its `@ApiResponse` decorator claims (that decorator is what had drifted,
causing the crashes above). Full picture, confirmed this way:

**List endpoints returning `{ items, total }`** (use `Paginated<T>` +
`Paginator`'s `total`/`limit` props):
- `GET /organizations` (`features/admin/api.ts#listOrganizations`)
- `GET /members` (`features/organization/api.ts#listMembers`)
- `GET /quizzes` (`features/quizzes/api.ts#listQuizzes`)

**List endpoints returning a bare array** (use the array type directly +
`Paginator`'s `hasMore` prop):
- `GET /invites`, `GET /attempts/mine`, `GET /quizzes/{quizId}/attempts`,
  `GET /quizzes/{id}/questions`, `GET /quizzes/{id}/answer-key`,
  `GET /quizzes/{id}/links`

No other pattern predicts which is which (not "platform vs org-scoped", not
alphabetical, nothing) — it's simply whatever each endpoint's author wrote.
**If a new list endpoint is ever added to this frontend, read its
controller method in the backend source before typing it — do not guess by
analogy with a sibling endpoint.**

Also confirmed straight from the DTOs/decorators while doing this pass:
- `CreateQuizDto` (`quizzes/dto/create-quiz.dto.ts`) requires `title` and
  `durationSeconds` (30–21600 seconds); everything else is optional. Matches
  `createQuiz()` and `CreateQuizForm`.
- `AttemptResponseDto` (`attempts/dto/attempt-response.dto.ts`) genuinely has
  no `studentEmail`/`userId` field, confirmed at the class definition, not
  just Swagger. The teacher results roster
  (`/app/quizzes/[id]/results`) can't show which student made which attempt
  without opening that attempt's Detail page (`/attempts/{id}/detail`,
  confirmed to carry `studentEmail`). Real backend gap, not a frontend
  oversight — worth raising with the backend team if a roster-level student
  column is wanted.

Field-name-level Swagger cross-checks from the earlier pass (everything
besides the envelope question) remain trustworthy: those come from
`@ApiProperty()` on the DTO class itself via reflection, which can't drift
from the actual field the same way a hand-written controller return type
can drift from its `@ApiResponse` decorator.

A membership `INSERT` directly against the dev database (to get a
teacher-role session for live UI testing, as opposed to reading source) was
attempted and blocked by the harness's auto-mode classifier; stopped there
rather than working around it. Ask the user first if that route is wanted —
reading the backend source, as done above, turned out to be sufficient
without it.

Note (2026-08-23): phases 5–10 had been marked "done" here with no
corresponding code — `app/`, `features/`, `components/` had nothing past
phase 3, and `proxy.ts` redirected authenticated users to `/app`, a route
that didn't exist. Corrected to match what's actually on disk. Phase 4 was
built and verified (typecheck/lint/build clean) in this pass; while at it,
fixed two latent bugs from earlier phases: a `react-hooks/set-state-in-effect`
lint failure in `components/theme-toggle.tsx` (justified, now suppressed
with a comment — the effect defers to after mount on purpose, to keep
SSR/client markup in sync) and broken relative font `url()`s in
`styles/mathlive-static.css` that failed `next build` (the same fonts are
already served correctly, at absolute `/mathlive/fonts/...` paths, by
`styles/mathlive-fonts.css`).

Note (2026-08-23, cont. — theme-init script warning): a dev-mode React
warning ("Encountered a script tag while rendering React component...")
pointed at `app/layout.tsx`'s inline theme-flash-prevention script,
reproduced by the user via a `/quiz-links/[token]` visit. Root cause
appears to be `next dev`/Turbopack occasionally client-rendering the root
layout instead of only ever serving it from fresh server HTML (exact
trigger not pinned down — plausibly Fast Refresh/HMR-related, since a raw
browser never executes a client-inserted `<script>`, which is what the
warning is about). Two things were tried:
- Switched the raw `<script>` to `next/script` (`strategy="beforeInteractive"`,
  `id="theme-init"`) — the idiomatic Next.js API for this. Confirmed via
  reading `next/dist/client/script.js` that this **still renders a real
  `<script>` element into the tree** for `beforeInteractive` (it pushes onto
  a `self.__next_s` queue the same way), so it did **not** eliminate the
  warning in the same live test that reproduced it — kept anyway since it's
  still the correct API for this instead of a raw tag.
- Tried moving theme resolution server-side (read a `qr_theme` cookie in the
  root layout, apply the class directly, no client script at all — this
  would have eliminated the warning at the source). **Reverted**: `cookies()`
  in the root layout forces the *entire app* into dynamic rendering —
  confirmed via `next build`, `/` and `/_not-found` flipped from `○ Static`
  to `ƒ Dynamic`. Trading away static prerendering app-wide to silence a
  dev-console warning was judged not worth it without asking first (this is
  the same category of tradeoff as the Cache Components/PPR gate in
  AGENTS.md, even though it's not that literal flag).

Net: the warning may still appear in `next dev` for this one navigation
path; current understanding is it doesn't break the theme functionally
(worst case, a stored override doesn't apply on that one specific
client-render pass and the page falls back to the `prefers-color-scheme`
CSS, which is still correct-looking, just not the user's remembered
choice). If the user wants it fully silenced regardless of the static-page
cost, the cookie-based version is straightforward to redo — ask before
redoing it.

Note (2026-08-23, cont. — the real bug behind both of the above): the
script-tag warning and a separate "link says not found" report from the
user turned out to share one root cause, and it was **not** anything about
scripts or hydration — it was a **wrong frontend route**. A quiz link a
teacher shares is not something this frontend gets to name: the backend
hardcodes it, unconditionally, in `quiz-links.service.ts`:
```
url: rawToken ? `${this.frontendUrl}/exam/${rawToken}` : null,
```
So every shared link is literally `{FRONTEND_URL}/exam/{rawToken}` — a raw
64-hex-char link token, not an attempt id. This app had `/exam/[attemptId]`
as the *only* thing under `/exam/`, so every real shared link hit the
attempt-lookup page with a token instead of an attempt id, 404'd via
`GET /attempts/{token}` failing, and rendered "not found" — which is what
the user saw, and is almost certainly also what put the root layout through
whatever client-render path triggers the script warning (that report was
"for quiz link" too). Restructured to match the backend's fixed URL shape:
- `/exam/[token]` — the public link-landing/preview page (was
  `/quiz-links/[token]`; moved here because the backend's URL requires it,
  not by choice).
- `/exam/attempt/[attemptId]` — the actual full-screen timed runner (was
  `/exam/[attemptId]`), reachable only after starting/resuming, never
  directly from a shared link.
- `proxy.ts`'s public-route check now matches `/exam/{token}` (exactly one
  segment) as public while `/exam/attempt/{id}` stays behind auth — a plain
  prefix match would have wrongly made the runner public too.

**Caught only because a real user tested with a real link.** Nothing in
typecheck/lint/build/the Swagger-vs-source audit would have caught this —
the route *compiled* fine, it just wasn't the path the backend actually
promised to anyone who clicks a shared link. If the backend's `FRONTEND_URL`
share-link shape ever changes, check `quiz-links.service.ts` again rather
than assuming.

Also hit, and worth knowing for next time: after moving `app/exam/[attemptId]`
to `app/exam/attempt/[attemptId]` and adding `app/exam/[token]` while
`next dev` was running, Turbopack's dev server threw `"You cannot use
different slug names for the same dynamic path ('attemptId' !== 'token')"`
and kept failing to reload dynamic routes — even though `next build` (a
from-scratch build) compiled the identical route tree with no error at all.
This was a stale incremental-route-graph problem, not a real conflict —
**restarting the dev server** (not just saving files again) cleared it.
If a directory move under a dynamic-segment parent ever produces this error
again in dev, restart before assuming the route structure is wrong; check
`next build` output as the tiebreaker.

Note (2026-08-23, cont. — confirm modal + charts): the user asked to replace
every `window.confirm`/`window.alert` with a custom accessible modal, and to
turn the plain div/badge "visualizations" on the results page into real
charts.
- **Confirm modal**: `components/ui/confirm-dialog.tsx` (focus-trapped,
  `role="alertdialog"`, ESC + backdrop-click to close, danger tone) +
  `components/ui/confirm-provider.tsx` (`useConfirm()` hook, returns
  `Promise<boolean>`), mounted once in `app/layout.tsx`. All 6 former
  `window.confirm` call sites (join-code rotate, invite revoke, quiz-link
  revoke, question delete, quiz lifecycle actions, exam-runner submit)
  now `await confirm({ title, description, tone, confirmLabel })`. Zero
  `window.confirm`/`window.alert` remain in the codebase (grep-verified).
- **Charts**: loaded the `dataviz` skill and followed its procedure —
  new `components/ui/bar-chart.tsx` exports `VerticalBarChart` (hover/focus
  tooltip, used for score distribution) and `HorizontalBarChart` (direct
  value labels, used for submission causes); `question-difficulty-list.tsx`
  keeps its own inline bar (it needs `RenderedContent`/LaTeX per row, which
  the generic components' plain-text labels can't carry) but now uses real
  status tokens (`bg-success`/`bg-warning`/`bg-danger`) instead of the old
  `MeterBar`'s tone map, which had bugs: it pointed `success`/`warning` at
  categorical chart hues (`bg-chart-3`/`bg-chart-4`) instead of the actual
  status tokens — a violation of the skill's "status colors are reserved"
  rule. `MeterBar` had exactly one caller, so it was deleted rather than
  left unused. All three chart components now have a "View as table" toggle
  (the skill's required accessible fallback).
- **Palette fix found along the way**: running `validate_palette.js` against
  the existing `chart-1..5` tokens (never validated before) failed CVD
  separation on the amber/green pair (chart-2 vs chart-3, ΔE 2.1, protan —
  the 6.0 floor) and, separately, failed the dark-mode lightness band
  (0.68–0.76, outside the required [0.48, 0.67]). Both were pre-existing,
  undetected until this pass. Fixed by brute-force grid search over
  hue/chroma/lightness through the real validator (not by eyeballing hues) —
  new values in `app/globals.css`: light chart-2 `oklch(55% 0.22 35)`,
  chart-3 `oklch(48% 0.17 150)`; dark chart-1..5 lightness pulled back into
  band. `ALL CHECKS PASS` in both modes now (worst-case CVD ΔE 8.1 light /
  8.7 dark). Don't hand-edit these hue/chroma values without re-running
  `node scripts/validate_palette.js` from the skill's dir — see the code
  comment above the `:root` chart tokens in `globals.css`.
- **Not yet done**: `npm run typecheck && npm run lint && npm run build` all
  passed after these changes, but there was no browser tool available this
  session to actually look at the rendered chart hover states/tooltip
  positioning/table toggle per the skill's step 7 ("render it and look at
  it") — needs a human eyeball pass on `/app/quizzes/[id]/results` before
  calling the visual polish fully done.

Note (2026-08-23, cont. — superadmin login sent to org picker): logging in
as the seed superadmin landed on "Choose an organization / 0 organizations"
instead of the dashboard. `app/(app)/layout.tsx` already had the right rule
("a pure platform admin with no memberships goes straight in") but the
post-login `redirect()` in `features/auth/actions.ts` (`loginAction` and
`verifyDeviceChangeAction`) never checked `platformRole` — it only checked
`tokens.org`, which is always `null` for a superadmin with zero memberships,
so it always bounced to `/select-organization` before that layout rule ever
got a chance to run. Added a shared `postAuthTarget()` helper applying the
same rule at both redirect sites, and made `/select-organization` itself
redirect a superadmin straight to `/app` too (defense in depth for anyone
who lands there by a path other than login).

Note (2026-08-23, cont. — organization-level suspend switch): the user asked
for a way for the superadmin to disable an organization's access to Quorlyn
entirely — separate from the existing per-member suspend
(`Membership.status`), which already existed but only covers one person at a
time. This didn't exist anywhere in the backend contract or the actual
`quorlyn-backend` controllers (checked both), so rather than invent a fake
frontend-only toggle, asked the user first whether to build the backend
piece too. They said yes. Built end-to-end, backend first:
- **Backend** (`quorlyn-backend`, see its own **ADR-0021**): new
  `Organization.isActive` column (migration
  `20260823175318_organization_active_status`, `ALTER TABLE ... ADD COLUMN
  isActive BOOLEAN NOT NULL DEFAULT true` — backward compatible, no data
  loss), a superadmin-only `PATCH /organizations/{id}/status { isActive }`,
  and enforcement inside `OrgClaimService.resolveOrThrow` — the single choke
  point that already turns "this user, that org" into a token claim for
  login/select/refresh. A suspended org blocks **everyone** from entering
  its claim, the superadmin included (a deliberate choice — see the ADR's
  "alternatives considered" if that turns out to be the wrong call; a
  superadmin bypass is a one-line follow-up). `MembershipSummaryDto` and
  `OrganizationResponseDto` both now carry the flag. Verified live against
  the running dev backend: suspending an org → selecting it returns 403
  `"This organization's platform access has been suspended"` → restoring
  makes it selectable again, exactly as designed.
- **Frontend**: `Organization.isActive` / `MembershipSummary.organizationIsActive`
  added to `types/api.ts`; `features/admin/components/organization-status-toggle.tsx`
  (uses the confirm modal — "Suspend"/"Restore" with different copy and
  tone) wired into the admin organizations table's new "Access" column;
  `features/auth/components/organization-picker.tsx` now shows a suspended
  org as a disabled "Organization suspended" row (distinct from the existing
  member-level "Suspended" badge, so an owner doesn't think *they*
  personally got suspended). **Also fixed a latent bug found while wiring
  this in**: `app/(auth)/select-organization/page.tsx` decided whether to
  auto-redirect to `/app` by counting `memberships.filter(status ===
  ACTIVE).length === 1` — a heuristic that would have infinite-redirect-
  looped a user whose only membership is in a newly-suspended org (their
  membership row is still ACTIVE; only the organization is suspended, so
  auto-select correctly skips it and `me.org` stays null, but the old
  heuristic didn't know that and would send them to `/app`, which would
  bounce them right back). Simplified to check `me.org` directly — it's
  already the resolved claim, no need to re-derive it.
- Backend docs updated at the source (`quorlyn-backend/docs/FRONTEND.md`,
  `docs/adr/0021-organization-active-status.md`,
  `docs/adr/README.md`), then `docs/api/backend-contract.md` here
  re-synced from it (confirmed byte-identical before this change, so a
  straight copy was safe rather than hand-reapplying the diff).

Note (2026-08-23, cont. — superadmin login sent to org picker): logging in
as the seed superadmin landed on "Choose an organization / 0 organizations"
instead of the dashboard. `app/(app)/layout.tsx` already had the right rule
("a pure platform admin with no memberships goes straight in") but the
post-login `redirect()` in `features/auth/actions.ts` (`loginAction` and
`verifyDeviceChangeAction`) never checked `platformRole` — it only checked
`tokens.org`, which is always `null` for a superadmin with zero memberships,
so it always bounced to `/select-organization` before that layout rule ever
got a chance to run. Added a shared `postAuthTarget()` helper applying the
same rule at both redirect sites, and made `/select-organization` itself
redirect a superadmin straight to `/app` too (defense in depth for anyone
who lands there by a path other than login).

Note (2026-08-23, cont. — superadmin home page): was a single Stat plus a
bare name/View list — not much of a dashboard. Rebuilt as
`features/admin/components/superadmin-home.tsx`: a real stat card, an
onboarding-shortcut card, and a proper table (join code + copy, created
date) for recently created organizations, matching the visual language
`TeacherHome`/`StudentHome` already use. Didn't fabricate additional stats
(teacher/student/quiz counts) since neither `GET /organizations` nor `GET
/organizations/{id}` returns them and there's no superadmin-scoped
dashboard endpoint for an arbitrary org — noted as a real gap, not filled
with invented numbers.

## Open questions for the user

1. **Results page 500 error** (`ApiError: Internal server error` at
   `QuizResultsPage`, `lib/api/errors.ts:50`) is still unresolved. The
   backend only ever returns NestJS's generic "Internal server error" with
   no detail, and extensive reading of `dashboard.service.ts`,
   `attempt-finalizer.service.ts`, `leaderboard.service.ts`, and the raw-SQL
   repository methods behind it turned up nothing obviously wrong. Need the
   **backend terminal's actual stack trace** for the request that 500'd to
   go further.
2. **Theme-init script-tag dev warning**: currently using `next/script`
   (`strategy="beforeInteractive"`), which is more correct than a raw
   `<script>` tag but does not fully eliminate the dev-only React warning.
   A full fix (resolve the theme server-side from a cookie before first
   paint) was prototyped and reverted because `next build` showed it costs
   static prerendering on `/` and `/_not-found` app-wide — that tradeoff
   felt like the user's call, not mine to make silently. Say the word if you
   want that traded for a fully clean console.
