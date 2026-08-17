# ADR 0036: Observe SPA URL changes

- Status: Accepted
- Date: 2026-08-12

## Context

Single-page applications change URLs through the History API or fragment identifiers without replacing the document or reinjecting Slime's Page Executor.

## Decision

`Wait for URL` evaluates the current full URL throughout its execution policy and detects History API route changes and hash changes as well as full-document navigation.

It uses the shared URL-matching implementation accepted for Rules and Workflow URL conditions.

## Consequences

- SPA routing can advance a Workflow without a document reload.
- Polling at the configured retry interval is sufficient for correctness; event signals may reduce latency but are not the sole source of truth.
- Full navigation resumes the same URL wait in the replacement Page Executor using the original deadline.
