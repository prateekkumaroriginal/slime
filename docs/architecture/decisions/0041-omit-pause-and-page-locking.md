# ADR 0041: Omit pause and page locking

- Status: Accepted
- Date: 2026-08-12

## Context

Pausing during target resolution is straightforward, but pausing near action dispatch creates uncertain ownership and resumption boundaries. Preventing the user from interacting with the page would also be intrusive and unreliable.

## Decision

Workflow Runs support Start and Stop, not Pause and Resume.

Slime does not lock the page while a Workflow is active. The user may interact, navigate, or modify page state while the run continues.

## Consequences

- Runtime state has no paused transition or pause-specific recovery behavior.
- Users retain ordinary control of the page.
- Manual interaction can change Locator results or the outcome of pending steps.
