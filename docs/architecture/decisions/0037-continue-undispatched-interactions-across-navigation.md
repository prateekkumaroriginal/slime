# ADR 0037: Continue undispatched interactions across navigation

- Status: Accepted
- Date: 2026-08-12

## Context

An interaction step may still be resolving its Locator or waiting for actionability when the document is replaced. No side effect has been dispatched at that point.

## Decision

An undispatched interaction continues resolving the same step in replacement top-level documents in its originating tab.

It retains its original absolute timeout deadline. Authors place `Wait for URL` immediately before an interaction when its target must belong to a particular page.

Once the action crosses its dispatch checkpoint, the separate at-most-once recovery policy applies.

## Consequences

- Redirect and loading pages can transition to the intended interactive page without failing the pending step.
- A broad Locator could match an unintended element on a later page, making URL synchronization important.
- Navigation cannot extend the interaction timeout indefinitely.
- Runtime recovery must distinguish undispatched, dispatching, and completed step states.
