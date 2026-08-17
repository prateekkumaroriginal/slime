# ADR 0016: Fail runs by default on step failure

- Status: Accepted
- Date: 2026-08-11

## Context

When a step exhausts its execution policy, a linear Workflow needs an unambiguous next transition without introducing branching.

## Decision

A failed step fails the Workflow Run by default.

A step may explicitly enable `Continue on failure`. In that case, the failure is recorded and the run advances to the next step. This option does not create a branch, jump, or alternate step sequence.

## Consequences

- Silent partial automation is not the default.
- Optional actions can be represented without adding control-flow graphs.
- A completed run may contain continued step failures, so completion summaries must expose warnings.
