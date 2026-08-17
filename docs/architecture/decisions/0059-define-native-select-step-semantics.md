# ADR 0059: Define native Select step semantics

- Status: Accepted
- Date: 2026-08-13

## Context

Native `<select>` controls expose option values and visible labels. Current Rules automatically compare a configured string against both, but an explicit mode makes author intent and ambiguous data clearer.

Multi-select controls require list authoring and selection semantics beyond the common single-option case.

## Decision

`Select` targets native single-selection `<select>` elements and exposes an explicit option matching mode:

- `Label` is the editor default and matches normalized visible option text.
- `Value` matches the option's value attribute.

Multiple-selection is not supported initially. A target with `multiple` fails with an incompatible-target diagnostic.

Custom dropdown widgets are not native selects and must be automated with steps such as `Click`.

## Consequences

- Authors can distinguish user-facing labels from implementation values.
- Rule conversion can infer the matching mode only when the configured value has one unambiguous lossless interpretation; otherwise conversion is blocked.
- Multi-select and custom widget behavior remain outside the Select step.
