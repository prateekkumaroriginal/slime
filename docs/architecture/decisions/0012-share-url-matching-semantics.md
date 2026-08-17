# ADR 0012: Share URL-matching semantics

- Status: Accepted
- Date: 2026-08-11

## Context

Rules already match URLs using wildcard patterns and slash-delimited regular expressions. Defining another syntax for Workflow Starting URL Conditions or `Wait for URL` steps would create inconsistent behavior and duplicate validation logic.

## Decision

Workflow Starting URL Conditions and `Wait for URL` steps use the same wildcard and `/regex/` syntax and matching behavior as Rule URL patterns.

Rule filtering, Workflow discovery, Workflow start validation, and URL wait evaluation use one shared URL-matching implementation.

## Consequences

- Users learn one URL pattern language.
- Existing Rule URL patterns can be copied into Workflow Starting URL Conditions without translation.
- Fixes or semantic changes to URL matching affect every consumer and require regression coverage for each.
- Start validation, popup/FAB discovery, and URL waits cannot drift into different interpretations.
