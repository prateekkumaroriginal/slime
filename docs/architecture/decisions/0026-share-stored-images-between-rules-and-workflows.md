# ADR 0026: Share stored images between Rules and Workflows

- Status: Accepted
- Date: 2026-08-12

## Context

Stored images are reusable extension assets. Duplicating their base64 payload into every copied Workflow would waste storage and make asset management inconsistent.

## Decision

Workflow upload steps reference the existing stored-image asset by image ID. Copying an image field from a Rule retains that asset reference but creates independent Workflow step configuration.

Deleting an image that is referenced by any Rule or Workflow requires confirmation that identifies the affected definitions.

## Consequences

- Image payloads are not duplicated when copying Rules or Workflows.
- Rules and Workflows can intentionally share an image asset without sharing automation behavior.
- Image deletion requires dependency lookup across both definition types.
- A missing image reference must be reported as a specific validation or execution error.
