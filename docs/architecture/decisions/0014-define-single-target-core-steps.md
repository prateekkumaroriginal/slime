# ADR 0014: Define single-target core Workflow Steps

- Status: Accepted
- Date: 2026-08-11

## Context

The Workflow editor needs an initial set of useful automation operations. A step that mutates several targets at once would make retries, progress, and failure diagnostics ambiguous.

Copying a Rule still needs to produce independent Workflow-owned behavior.

## Decision

The initial Workflow Step catalog is:

- `Wait for URL`
- `Wait for Element`
- `Delay`
- `Click`
- `Fill`
- `Select`
- `Upload File`
- `Focus`
- `Press Key`

Each target-based action step operates on one Locator target. Copying a Rule expands its compatible fields and post-actions into multiple ordered Workflow Steps rather than creating a multi-field step or a Rule reference.

There is no `Navigate` step. A Workflow may wait for and persist across navigation initiated by the page or user, but it does not directly assign a destination URL.

There are no dedicated `Check` or `Uncheck` steps initially. Authors operate native checkbox and radio controls with `Click`.

## Consequences

- Each action has independent retry, timeout, progress, and diagnostic state.
- Reordering copied field actions is straightforward.
- Large form-filling Workflows contain more steps, which the editor must make manageable.
- A Rule can be copied only when every relevant feature has a lossless conversion to these Workflow Steps.
- Cross-page progression relies on page actions or user navigation followed by explicit synchronization steps such as `Wait for URL`.
