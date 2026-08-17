# ADR 0033: Persist resolved step values

- Status: Accepted
- Date: 2026-08-12

## Context

Dynamic values can change whenever they are generated. Regenerating during retry, navigation recovery, or service-worker reconstruction could make one logical step use multiple values and consume additional increments.

## Decision

A step resolves its random, generated, template, and increment-dependent value once when that step begins.

The resolved value is persisted in Workflow Run state and reused for all safe attempts and navigation recovery associated with that step.

## Consequences

- A logical step has deterministic input across retries and recovery.
- Increment reservation occurs only once per step execution.
- Session runtime state contains resolved values, which may include user-authored form data.
- Step completion must discard resolved values according to the run-retention policy.
