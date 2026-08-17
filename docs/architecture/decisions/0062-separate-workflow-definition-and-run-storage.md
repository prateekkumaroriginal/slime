# ADR 0062: Separate Workflow definition and run storage

- Status: Accepted
- Date: 2026-08-13

## Context

Workflow definitions must remain available across browser sessions. Active runs must survive Manifest V3 service-worker suspension but must not automatically recover after Chrome fully exits.

## Decision

Store reusable Workflow definitions in `chrome.storage.local`, separately from Rules.

Store active Run Snapshots and progress in `chrome.storage.session`.

## Consequences

- Workflow definitions persist until edited, archived, or deleted.
- Active runs can be reconstructed after service-worker suspension within the browser session.
- Session-scoped run state disappears when the browser session ends and is not exported.
- Storage access belongs behind dedicated Workflow definition and runtime abstractions.
