# docs/

Specs the frontend is built from. Drop files here and reference them by name in a request
("build the submission flow from `docs/api/submissions.md`") — the agent reads them before writing code.

## Layout

```
docs/
  api/         # endpoint contracts: path, method, request/response shape, error codes, auth
  features/    # feature briefs: user flows, states, edge cases, acceptance criteria
  design/      # design references, tokens, spacing/typography rules, screenshots
  vendor/      # third-party library notes (e.g. MathLive usage) not covered by node_modules docs
```

Any file layout works — these are just the defaults. Pasting a doc straight into chat is equally
valid; put it here when it should outlive the conversation.

## What makes a doc usable

- **API docs**: exact paths, methods, auth header, request body, response body with field names and
  types, status codes, error payload shape. Real example payloads beat prose descriptions.
- **Feature briefs**: what the user is trying to do, the states involved (empty / loading / error /
  success / permission-denied), and what "done" means.
- **Design**: tokens (colors, spacing, type scale) rather than one-off hex values, plus responsive
  behavior at each breakpoint.

## The rule that matters

The doc is the contract. Field names, enum values, and error codes are implemented exactly as
written. If something needed is missing, the agent asks instead of inventing it — so gaps in a doc
surface as one specific question, not as plausible-looking wrong code.
