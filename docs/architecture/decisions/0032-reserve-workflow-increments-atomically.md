# ADR 0032: Reserve Workflow increments atomically

- Status: Accepted
- Date: 2026-08-12

## Context

Concurrent runs of one Workflow may evaluate `{{inc}}` at the same time. Reading and later updating a shared counter could give both runs the same value.

Returning a reserved number after failure would also allow a later run to reuse a value that may already have reached a website.

## Decision

Reserve each Workflow increment atomically from the Workflow's persistent counter.

Concurrent runs never receive the same reserved number. A reservation remains consumed if its step or run later fails, is cancelled, or is interrupted.

## Consequences

- Increment values remain unique across concurrent tabs.
- Counter sequences may contain gaps.
- Reservation and counter advancement must be one concurrency-safe storage operation coordinated by the background service worker.
- Resetting a counter while runs are active requires a separate safety rule.
