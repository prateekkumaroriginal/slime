# ADR 0006: Bind a Workflow Run to one tab

- Status: Accepted
- Date: 2026-08-11

## Context

A workflow could either retain one tab as its execution target or switch among tabs created or selected during execution. Multi-tab ownership would complicate navigation recovery, concurrency, cancellation, and identifying which page should execute the current step.

## Decision

A Workflow Run is bound to its originating tab for its entire lifetime.

Same-tab navigations and reloads preserve the association. The run does not follow links into a newly opened tab, switch to an existing tab, or adopt another tab.

## Consequences

- Every DOM-related step has one unambiguous target tab.
- Run state can be indexed and protected by the originating tab's identity.
- Closing the originating tab terminates its active run.
- Opening, adopting, coordinating, or switching tabs is outside the Workflow model.
- If a page action opens another tab, that tab is not part of the run.
