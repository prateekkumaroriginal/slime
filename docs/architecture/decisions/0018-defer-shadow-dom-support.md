# ADR 0018: Defer Shadow DOM support

- Status: Accepted
- Date: 2026-08-11

## Context

Current Rule lookup uses document-level selector APIs and does not traverse shadow roots. Open shadow roots could be traversed with a new Locator engine, while closed shadow roots are unavailable through standard DOM lookup APIs.

Shadow traversal would expand Locator resolution and ambiguity semantics beyond the core Workflow requirement.

## Decision

Workflow Locators search only the ordinary top-level document DOM for now.

They do not traverse open or closed Shadow DOM. A shadow host may be targeted when it is present in the ordinary document, but elements inside its shadow tree cannot be targeted.

## Consequences

- Workflow targeting preserves the current DOM boundary used by Rules.
- Sites that place controls inside web components may not be fully automatable.
- The initial Locator schema and resolver need no shadow-root traversal settings.
- Open Shadow DOM support may be proposed later as a deliberate capability.
