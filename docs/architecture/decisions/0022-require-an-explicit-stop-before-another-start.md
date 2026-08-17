# ADR 0022: Require an explicit stop before another start

- Status: Accepted
- Date: 2026-08-12

## Context

A tab can own only one active Workflow Run. Combining replacement with a new start could obscure whether the old run finished cancelling before actions from the new run began.

## Decision

While a tab owns an active or stopping Workflow Run, no other Workflow can start in that tab.

The user must explicitly stop the current run. A new run becomes startable only after cancellation has reached its terminal state and released the tab.

There is no combined `Stop current and start new` operation and no silent replacement.

## Consequences

- Actions from two runs cannot overlap during replacement.
- Cancellation and starting remain separate, observable user intents.
- Popup and FAB must disable or hide Workflow start actions while showing the current run and its Stop control.
- A failed or delayed cancellation cannot accidentally launch the requested replacement.
