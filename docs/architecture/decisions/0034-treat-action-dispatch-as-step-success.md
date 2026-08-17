# ADR 0034: Treat action dispatch as step success

- Status: Accepted
- Date: 2026-08-12

## Context

Slime can observe whether it dispatched a DOM interaction, but it cannot generally infer whether the website achieved the author's business intent as a result.

## Decision

An interaction step succeeds when Slime successfully dispatches its configured action after target resolution and actionability checks.

It does not claim that the website accepted, processed, or completed the intended business operation. Such confirmation is not required. Authors may add a following observation such as `Wait for URL` or `Wait for Element` when later steps need synchronization.

## Consequences

- Action semantics remain observable and implementable.
- Optional business-result observation stays explicit when an author needs it for synchronization.
- A dispatched action may be followed by a failed observation without changing the action step's success.
