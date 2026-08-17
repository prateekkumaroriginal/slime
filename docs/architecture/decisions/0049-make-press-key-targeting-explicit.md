# ADR 0049: Make Press Key targeting explicit

- Status: Accepted
- Date: 2026-08-12

## Context

Current Rule keypress actions dispatch to whichever element happens to be active, falling back to the document body. That implicit behavior can send keys to an unintended control.

Some page flows intentionally establish focus themselves and need that focus preserved.

## Decision

`Press Key` has an explicit target mode:

- `Locator` is the default. Slime resolves and focuses the configured target before dispatching the validated key combination.
- `Current focus` explicitly dispatches to the document's current active element, with a documented body fallback when no element owns focus.

## Consequences

- The common path is deterministic and visible in the Workflow definition.
- Website-managed focus remains usable through an explicit advanced mode.
- Locator-targeted keypresses use focusability checks before dispatch.
