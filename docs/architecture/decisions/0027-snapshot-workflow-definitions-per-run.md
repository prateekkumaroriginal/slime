# ADR 0027: Snapshot Workflow definitions per run

- Status: Accepted
- Date: 2026-08-12

## Context

A saved Workflow can be edited, disabled, archived, or deleted while one of its runs is active. Reloading the mutable definition during execution could reorder or replace the remaining steps and make recovery after navigation nondeterministic.

Workflow definitions are compact JSON. Stored images remain shared references and are not copied into a run snapshot.

## Decision

Starting a Workflow Run captures an immutable snapshot of the executable Workflow definition in session-scoped runtime state.

An active run continues from that snapshot if its saved Workflow is later edited, disabled, archived, or deleted. Those definition changes affect future discovery and starts only; they neither mutate nor stop an existing run.

## Consequences

- Every run has stable step order, values, Locators, and execution policies.
- Navigation and service-worker suspension cannot cause a run to load a newer definition accidentally.
- Active runs consume additional session storage proportional to their Workflow JSON, excluding shared image payloads.
- Snapshot storage may later be deduplicated by immutable revision without changing these semantics.
