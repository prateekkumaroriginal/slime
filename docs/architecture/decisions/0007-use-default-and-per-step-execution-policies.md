# ADR 0007: Use default and per-step execution policies

- Status: Accepted
- Date: 2026-08-11

## Context

Waiting and observation commonly require repeated checks, while repeating side effects such as clicks or submissions can duplicate user-visible actions. Requiring complete timing configuration on every step would also make workflows unnecessarily repetitive.

## Decision

A Workflow defines a default execution policy, including its retry interval and timeout. Each Workflow Step may inherit that policy or override applicable values.

Observation steps retry according to the inherited policy by default. Interaction steps use that policy only to retry target resolution and actionability before dispatch. A dispatched side effect is never retried.

## Consequences

- Common timing behavior can be changed consistently at the Workflow level.
- Exceptional steps can wait for shorter or longer periods without affecting the rest of the Workflow.
- Safe polling behavior and side-effect dispatch have distinct execution phases.
- The editor must clearly show inherited values and overrides without offering post-dispatch retry controls.
- The execution engine must classify each step type as observational or side-effecting and checkpoint dispatch boundaries.
