# ADR 0010: Require manual Workflow starts

- Status: Accepted
- Date: 2026-08-11

## Context

Automatically starting a workflow from navigation could cause clicks, data entry, or submissions merely because a page was visited. The existing popup and FAB already provide user-controlled entry points inside Slime.

A Workflow may still need to ensure that it starts from an appropriate page.

## Decision

A Workflow Run starts only from an explicit user action in the popup or FAB.

This is a product invariant rather than an initial-version limitation. URL changes, page loads, browser startup, schedules, and background events never start a Workflow Run automatically.

A Workflow may define an optional Starting URL Condition. Slime evaluates it when the user requests a start; the condition is a guard, not a trigger.

## Consequences

- Visiting a matching URL cannot unexpectedly execute automation.
- The popup and FAB must expose applicable Workflows and clear start controls.
- Background navigation listeners may resume an existing run but must never create one.
- Scheduled, URL-triggered, event-triggered, and editor-triggered starts are outside the product model.
- Starting URL mismatch behavior must be defined separately.
