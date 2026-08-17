# ADR 0063: Make the background coordinator authoritative

- Status: Accepted
- Date: 2026-08-13

## Context

Page Executors are replaced by navigation, and more than one document or delayed message may exist briefly for one tab. Allowing page-side code to advance persisted run state could produce duplicate or out-of-order transitions.

## Decision

The background coordinator is the sole authority that changes the current step, dispatch state, warnings, and terminal status of a Workflow Run.

Page Executors execute commands against the current top-level document and report observations or action results. They do not independently advance the run.

Every newly created top-level Page Executor announces itself to the coordinator. When its tab owns an active run, the coordinator returns the current command or waiting state.

## Consequences

- Run transitions remain serialized outside replaceable page documents.
- A fresh document can resume the exact persisted step after navigation.
- Executor reports require correlation and stale-message protection, to be finalized separately.
- The coordinator must commit state before issuing navigation-sensitive side effects.
