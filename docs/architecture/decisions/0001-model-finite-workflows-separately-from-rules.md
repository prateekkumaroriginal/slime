# ADR 0001: Model finite workflows separately from rules

- Status: Accepted
- Date: 2026-08-11

## Context

A rule is a one-shot form-filling configuration selected by URL. Its execution lives in the current page's content script and therefore ends when that document navigates away.

The product needs a different kind of feature whose execution remains associated with a browser tab while that tab navigates between pages. It will support automation behavior such as retrying on an interval and waiting for an element to appear.

## Decision

Call the new feature a **Workflow** and model it separately from a rule.

A single execution is a **Workflow Run**. A run is finite: it must eventually complete, fail, time out, or be cancelled. Navigation within the associated tab does not, by itself, terminate the run.

## Consequences

- Rule behavior can remain optimized for immediate, single-page form filling.
- Workflow configuration and runtime state require separate types and storage concerns.
- Cross-navigation execution must be coordinated outside the lifetime of an individual page document.
- Retry and looping behavior must be bounded by a terminal condition, attempt limit, timeout, or cancellation.
