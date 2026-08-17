# ADR 0020: Preserve observation waits across navigation

- Status: Accepted
- Date: 2026-08-12

## Context

A Workflow Run persists while its tab navigates. An observation such as `Wait for Element` may be active when the current document is replaced.

Restarting the wait's timeout on every navigation could allow a finite step to remain active indefinitely.

## Decision

When navigation replaces the document during `Wait for Element`, the same step continues in the new top-level document.

The step retains its original absolute timeout deadline. Reconnection and document loading consume that timeout; navigation does not reset it.

## Consequences

- A wait can intentionally span page transitions.
- Repeated navigation cannot extend the wait indefinitely.
- Runtime state must persist the absolute deadline rather than only elapsed in-memory timer state.
- If the deadline expires before a new Page Executor reconnects, the step follows its configured failure behavior.
