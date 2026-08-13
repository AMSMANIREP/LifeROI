# LifeROI architecture

LifeROI is organized as a modular monolith for the MVP. The UI consumes deterministic domain services; persistence and AI providers sit behind server-side boundaries so they can be separated later without changing product behavior.

## Product surfaces

- `/` — public demo dashboard and product experience
- `/upload` — document ingestion, classification, extraction progress, and review
- `/money`, `/time`, `/energy`, `/subscriptions` — resource analysis
- `/future`, `/goals`, `/opportunities` — projections and action planning
- `/advisor` — data-grounded assistant
- `/settings/privacy` — retention, source deletion, export, and account deletion

The first release presents these surfaces as a fast single-page workspace; the navigation and component boundaries map directly to future routes.

## Layers

1. Presentation: React components, accessible controls, responsive navigation, charts, review forms.
2. Domain: `ProjectionService`, `GoalService`, `OpportunityService`, and `ResourceAnalysisService`. Financial formulas never run in an LLM.
3. Application: upload orchestration, schema validation, ownership checks, and audit events.
4. Infrastructure: D1 for structured data, R2 for private documents, platform identity headers, and a provider-neutral AI adapter.

## Normalized resource model

Every resource record has an owner, type, category, date/period, numeric value, unit, provenance, and optional confidence. Money uses minor currency units in production; time uses minutes; electricity uses kWh. Cross-resource trade-offs are modeled as linked deltas, such as `-₹2,000/month` and `+4 hours/month`, preserving both sides rather than collapsing them into one score.

## Deterministic projections

- Monthly redirection = monthly spending × reduction percentage.
- Cash value = current savings + monthly redirection × months.
- Investment value uses the future value of current principal plus an ordinary monthly annuity at `annualReturn / 12`.
- Inflation-adjusted value = nominal future value ÷ `(1 + inflation rate)^years`.
- Goal date = `(target - current) ÷ monthly contribution`, rounded up.

Investment growth and inflation-adjusted purchasing power are always labeled separately from arithmetic cash savings.

## AI extraction contracts

The provider-neutral extractor first returns `{ documentType, confidence }`, then one of these validated payloads:

```ts
type MoneyExtraction = { resourceType:"money"; date:string; merchant:string; category:string; amount:number; currency:string; recurring:boolean; confidence:number };
type TimeExtraction = { resourceType:"time"; period:"daily"|"weekly"|"monthly"; totalMinutes:number; categories:{ name:string; minutes:number }[]; confidence:number };
type ElectricityExtraction = { resourceType:"electricity"; periodStart:string; periodEnd:string; unitsKwh:number; amount:number; currency:string; confidence:number };
type SubscriptionExtraction = { resourceType:"subscription"; merchant:string; amount:number; currency:string; cadence:"monthly"|"quarterly"|"annual"; renewalDate?:string; confidence:number };
```

All payloads go through server-side validation and a Review & Confirm state before entering analytics.

## Privacy and security

- Platform identity headers establish the user; every query includes the stable owner ID.
- R2 objects use opaque owner-scoped keys and private access; downloadable files use short-lived signed access.
- Encryption is provided in transit and at rest by the platform.
- Source deletion, configurable retention, export, and full account deletion are first-class workflows.
- Logs store request IDs and status only—never document bodies or extracted financial content.
- Sensitive writes produce minimal audit events, and AI requests never mix users or enter cross-user context.

## Implementation plan

1. Foundation: design system, resource schema, deterministic services, demo data.
2. Analytics: money/time/energy/subscription views and interactive opportunity ranking.
3. Planning: projections, goals, timeline, and scenario comparison.
4. Ingestion: D1/R2 upload metadata, AI adapter, validation, review-and-confirm flow.
5. Advisor: retrieval limited to the signed-in user’s confirmed records.
6. Hardening: migrations, API integration tests, accessibility, retention jobs, audit review, and production monitoring.
