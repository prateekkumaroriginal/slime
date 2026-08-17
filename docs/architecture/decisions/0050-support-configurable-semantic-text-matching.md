# ADR 0050: Support configurable semantic text matching

- Status: Accepted
- Date: 2026-08-12

## Context

Rendered text, labels, and accessible names may need strict identity, partial matching, or patterned matching. Whitespace differences introduced by markup should not make otherwise equivalent user-facing text fail unexpectedly.

## Decision

Textual and accessible-name Locator filters support:

- `Exact`;
- `Substring`;
- `Regex`.

Exact and substring modes normalize whitespace. They expose case control, with `Ignore case` enabled by default. Regex uses slash-delimited syntax with supported flags such as `/pattern/i`, and is validated when the Workflow is written.

## Consequences

- Authors can choose readable strict matching or more flexible targeting.
- Text-match mode remains separate from Locator resolution policy (`Unique` or `First`).
- Regex parsing for Locator text is richer than the current Rule URL regex parser and must be implemented deliberately.
