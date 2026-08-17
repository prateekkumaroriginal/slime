# ADR 0058: Keep Workflow upload steps single-file

- Status: Accepted
- Date: 2026-08-13

## Context

Current Rule image fields upload one stored image through one file-input assignment. Supporting multiple files would add list authoring, ordering, and target-capability validation beyond existing behavior.

## Decision

`Upload File` references and uploads one stored image only.

Multiple-file upload is not included initially, even when the target input has the `multiple` attribute.

## Consequences

- Rule image-field conversion remains direct.
- Workflow definitions and resolved values contain one image reference per upload step.
- Authors cannot initially populate a multi-file input with several files in one Workflow Step.
