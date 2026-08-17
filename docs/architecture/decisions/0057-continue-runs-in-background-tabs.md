# ADR 0057: Continue runs in background tabs

- Status: Accepted
- Date: 2026-08-13

## Context

Workflows start manually in the active tab but remain bound to that originating tab. Users may switch tabs while a run is waiting, and different tabs may own concurrent runs.

Chrome can throttle timers in inactive tabs, making exact polling cadence unreliable.

## Decision

A Workflow Run continues when its originating tab becomes inactive or moves to the background.

Retry intervals are best-effort scheduling targets in background tabs. Persisted absolute timeout and Delay deadlines remain authoritative and are not extended by throttling or tab inactivity.

## Consequences

- Switching tabs does not pause automation.
- Multiple tabs can continue their independent runs concurrently.
- Slime does not promise exact interval precision in inactive tabs.
- An overdue check runs when Chrome next schedules the Page Executor or wakes the coordinator, subject to the absolute deadline.
