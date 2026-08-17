# ADR 0046: Support validated key combinations

- Status: Accepted
- Date: 2026-08-12

## Context

Workflow automation commonly needs both single keys and modifier combinations. Free-form strings without parsing rules could produce invalid or platform-ambiguous keyboard events.

## Decision

`Press Key` supports validated key combinations such as `Control+Enter`, `Shift+Tab`, and `Escape`.

The editor parses and validates the combination before saving, and the Page Executor emits the corresponding modifier and key event properties.

## Consequences

- Common keyboard shortcuts can be expressed as one step.
- Invalid combinations are rejected during definition validation.
- Canonical key names and supported modifiers require a documented normalization scheme.
