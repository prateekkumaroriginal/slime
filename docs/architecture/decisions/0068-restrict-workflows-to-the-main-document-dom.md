# ADR 0068: Restrict Workflows to the main document DOM

- Status: Accepted
- Date: 2026-08-13

## Context

Slime's existing manifest injects content scripts into all frames for current Rule behavior. The accepted Workflow scope excludes iframe and Shadow DOM support and needs one unambiguous page execution context per tab.

## Decision

Workflow Page Executors register, reconnect, receive commands, and report results only from the originating tab's top-level page document.

Workflow Locators search only that document's ordinary DOM. They do not search iframe documents or open or closed Shadow DOM.

Content-script instances in non-top-level frames ignore all Workflow coordination and execution messages. Existing Rule behavior may continue independently.

## Consequences

- Every tab has at most one eligible Workflow Page Executor document at a time.
- Embedded iframe controls and Shadow DOM internals cannot be automated initially.
- Frame identity cannot cause duplicate Workflow advancement.
- A future expansion to iframe or Shadow DOM targeting requires an explicit new decision and Locator model change.
