# Workflow Domain Glossary

## Rule

A one-shot configuration that fills fields on a matching page. A rule is not responsible for coordinating work across page navigations.

## Workflow

A finite automation definition containing an ordered, linear sequence of steps that can perform work across multiple page documents in one browser tab.

## Workflow Run

One execution of a workflow. It remains bound to its originating tab across same-tab URL changes and ends by completing, failing, timing out, or being cancelled. A tab can own at most one active run.

## Run Snapshot

The immutable copy of a Workflow's executable definition captured when a run starts. Later changes to the saved Workflow do not alter this snapshot.

## Originating Tab

The browser tab in which a Workflow Run starts. It remains the run's only execution target until the run terminates.

## Manual Start

An explicit user request made from the popup or FAB that creates a Workflow Run. No page or background event may create a run automatically.

## Start Guard

An atomic live-condition check performed immediately before creating a Workflow Run. Start Guards cover definition availability, current URL, page support, and tab occupancy; they do not repeat full saved-definition validation.

## Starting URL Condition

An optional guard used to determine whether a Workflow appears as startable in the popup or FAB. It is checked again when the user starts the Workflow. Matching permits the run to start but never triggers it by itself.

## URL Pattern

The shared wildcard or slash-delimited regular-expression syntax used by Rules, Workflow Starting URL Conditions, and `Wait for URL` steps.

## SPA URL Change

A URL change made without replacing the page document, commonly through the History API or a hash change. `Wait for URL` observes these changes.

## Workflow Step

A workflow-owned unit of work. Steps do not hold live references to rules.

## Execution Policy

Timing and retry configuration used while executing a step. It includes editable timeout and retry-interval fields. A Workflow provides defaults that individual steps can override.

## Observation Step

A read-only step that waits for or verifies page state. Observation steps retry by default until they succeed or exhaust their execution policy.

## Side-effect Step

A step that changes page or browser state, such as filling or clicking. It may retry resolution and readiness before dispatch, but its side effect is dispatched at most once.

## Actionability

The observable conditions that indicate a target is ready for a particular interaction. The required checks depend on the action and may include unique resolution, visibility, stability, enabled state, editability, focusability, and receiving pointer events.

## Element Wait State

The explicit positive condition observed by `Wait for Element`: `attached`, `visible`, `enabled`, `clickable`, `editable`, or `focusable`. `Visible` is the default.

## Force

An explicit advanced option that bypasses applicable non-essential actionability checks. It is never the default.

## Locator

A serializable description of how a Workflow Step resolves page elements in the ordinary top-level document DOM. It can use CSS and user-facing semantics such as role, accessible name, label, rendered text, placeholder, or test ID. Shadow DOM and iframe contents are outside the current lookup scope.

## Semantic Filter

A user-facing constraint applied while resolving a Locator, such as an element's rendered text, accessible role and name, or associated label.

## Text Match Mode

The comparison used by a textual Locator filter: whitespace-normalized `Exact`, whitespace-normalized `Substring`, or slash-delimited `Regex`. Exact and substring matching expose case control.

## Resolution Policy

The rule for choosing a target when a Locator is evaluated. `Unique` requires exactly one match and is the default; `First` explicitly chooses the first match in document order.


## Current Step

The single step a Workflow Run is executing or waiting to execute. A successful result advances the run to the next step.

## Step Label

The optional author-defined name shown in run progress and diagnostics. Slime generates a descriptive label when none is provided.

## Background Coordinator

The event-driven extension component that owns Workflow Run transitions and associates saved runtime state with a browser tab. It can be reconstructed after Manifest V3 service-worker suspension.

## Page Executor

The top-level content-script instance that executes DOM-related steps in the current main page document. A newly injected Page Executor reconnects to an active run after navigation or reload. Iframe content-script instances are not Workflow Page Executors.

## Main Document DOM

The ordinary DOM of the tab's top-level page document. It is the only Workflow lookup and execution scope; iframe documents and Shadow DOM are excluded.

## Document ID

The identity of the top-level page document executing a Workflow command. It prevents reports from a replaced document from affecting the active run.

## Attempt ID

The identity of one dispatched step attempt. It allows the coordinator to reject duplicate or stale reports.

## Browser Session

The lifetime from opening Chrome until fully exiting it. Active Workflow Runs are recoverable within this boundary but do not automatically resume in a later session.

## Continue on Failure

An explicit step option that records any runtime step failure as a warning and advances a linear run instead of failing it. It does not override run-level cancellation or interruption.

## Completed with Warnings

The popup/FAB presentation for a `completed` Workflow Run whose warnings array is nonempty. It is not a separate terminal status.

## Interrupted

A terminal Workflow Run status indicating that its execution environment disappeared, such as when the originating tab closed. It is distinct from user-requested cancellation and step failure.

## Unsupported Page

A page on which Chrome does not permit Slime's Page Executor to operate. Reaching one fails the current step immediately with a specific diagnostic.

## At-Most-Once Delivery

The guarantee that a side-effect attempt is never replayed after its durable dispatch checkpoint, even when navigation destroys the Page Executor before acknowledgement. It prevents duplicates but may rarely skip an uncertain action.

## Dispatch Checkpoint

Durable Workflow Run state written immediately before a Page Executor performs a side effect. It tells a replacement executor not to repeat that attempt.

## Resolved Step Value

The concrete value generated once for a data-entry step and persisted for reuse throughout that step's retries and recovery.

## Increment Reservation

An atomic allocation from a Workflow's persistent counter. A reservation is never returned or reused, even if its run does not complete.

## Copy from Rule

An all-or-nothing editor operation that losslessly converts a compatible Rule into independent Workflow Steps. It is a one-time copy, not a synchronized relationship. Any unsupported Rule feature blocks the operation.

## Workflow Counter

The persistent increment state owned by one Workflow and used for its `{{inc}}` values. It is independent of every Rule counter.

## Stored Image

A reusable image asset referenced by ID from Rule fields or Workflow upload steps. Sharing the asset does not couple the surrounding automation definitions.
