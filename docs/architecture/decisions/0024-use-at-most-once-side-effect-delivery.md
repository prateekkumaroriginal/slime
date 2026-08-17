# ADR 0024: Use at-most-once side-effect delivery across navigation

- Status: Accepted
- Date: 2026-08-12

## Context

A side-effect step such as `Click` or `Press Key` may initiate immediate navigation. The old Page Executor can be destroyed before it acknowledges whether the action occurred, leaving the coordinator unable to distinguish an executed action from an interruption immediately before execution.

Exactly-once delivery cannot be guaranteed without cooperation from the target website. Replaying an uncertain action could duplicate a form submission, purchase, deletion, or other effect.

## Decision

Use at-most-once delivery for navigation-producing side-effect steps.

Before dispatching the DOM action, the run durably checkpoints that the side effect is being dispatched. If document replacement prevents acknowledgement, the action is not replayed in the new document and the run resumes after that step.

This navigation-recovery guarantee is distinct from an author's explicit retry opt-in. Once an attempt has crossed its durable dispatch checkpoint, that attempt is never repeated merely because its acknowledgement was lost.

## Consequences

- Navigation recovery cannot duplicate an uncertain side effect.
- A rare interruption between the durable checkpoint and actual DOM dispatch can cause the action to be skipped.
- Runtime state needs a durable per-step dispatch marker and an atomic transition owned by the coordinator.
- Run logs should identify steps recovered from an unacknowledged dispatch.
- Exactly-once execution is not claimed.
