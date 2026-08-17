# ADR 0038: Retry interactions only before dispatch

- Status: Accepted
- Date: 2026-08-12

## Context

An interaction can safely wait while its target is missing, ambiguous, detached, or not actionable because no side effect has occurred. Once Slime dispatches the interaction, the target element does not provide a standardized receipt for the website's resulting business operation.

The product does not require business-result confirmation as part of an interaction step.

## Decision

Interaction steps automatically retry only pre-dispatch Locator resolution and actionability checks within their execution policy.

Once Slime dispatches the configured action to the resolved actionable target, the step succeeds. Slime does not retry after dispatch and does not require or infer confirmation of a website-level result.

There is no author-facing post-dispatch side-effect retry option. Authors may add a later observation step when they need synchronization for subsequent automation, but that observation is not required to confirm the interaction step itself.

Permanent configuration errors, incompatible target types, and unsupported pages fail immediately rather than consuming the retry timeout.

## Consequences

- Missing or temporarily inaccessible elements are handled automatically.
- Dispatched clicks, keypresses, and other side effects are never duplicated by retry behavior.
- Interaction success has a precise, observable meaning: Slime dispatched the action.
- Workflow authors are not required to model business-result confirmation.
