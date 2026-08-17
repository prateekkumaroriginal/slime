# ADR 0066: Correlate Workflow commands and reports

- Status: Accepted
- Date: 2026-08-13

## Context

Navigation, retries, and asynchronous messaging can leave reports from an old document or attempt in flight after the coordinator has moved to a newer execution context. Applying a stale or duplicate report could advance a run incorrectly or acknowledge the wrong dispatch.

## Decision

Every dispatched Workflow command and returned report carries:

- run ID;
- step ID;
- attempt ID;
- document ID.

The coordinator applies a report only when all identities match the run's current persisted command state. It ignores stale and duplicate reports.

## Consequences

- Results from replaced documents cannot advance the active run.
- Duplicate message delivery is harmless.
- Attempt and document identities become part of session runtime state and privacy-minimized diagnostics metadata.
- Tests must exercise delayed, duplicated, and out-of-order reports.
