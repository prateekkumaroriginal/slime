# ADR 0023: Close the originating tab after success

- Status: Accepted
- Date: 2026-08-12

## Context

Some finite automations are complete when all steps succeed and should clean up their originating tab. Closing a tab as an arbitrary mid-Workflow step would destroy the run's only execution target.

## Decision

A Workflow may enable `Close tab on success` as a Workflow-level completion option.

It is not a general Workflow Step. Slime closes the originating tab only after the final step succeeds and the run's successful terminal state has been committed.

## Consequences

- Closing cannot strand a partially executed run.
- Failures, interruption, or cancellation leave the tab open.
- The coordinator, rather than the Page Executor, owns final tab closure.
