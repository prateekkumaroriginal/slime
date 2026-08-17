# ADR 0021: Define run interruption and unsupported pages

- Status: Accepted
- Date: 2026-08-12

## Context

A run can lose its execution target because the originating tab closes, or navigate to a browser page where Chrome does not permit Slime's content script to execute. Neither case is equivalent to a user pressing Stop or an ordinary step assertion failing.

## Decision

Closing the originating tab terminates its Workflow Run with status `interrupted`.

If the tab reaches a protected or otherwise unsupported page where Slime cannot execute, the current step fails immediately with an `unsupported page` diagnostic instead of waiting for its timeout.

## Consequences

- Run outcomes distinguish environmental interruption, user cancellation, and execution failure.
- The coordinator must recognize unsupported URL schemes and injection restrictions.
- Diagnostics can give actionable reasons instead of reporting a misleading missing element or timeout.
