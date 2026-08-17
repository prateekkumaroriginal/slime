# ADR 0065: Minimize Workflow diagnostics data

- Status: Accepted
- Date: 2026-08-13

## Context

Run diagnostics help explain progress and failure, but form values, generated content, images, and page markup may contain sensitive data and are not required for the accepted session-scoped feedback.

## Decision

Workflow diagnostics may store step identity and label, timestamps, state or status, attempt metadata, and structured error or warning categories.

Diagnostics never store filled values, generated text, image payloads, or page HTML.

## Consequences

- Popup and FAB can explain active and recent terminal outcomes without retaining page content.
- Resolved values may exist transiently in active run state for deterministic retry but are not copied into diagnostics.
- Error messages must avoid embedding selectors' matched page content or submitted values.
