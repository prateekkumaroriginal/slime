# ADR 0047: Dispatch framework-compatible Fill events

- Status: Accepted
- Date: 2026-08-12

## Context

Assigning a form control's value does not emit DOM events. Applications and UI frameworks may therefore retain stale state, validation, or disabled controls even though the visible DOM property changed.

## Decision

`Fill` uses the appropriate native value setter for the target type and dispatches the input-related events needed for page code to observe the replacement value.

Event behavior is target-specific. Text controls use bubbling `input` and `change` semantics; contenteditable targets use appropriate editable-content events. Slime does not rely on property assignment alone.

## Consequences

- React, Vue, and other controlled form implementations are more likely to observe Workflow input correctly.
- Event ordering and target-specific behavior require focused compatibility tests.
- Synthetic events remain distinguishable from trusted user input and may be rejected by protected sites.
