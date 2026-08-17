# ADR 0005: Allow one active Workflow Run per tab

- Status: Accepted
- Date: 2026-08-11

## Context

Concurrent runs in one tab could independently fill fields, change focus, click controls, and navigate. Their effects and navigation events could interleave, making both runs nondeterministic.

Runs in separate tabs do not share a page document and can execute independently.

## Decision

At most one Workflow Run may be active in a tab.

Different tabs may each own an active run and execute concurrently. Starting a workflow in a tab that already owns an active run must not implicitly create a second run.

## Consequences

- Tab identity can enforce run exclusivity.
- DOM actions and navigation events in a tab have one unambiguous run owner.
- The start experience must explain the conflict and offer a safe way to stop or replace the existing run.
- The background coordinator must process different tabs independently.
