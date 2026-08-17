# ADR 0040: Show active-run progress and Stop controls

- Status: Accepted
- Date: 2026-08-12

## Context

A Workflow can remain active across retries and navigation. Users need to know what their tab is doing and retain immediate control over it.

## Decision

While a tab owns an active Workflow Run, its popup and FAB show:

- Workflow name;
- current step number;
- custom or generated step label;
- current state, such as waiting, running, or stopping;
- Stop control.

Other Workflow starts are hidden or disabled until stopping reaches the cancelled terminal state.

Each Workflow Step supports an optional custom label. When absent, Slime generates a descriptive label from its type and target.

## Consequences

- Run progress remains understandable even when a step is waiting.
- Step labels become part of the immutable Run Snapshot.
- Popup and FAB require live run-state updates from the coordinator.
