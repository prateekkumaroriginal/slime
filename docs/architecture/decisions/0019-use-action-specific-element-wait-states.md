# ADR 0019: Use action-specific element wait states

- Status: Accepted
- Date: 2026-08-11

## Context

Element presence and visibility do not prove that a particular interaction is ready. A generic `actionable` condition would also be ambiguous because clicking, editing, and focusing require different observable properties. Negative disappearance states are commonly redundant because the next interaction already waits for its own operability.

## Decision

`Wait for Element` supports these states:

- `attached`;
- `visible` (default);
- `enabled`;
- `clickable`;
- `editable`;
- `focusable`.

`Clickable`, `editable`, and `focusable` reuse the same action-specific readiness checks as their corresponding interaction steps. There is no generic `actionable` state.

`Hidden` and `detached` are not included initially. Workflows should prefer positive readiness signals, while subsequent interactions already auto-wait through temporary overlays and inaccessible states.

## Consequences

- Authors can synchronize without performing an immediate interaction.
- The meaning of readiness remains explicit in the Workflow definition and run log.
- Wait and action implementations must share readiness predicates to prevent semantic drift.
- `Visible` remains an approachable default for general element waiting.
- Workflows cannot initially use element disappearance itself as a wait condition.
