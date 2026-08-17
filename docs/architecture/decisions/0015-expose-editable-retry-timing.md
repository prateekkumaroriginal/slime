# ADR 0015: Expose editable retry timing

- Status: Accepted
- Date: 2026-08-11

## Context

Workflow authors need control over how frequently Slime retries and how long it waits. A timeout and interval together provide a finite execution bound without requiring authors to calculate a separate attempt count.

## Decision

Expose retry interval and timeout as editable fields at the Workflow-default and applicable step-override levels.

New Workflows begin with:

- timeout: 30 seconds;
- retry interval: 500 milliseconds.

Steps inherit those values unless the author enters overrides. Validation prevents invalid values and excessively aggressive polling. There is no separate maximum-attempt field.

## Consequences

- Authors can tune fast and slow pages directly.
- The UI must distinguish inherited values from explicit overrides.
- Effective maximum attempts are bounded by timeout and interval.
- Stored values require units, bounds, and validation that are consistent between editor and executor.
