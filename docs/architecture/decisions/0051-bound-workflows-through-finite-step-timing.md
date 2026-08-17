# ADR 0051: Bound Workflows through finite step timing

- Status: Accepted
- Date: 2026-08-13

## Context

Workflows are finite linear sequences. A separate total-run timeout would add another deadline that could conflict with intentionally long delays and step-level execution policies.

Allowing an individual observation or interaction to wait forever would undermine the finite-run model.

## Decision

Do not add a separate maximum total Workflow duration initially.

Every observation and interaction step must have a positive finite timeout, inherited from the Workflow or overridden by the step. Zero and never-ending timeouts are invalid. Delays are explicit finite durations.

## Consequences

- A finite step list with finite step timing remains bounded without competing run-level timeout semantics.
- Authors can estimate a worst-case duration from steps and delays.
- Very long Workflows remain expressible through deliberate finite values.
