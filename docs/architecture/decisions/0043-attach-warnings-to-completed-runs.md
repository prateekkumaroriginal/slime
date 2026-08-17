# ADR 0043: Attach warnings to completed runs

- Status: Accepted
- Date: 2026-08-12

## Context

A linear run may reach its end after one or more steps fail with `Continue on failure`. Treating the run as failed would contradict the configured continuation behavior, while presenting a clean completion would hide useful information.

Adding a separate terminal state would duplicate most completion semantics.

## Decision

A run that reaches the end has terminal status `completed` and may carry zero or more warnings.

The popup and FAB display `Completed with warnings` when the most recent completed run has warnings, along with a concise count or summary. This is a presentation derived from the warnings array, not a separate runtime status.

`Close tab on success` applies only to a completed run with no warnings.

## Consequences

- Runtime status remains compact while optional failures remain visible.
- Clean completion and warning-bearing completion can have different presentation and tab-closing behavior.
- Each continued failure must preserve a structured warning with step identity and diagnostic information.
