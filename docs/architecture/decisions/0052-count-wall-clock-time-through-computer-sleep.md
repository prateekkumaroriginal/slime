# ADR 0052: Count wall-clock time through computer sleep

- Status: Accepted
- Date: 2026-08-13

## Context

Workflow deadlines are persisted as absolute timestamps so they survive document replacement and service-worker suspension. Computer sleep also suspends execution while wall-clock time continues.

## Decision

Computer sleep counts toward step timeouts and Delay deadlines.

After Chrome resumes, a step whose timeout deadline passed fails immediately according to its failure behavior. A Delay whose deadline passed completes immediately.

## Consequences

- Deadlines retain one consistent wall-clock meaning across lifecycle events.
- Sleeping the computer does not extend a Workflow unpredictably.
- Chrome wake latency may cause execution later than a Delay deadline, never earlier.
