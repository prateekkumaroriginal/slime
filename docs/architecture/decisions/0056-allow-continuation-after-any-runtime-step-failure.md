# ADR 0056: Allow continuation after any runtime step failure

- Status: Accepted
- Date: 2026-08-13

## Context

`Continue on failure` is an explicit instruction to preserve linear progress when a step cannot complete. Restricting it to only some runtime error categories would make the option difficult to predict.

Definition errors are prevented when the Workflow is written, but runtime conditions can still include missing assets, changed target element types, exhausted waits, and unsupported current page state.

## Decision

`Continue on failure` applies consistently to every runtime step failure.

When enabled, Slime records the structured failure as a warning and advances to the next step. It does not override Stop, tab interruption, or loss of the run's execution environment, which are run-level terminal transitions rather than step failures.

## Consequences

- The option has one predictable meaning across step types.
- Authors can deliberately tolerate missing images, changed page controls, and exhausted waits.
- Continued failures remain visible through the completed run's warnings.
