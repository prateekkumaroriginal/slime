# ADR 0054: Protect counter reset during active runs

- Status: Accepted
- Date: 2026-08-13

## Context

Active runs may hold atomic increment reservations from a Workflow counter. Resetting that counter concurrently could allow a later run to reuse a value already reserved or dispatched.

## Decision

Disable Workflow counter reset while any run of that Workflow is active or stopping in any tab.

Reset becomes available only after all such runs terminate.

## Consequences

- Increment uniqueness is preserved across reset operations.
- The options page needs current run-usage information for the reset control.
- Users may need to stop runs before resetting a counter.
