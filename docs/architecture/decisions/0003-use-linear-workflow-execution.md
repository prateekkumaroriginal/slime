# ADR 0003: Use linear workflow execution

- Status: Accepted
- Date: 2026-08-11

## Context

Workflow execution could be represented either as an ordered sequence or as a graph with branches, jumps, and loops. Graph execution would make authoring, validation, progress reporting, and recovery after navigation substantially more complex.

## Decision

A Workflow is an ordered, linear sequence of Workflow Steps.

A Workflow Run owns a current step position. When the current step succeeds, the run advances to the next step. Repeating a step through its bounded retry policy does not introduce general-purpose looping or branching.

## Consequences

- Step order and run progress are straightforward to display and persist.
- A run has one unambiguous next step after successful execution.
- Conditional branches, jumps, and arbitrary loops are outside the initial model.
- Future control-flow support would require a separate decision and data-model version.
