# ADR 0008: Auto-wait for actionability

- Status: Accepted
- Date: 2026-08-11

## Context

An element's presence in the DOM does not mean that a user could successfully interact with it. It may be hidden, moving, disabled, readonly, or covered by an overlay. Requiring authors to insert a separate wait before every interaction would be verbose and easy to get wrong.

Playwright addresses this with action-specific actionability checks before performing interactions. Its model provides a useful precedent for Slime.

## Decision

`Wait for Element` defaults to waiting for visibility.

Interaction steps automatically retry their relevant actionability checks before producing their side effect:

- `Click` requires a uniquely resolved target that is visible, stable, enabled, and able to receive pointer events.
- `Fill` requires a uniquely resolved target that is visible, enabled, and editable.
- `Press Key` requires an attached, enabled target that can receive focus.
- `Select` requires a uniquely resolved target that is visible and enabled.

Actionability consumes the step's execution policy. If the checks do not pass before the policy is exhausted, the step fails without performing its action.

Advanced configuration may explicitly force an action past non-essential checks. Force is never the default and must be visible in the editor.

## Consequences

- Common workflows need fewer explicit wait steps.
- A disabled control can become enabled without causing premature failure.
- Page executors need visibility, stability, disabled-state, editability, focusability, and hit-target checks.
- Actionability can infer intent only from observable DOM, style, layout, and accessibility state; it cannot detect private application state that the page does not expose.
- The UI and run log must identify which actionability check timed out.

## Reference

- [Playwright actionability](https://playwright.dev/docs/actionability)
