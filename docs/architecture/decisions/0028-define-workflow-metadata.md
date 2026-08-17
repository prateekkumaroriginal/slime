# ADR 0028: Define Workflow metadata

- Status: Accepted
- Date: 2026-08-12

## Context

Workflow definitions need enough metadata for discovery, authoring, lifecycle management, execution defaults, and completion behavior.

## Decision

A Workflow definition contains:

- ID;
- name;
- optional description;
- enabled state;
- optional Starting URL Condition;
- default execution policy;
- ordered Workflow Steps;
- `Close tab on success` setting;
- persistent Workflow counter;
- archive state;
- creation and update timestamps.

## Consequences

- Popup and FAB use name, enabled state, archive state, and Starting URL Condition for discovery.
- Steps inherit timing from the default execution policy.
- Archiving hides a Workflow without permanently deleting it.
- Runtime-only state remains outside the Workflow definition.
