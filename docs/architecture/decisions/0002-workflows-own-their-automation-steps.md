# ADR 0002: Workflows own their automation steps

- Status: Accepted
- Date: 2026-08-11

## Context

Rules already describe form-filling behavior. A workflow may need similar behavior, but a live reference from a workflow to a rule would couple workflow execution to later rule edits, deletion, archival, URL matching, and counter state.

## Decision

A Workflow does not execute or reference an existing Rule.

The editor may offer **Copy from Rule** as an authoring operation. Copying converts the selected rule's compatible configuration into workflow-owned steps. The resulting workflow data is independent: subsequent changes to the source rule do not affect the workflow, and subsequent workflow changes do not affect the rule.

## Consequences

- A Workflow Run depends only on its workflow definition and runtime state.
- Deleting or editing a rule cannot silently change an existing workflow.
- Copying requires a lossless conversion contract for fields, generated values, repeat groups, post-actions, and Rule settings. Any unsupported feature blocks the copy and is named to the user.
- Improvements made to a copied rule are not synchronized automatically.
