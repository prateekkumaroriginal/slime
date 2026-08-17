# ADR 0013: Make Locator resolution policy explicit

- Status: Accepted
- Date: 2026-08-11

## Context

A Locator may resolve to more than one element. Silently choosing an element would hide ambiguous automation, but some pages intentionally contain repeated matches where selecting the first element is useful.

Calling the strict behavior "exact" would be ambiguous because text matching separately supports exact and substring modes.

## Decision

A target Locator, including interaction and positive `Wait for Element` Locators, has an explicit resolution policy:

- **Unique** is the default. The Locator must resolve to exactly one element. Zero matches continue waiting; multiple matches remain ambiguous and eventually fail with a diagnostic.
- **First** is an opt-in. The first matching element in document order becomes the target. Zero matches continue waiting.

After target resolution, the selected element must still pass the action's actionability checks. Under `First`, Slime does not skip an unready first match in favor of a later actionable match.

## Consequences

- Safe behavior remains the default.
- Authors can intentionally target the first repeated control without constructing a fragile positional CSS selector.
- Run logs can distinguish `no matches`, `ambiguous matches`, and `target not actionable`.
- Reordering matching DOM elements can change the target of a `First` Locator, so the editor should label that policy as order-dependent.
