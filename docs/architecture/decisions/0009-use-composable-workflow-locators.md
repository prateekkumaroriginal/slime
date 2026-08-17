# ADR 0009: Use composable Workflow Locators

- Status: Accepted
- Date: 2026-08-11

## Context

The Rule selector model supports ID, name, and `querySelector`. CSS can identify elements by structure and attributes, but it cannot natively match an element by rendered text. It also cannot express every accessible name derived from labels, nested content, or ARIA relationships.

Automation authored only against CSS structure is often coupled to implementation details that change without changing the page's user-facing behavior.

## Decision

Workflow Steps identify page targets with a composable **Locator** model.

A Locator may use CSS directly and may constrain candidates using semantic information such as:

- accessible role and name;
- associated label;
- rendered text;
- placeholder;
- test ID;
- ID or name attributes.

CSS remains an escape hatch and may be combined with semantic filters. Copying a Rule converts its existing ID, name, or CSS selector into an equivalent Workflow-owned Locator.

## Consequences

- Workflow authors can target controls using stable, user-facing identity.
- The Page Executor needs a locator-resolution layer beyond `document.querySelector`.
- Locator serialization must be a discriminated, validated data model rather than an opaque selector string.
- The editor can offer approachable target modes while retaining advanced CSS control.
- Accessible-name and rendered-text matching need explicit normalization and exact/substring semantics.

## Reference

- [Playwright locator guidance](https://playwright.dev/docs/locators)
- [Selectors Level 4](https://www.w3.org/TR/selectors-4/)
