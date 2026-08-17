# ADR 0060: Omit dedicated Check and Uncheck steps

- Status: Accepted
- Date: 2026-08-13

## Context

Native checkbox and radio controls can be operated through the existing `Click` step. Dedicated desired-state operations would add type-specific idempotence and radio-group rules.

## Decision

Remove `Check/Uncheck` from the initial Workflow Step catalog.

Authors use `Click` to operate native checkbox and radio controls. Slime does not inspect or guarantee a desired checked state before clicking; the author is responsible for arranging the Workflow so the click is appropriate.

## Consequences

- The initial interaction catalog remains smaller.
- Re-running or reaching a checkbox in an unexpected state may toggle it incorrectly.
- Rule checkbox and radio field mappings have no lossless Workflow conversion and therefore block all-or-nothing `Copy from Rule`.
- Desired-state Check/Uncheck operations may be proposed later.
