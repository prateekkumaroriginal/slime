# ADR 0004: Scope Workflow Runs to a browser session

- Status: Accepted
- Date: 2026-08-11

## Context

A run must continue when its tab performs a full navigation, which destroys the old page and its content-script instance. The Manifest V3 service worker may also be suspended during ordinary browser operation, losing any state held only in memory.

Automatically resuming browser automation after Chrome has fully exited could perform stale or surprising actions when the browser is reopened.

## Decision

A Workflow Run is durable within the current browser session:

- It survives full-document navigation and reload in its associated tab.
- It survives content-script replacement by reconnecting a new page executor to saved run state.
- It survives Manifest V3 service-worker suspension by storing runtime state outside service-worker memory.

A run does not automatically resume after Chrome fully exits and restarts. The user must start a new run manually.

Session-scoped extension storage is the preferred home for active runtime state. Permanent workflow definitions remain in durable local storage.

## Consequences

- The background coordinator can be reconstructed from saved session state whenever Chrome wakes it.
- Content scripts are replaceable step executors, not owners of the run lifecycle.
- Each new page document needs a handshake that discovers and resumes an active run for its tab.
- Browser exit, extension reload, disablement, or update interrupts active runs rather than silently continuing them later.
