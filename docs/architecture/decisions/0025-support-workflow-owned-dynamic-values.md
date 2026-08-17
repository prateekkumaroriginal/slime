# ADR 0025: Support Workflow-owned dynamic values

- Status: Accepted
- Date: 2026-08-12

## Context

Rules already support static values, templates, generated titles and descriptions, and stored images. Workflows need equivalent data-entry capabilities without executing or retaining a live reference to a Rule.

## Decision

Workflow data-entry steps support the existing compatible Rule value capabilities:

- static values;
- template values;
- generated titles;
- generated descriptions;
- stored-image upload.

The copied configuration belongs to the Workflow. It does not reference the source Rule.

Each Workflow owns an independent persistent increment counter for `{{inc}}`. A run begins from the Workflow's current counter state, and successful increment generation advances that state durably.

## Consequences

- Rule-to-Workflow copying can preserve common data generation behavior.
- Rule and Workflow counters never affect one another.
- Workflow execution must persist counter advancement outside session-only run state.
- Concurrent runs of the same Workflow require explicit counter-allocation semantics, to be resolved separately.
