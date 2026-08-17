# ADR 0044: Separate definition validation from start guards

- Status: Accepted
- Date: 2026-08-12

## Context

Repeating the complete saved-definition validation when a Workflow starts would duplicate checks already enforced when the definition was written. Starting still depends on live tab and definition availability state that could not have been guaranteed at save time.

## Decision

Validate the complete Workflow definition whenever it is written, including creation, editing, import, copying, and migration. Invalid definitions are not saved as startable Workflows.

Do not repeat that complete schema and semantic validation at Start. Instead, atomically enforce these live **Start Guards** immediately before run creation:

- the Workflow remains available, enabled, and unarchived;
- the current tab URL satisfies its Starting URL Condition;
- Slime supports execution on the current page;
- the tab owns no active or stopping Workflow Run.

Referenced assets are resolved when their step executes rather than preloading and rechecking every asset at Start.

## Consequences

- Start avoids redundant full-definition validation.
- Tab races and stale popup/FAB state cannot create invalid competing runs.
- Definition validation and Start Guards remain separate concepts with different diagnostics.
- A shared image deleted or corrupted after save fails its upload step with a specific missing-asset diagnostic.
