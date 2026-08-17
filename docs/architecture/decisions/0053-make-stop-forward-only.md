# ADR 0053: Make Stop forward-only

- Status: Accepted
- Date: 2026-08-13

## Context

A dispatched browser action may already have changed page or server state before a Stop request reaches the coordinator. Generic reversal is impossible without action-specific compensating behavior from the website.

## Decision

Stop prevents any future action dispatch and later steps as soon as practical, but it does not undo a side effect that already crossed its dispatch boundary.

## Consequences

- Cancellation has a precise forward-only guarantee.
- UI copy must not imply rollback.
- An in-flight website operation may finish after the run becomes cancelled.
