# ADR 0061: Define Focus, URL-wait, and Delay timing

- Status: Accepted
- Date: 2026-08-13

## Context

Focus is already idempotent enough at the platform level, URL observation needs a finite execution policy, and Delay has an intrinsic completion deadline rather than a condition to poll.

## Decision

`Focus` calls the target's `focus()` method after resolution and focusability checks, even when that target is already the active element.

`Wait for URL` inherits the Workflow's timeout and retry interval and may override them per step.

`Delay` exposes only a positive finite duration. It has no retry interval, separate timeout, or `Continue on failure` setting. Stop can still cancel a run during Delay.

## Consequences

- Focus behavior remains simple and consistent with current Rules.
- URL waits are finite and use the same policy model as other observations.
- Delay configuration does not expose redundant timing fields.
