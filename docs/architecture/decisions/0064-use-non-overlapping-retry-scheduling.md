# ADR 0064: Use non-overlapping retry scheduling

- Status: Accepted
- Date: 2026-08-13

## Context

A fixed `setInterval` can start another Locator or actionability check before the preceding check finishes. Overlapping checks could race to dispatch or report different page states.

## Decision

Use a non-overlapping `setTimeout` retry loop. Schedule the next check only after the previous check completes and the run remains eligible to retry.

The configured retry interval is the delay between completed checks, subject to browser throttling. The absolute timeout deadline remains authoritative.

## Consequences

- One step attempt cannot overlap its own previous check.
- Slow checks reduce polling frequency rather than building a queue.
- Stop and document replacement can prevent scheduling the next check cleanly.
