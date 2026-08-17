# ADR 0011: Show and start only matching Workflows

- Status: Accepted
- Date: 2026-08-11

## Context

Workflow starts are manual and may be guarded by a Starting URL Condition. Showing unavailable Workflows would let the user select an action that cannot validly start in the current tab.

Even after filtering the visible list, the tab can navigate between rendering the popup or FAB and handling the user's start request.

## Decision

The popup and FAB show a Workflow as startable only when the current tab URL satisfies its Starting URL Condition. A Workflow without a Starting URL Condition is startable from any supported page.

The background start handler re-evaluates the condition against the tab's current URL before creating the run. A mismatch rejects the request without creating runtime state.

## Consequences

- Users normally see only relevant Workflow start actions.
- URL mismatch is primarily a defensive error rather than a normal interaction path.
- A navigation race cannot launch a Workflow from an invalid starting page.
- Workflow discovery and start validation must use exactly the same URL-matching semantics.
