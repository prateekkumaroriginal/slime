# ADR 0055: Protect images used by active runs

- Status: Accepted
- Date: 2026-08-13

## Context

Run Snapshots store image references rather than duplicating base64 payloads. Deleting an image while an active run still expects to upload it would invalidate otherwise immutable execution input.

## Decision

Block deletion of a stored image while any active or stopping Workflow Run Snapshot references it.

After those runs terminate, ordinary dependency confirmation for saved Rule and Workflow definitions applies.

## Consequences

- An active run does not lose its shared image asset mid-execution.
- Image deletion needs dependency checks against both saved definitions and active snapshots.
- Users may need to stop or wait for runs before deleting an image.
