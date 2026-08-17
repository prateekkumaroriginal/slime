# ADR 0045: Define Workflow Fill semantics

- Status: Accepted
- Date: 2026-08-12

## Context

Data entry can either replace or combine with an existing control value. Supporting several mutation modes would increase step configuration and make Rule conversion less direct.

Different control families also have distinct interaction semantics that should not be hidden behind one generic Fill operation.

## Decision

`Fill` replaces the target's existing value. Append and prepend modes are not included initially.

`Fill` supports text-capable `<input>` elements, `<textarea>`, and `[contenteditable]` targets. Checkboxes and radio buttons are operated with `Click`; select controls use `Select`; file inputs use `Upload File`.

## Consequences

- Fill behavior is deterministic and consistent with form-filling expectations.
- Incompatible target types fail with a specific diagnostic.
- Dedicated steps can apply correct actionability and event behavior for each control family.
