# ADR 0031: Allow concurrent runs of one Workflow across tabs

- Status: Accepted
- Date: 2026-08-12

## Context

Run exclusivity prevents multiple Workflows from controlling the same tab. Applying the same restriction to a Workflow definition would unnecessarily prevent independent tabs from using the same reusable automation.

## Decision

The same Workflow definition may have concurrent Workflow Runs in different tabs.

The one-active-run restriction remains scoped to each tab, not to each Workflow definition.

## Consequences

- Independent tabs can execute the same automation simultaneously.
- Runtime state must be keyed by run and tab rather than Workflow ID alone.
- Shared persistent state such as the Workflow counter requires concurrency-safe allocation.
