# ADR 0035: Persist Delay deadlines

- Status: Accepted
- Date: 2026-08-12

## Context

A `Delay` can outlive a page document or an active Manifest V3 service-worker instance. Restarting the full delay after either lifecycle event would change Workflow timing.

## Decision

When `Delay` begins, store its absolute deadline in Workflow Run state.

Navigation and service-worker suspension do not reset the delay. On reconstruction, Slime waits only for the remaining duration or advances immediately if the deadline has passed.

## Consequences

- Delay duration is stable across supported lifecycle interruptions.
- Runtime scheduling cannot depend only on in-memory timers.
- Chrome may wake an event-driven worker later than the exact deadline, so the guarantee is no earlier than the deadline rather than millisecond-exact execution.
