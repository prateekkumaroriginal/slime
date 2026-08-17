# ADR 0067: Clean sensitive runtime state promptly

- Status: Accepted
- Date: 2026-08-13

## Context

Resolved generated and form values must persist while their current step may safely retry or recover, but they are unnecessary after that step terminates. A full Run Snapshot is similarly unnecessary after the run reaches a terminal state.

## Decision

Delete a persisted resolved step value as soon as its step succeeds or finishes through `Continue on failure`.

When a Workflow Run terminates, first record its privacy-minimized session result, then delete its full Run Snapshot, including steps, Locators, remaining resolved values, deadlines, and dispatch markers.

## Consequences

- Active execution retains only the sensitive values needed for deterministic recovery.
- Terminal feedback remains available without retaining the executable snapshot or page data.
- Cleanup must be part of coordinator-owned state transitions and recover safely if the service worker stops mid-transition.
