# ADR 0017: Make Workflow Runs cancellable

- Status: Accepted
- Date: 2026-08-11

## Context

A finite Workflow can still spend significant time waiting or retrying. Users need an immediate way to stop automation associated with the current tab.

## Decision

The popup and FAB expose `Stop` for the active Workflow Run in their tab.

Cancellation aborts the current wait or retry as soon as practical, prevents all later steps from starting, and records the run's terminal status as `cancelled`.

## Consequences

- Wait and action execution require cancellation signals.
- The background coordinator owns the terminal transition so a replaced content script cannot continue a cancelled run.
- Popup and FAB states must distinguish running, stopping, and cancelled states.
