# ADR 0030: Require lossless Rule-to-Workflow copying

- Status: Accepted
- Date: 2026-08-12

## Context

A Rule may contain features for which the Workflow step catalog has no equivalent. Partially copying only compatible parts could create automation that appears complete while silently or accidentally omitting behavior.

## Decision

`Copy from Rule` is all-or-nothing.

A Rule is copyable only when every relevant part has a defined, lossless Workflow conversion. If any unsupported feature is present, Slime does not create a Workflow from that Rule.

In the `Copy from Rule` picker, an uncopyable Rule displays a warning icon and cannot be selected for conversion. The warning's tooltip names the unsupported features rather than showing only a generic incompatibility message.

The warning is contextual to the copy picker; the ordinary Rule list does not mark the Rule as invalid.

## Consequences

- Copying never produces a knowingly incomplete Workflow.
- Users can identify exactly what prevents conversion.
- The converter must return structured incompatibility reasons before enabling copy.
- Adding a Workflow equivalent can make previously blocked Rules copyable.
- Authors must recreate or remove unsupported behavior before copying.
