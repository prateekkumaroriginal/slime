# ADR 0048: Scroll click targets and use DOM clicks

- Status: Accepted
- Date: 2026-08-12

## Context

A click target outside the usable viewport cannot pass pointer hit testing. Scrolling can trigger layout and page listeners, but its normal per-action computational overhead is small.

Producing trusted browser input would require substantially more invasive Chrome debugger permissions and runtime control.

## Decision

Before dispatching `Click`, Slime scrolls the target into view only when necessary, using immediate rather than smooth scrolling. It then re-resolves the Locator and repeats actionability checks before dispatch.

Workflow clicks use DOM-generated click behavior, consistent with current Rules. Slime does not request Chrome debugger permissions to synthesize trusted browser input.

## Consequences

- Off-screen targets can become actionable without continuous or animated scrolling.
- Scroll-triggered page changes are accounted for by re-resolution and renewed checks.
- Click events are synthetic and expose `isTrusted === false`.
- Sites that require trusted input are unsupported.
