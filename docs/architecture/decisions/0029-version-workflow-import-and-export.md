# ADR 0029: Version Workflow import and export

- Status: Accepted
- Date: 2026-08-12

## Context

The existing Rule export format carries a schema version. Workflow definitions also need portable backup and restore while allowing their data model to evolve safely.

Active runs contain tab-specific and session-specific state that is neither reusable nor safe to restore as an automation definition.

## Decision

Include Workflow definitions in Slime's versioned JSON import/export envelope. Adding Workflows requires a corresponding format-version change and validated migration behavior for supported older exports.

Export reusable definitions only. Do not export active Workflow Runs, tab IDs, current-step positions, timeout deadlines, dispatch checkpoints, or execution history.

## Consequences

- Imports can validate the Workflow discriminated unions and reject unsupported future formats clearly.
- Older supported exports can be migrated intentionally rather than guessed.
- Import does not resume or recreate browser automation.
- Referenced shared assets require validation and clear missing-asset diagnostics.
