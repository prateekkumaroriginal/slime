# ADR 0042: Keep run results session-scoped

- Status: Accepted
- Date: 2026-08-12

## Context

Permanent execution history requires retention controls, storage limits, privacy decisions, and a dedicated history interface. These concerns are not necessary to operate finite Workflows.

## Decision

Do not persist permanent Workflow Run history initially.

Slime exposes the active run and the most recent terminal result for the current browser session only. That result is not exported and does not resume in a later browser session.

## Consequences

- Users receive immediate completion or failure feedback without accumulating long-term page and form activity.
- Historical auditing and analytics are outside the current scope.
- Session-state cleanup must discard older terminal results.
