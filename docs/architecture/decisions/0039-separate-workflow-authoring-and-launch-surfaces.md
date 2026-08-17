# ADR 0039: Separate Workflow authoring and launch surfaces

- Status: Accepted
- Date: 2026-08-12

## Context

Rules perform immediate one-page fills, while Workflows are persistent multi-step runs. Presenting both as one undifferentiated object type would obscure their different behavior and lifecycle.

## Decision

The options page provides a dedicated Workflow section with its own list and editor, separate from Rules.

The popup and FAB present matching Rules and Workflows in distinct labeled sections.

## Consequences

- Users can distinguish one-shot filling from persistent automation before starting it.
- Rule and Workflow editors can evolve independently.
- Shared visual primitives and asset pickers may still be reused.
