# LifeROI quality-engineering review

Review date: 2026-08-13

## Executive summary

**Overall quality: Unsafe for production use with sensitive personal or financial documents.**

The current release is a polished public synthetic-data prototype. It has one client-rendered dashboard, deterministic projection helpers, a declared D1 schema, and platform binding declarations. It does **not** yet implement the production application described in the product architecture: there are no application APIs, owner-scoped database queries, R2 upload service, AI extraction adapter, review persistence, authentication enforcement, deletion workflow, background jobs, or real account isolation checks.

The prototype is suitable for demonstrating the LifeROI concept after the upload boundary added in this review. It must not be presented as a production financial document processor.

## Architecture summary

| Layer | Implemented state | Quality implication |
| --- | --- | --- |
| Presentation | Single React client dashboard with in-page views | Functional demo surface exists; true route protection does not |
| Financial domain | Projection, recovered-time, and goal arithmetic | Deterministic and now boundary-validated |
| Upload | Browser file selector plus synthetic random data generator | No file contents are extracted or persisted |
| Identity | Reusable ChatGPT header helpers exist | Dashboard does not require or use identity |
| Persistence | D1 schema and binding declaration exist | No application CRUD/query layer uses it |
| Object storage | R2 binding declared | No private upload/download/delete implementation |
| AI | Architecture contract documented | No provider adapter, schema validation, confidence gate, or prompt-injection boundary |
| Worker | Routes requests to the vinext application | No API authorization, rate limiting, or security middleware |

Sensitive future data includes identity, financial documents, transactions, goals, screen-time records, utility usage, inferred categories, and AI prompts/results. The browser-to-worker boundary, worker-to-R2/D1 boundary, and worker-to-AI-provider boundary are the critical trust boundaries still to implement.

## Existing testing-stack assessment

- Node's built-in test runner is used for deterministic domain and rendered-output checks.
- The build renders the deployed worker shape before integration checks.
- ESLint includes React, hooks, TypeScript, Next, and JSX accessibility rules.
- No Playwright, API harness, database test environment, AI contract tests, accessibility scanner, cross-browser matrix, or load-testing harness currently exists.
- The previous default test command omitted the projection suite; it now runs every root `*.test.mjs` suite.

## Critical user journeys

1. Public visitor explores synthetic Money, Time, Energy, Future, Goals, Settings, and Advisor views.
2. Visitor selects a non-sensitive sample or generates a synthetic dataset and sees all dashboard families recalculate.
3. Visitor changes reduction, horizon, and return assumptions and sees deterministic projections.
4. Future production journey: authenticate → upload privately → classify/extract → review provenance/confidence → confirm → persist owner-scoped records → update opportunities/projections/goals → delete/export data.

Only journeys 1–3 are partially implemented today. Journey 4 is the production-critical path.

## Risk matrix

| Risk | Probability | User impact | Priority | Status |
| --- | --- | --- | --- | --- |
| Prototype presented as secure real extraction | High | Critical privacy/trust harm | P1 | Mitigated with explicit synthetic-only notice; legacy copy remains to be fully redesigned |
| Invalid percentage/NaN/Infinity corrupts projections | Medium | Critical financial misinformation | P1 | Fixed and regression-tested |
| Cross-user record or document access | Unknown until backend exists | Critical privacy breach | P0 | Blocked: owner-scoped APIs do not exist |
| Duplicate/overlapping statements double-count | High without idempotency | Critical financial inaccuracy | P0 | Not implemented |
| AI hallucination becomes trusted record | High without provenance gate | Critical financial inaccuracy | P0 | AI pipeline not implemented |
| Malicious document prompt injection | Medium | Critical data/control exposure | P1 | AI pipeline not implemented |
| Account/source deletion incomplete | High until implemented | Critical privacy/regulatory harm | P1 | Not implemented |
| Keyboard user trapped or loses focus in dialog | Medium | Major usability/accessibility harm | P2 | Fixed and regression-tested |
| Empty/oversized/MIME-mismatched sample accepted | Medium | Major security/reliability concern | P2 | Fixed and regression-tested |
| Mobile/browser-specific interaction regressions | Medium | Major usability harm | P2 | Browser execution unavailable in this review |

## Test pyramid and automation architecture

```text
Small E2E layer: authenticated critical journey, deletion, duplicate upload, mobile smoke
API/integration layer: ownership, CRUD, D1 transactions, R2 privacy, AI contract/failure handling
Large unit/property layer: finance, time, currencies, dates, dedupe keys, validators, provenance
```

Proposed structure:

```text
tests/
  unit/finance time validation dedupe
  integration/d1 r2 ai-contract
  api/auth ownership uploads records deletion
  e2e/public-demo authenticated-ingestion mobile
  security/idor xss prompt-injection malicious-files privacy
  accessibility/axe keyboard reduced-motion
  performance/server-render api upload-orchestration load
  fixtures/synthetic-statements bills screen-time malicious-documents
  factories/ users records goals documents
```

## P0/P1 test cases

1. User A cannot read, mutate, download, or delete User B's document, record, goal, scenario, recommendation, or signed object URL.
2. Re-uploading identical and overlapping statements is idempotent at document and transaction level.
3. Extracted, inferred, and user-confirmed values have distinct immutable provenance; low-confidence or missing fields cannot auto-confirm.
4. Prompt-injection text in PDF/image/CSV/merchant fields remains untrusted document content.
5. Finance results match independent formulas for 0–100% savings, 0–12% returns, 0–10% inflation, supported horizons, currencies, and rounding rules.
6. Invalid numeric inputs, malformed provider JSON, AI timeouts/429/500, storage failures, and mid-transaction database failures fail safely and atomically.
7. MIME type, extension, byte signature, size, page count, decompression limits, password protection, and malware policy are enforced server-side.
8. Complete account deletion revokes sessions and makes source objects, derived records, AI artifacts, and signed URLs inaccessible.
9. Stored and reflected XSS strings render as text in every user- or AI-controlled field.
10. Concurrent uploads and goal edits do not duplicate records or lose updates.

## Security and privacy attack surface

- Anonymous public dashboard and future authenticated routes.
- Identity headers and return-path handling.
- Multipart uploads, file parsers/OCR, image/PDF decompression, and object keys.
- AI prompts, document content, tool/schema outputs, retries, and provider logs.
- Owner-scoped D1 queries, IDs exposed in URLs, bulk mutations, and transaction boundaries.
- Signed R2 URLs, cache headers, retention jobs, export, deletion, and audit logs.
- React rendering of merchant names, goals, transaction descriptions, and AI recommendations.
- Financial input coercion, locale/currency parsing, dates/timezones, overflow, and rounding.

## Performance strategy

Establish separate service-level objectives for normal API work and long-running AI extraction. Measure dashboard and record APIs at P50/P95/P99, upload acceptance time, queue delay, extraction duration by document type/page count, D1 query latency, and error rate. Use synthetic documents only. Run staged k6 workloads at 10, 100, 500, then 1,000 users after APIs exist; increase load to identify graceful-degradation and recovery behavior. Never include AI latency inside an unlabeled generic API metric.

## Executed results

| Check | Result |
| --- | --- |
| Automated tests | 22 passed, 0 failed, 0 skipped |
| Production build | Passed |
| Lint | 0 errors; 2 image-optimization warnings |
| Local built-worker render smoke | 25 requests: P50 16.06 ms, P95 26.49 ms, P99 28.05 ms; excludes network/browser/AI/storage/database |
| Domain coverage exercised | Savings arithmetic, independent compounding reference, inflation separation, time recovery, goal edges, monotonic savings, invalid/non-finite inputs |
| Upload validation exercised | Valid PDF/CSV/TXT/PNG/JPG; empty, over-limit, unsupported, executable, and MIME mismatch rejection |
| Rendered integration exercised | Product shell, navigation wiring, advisor submit, data recalculation wiring, upload boundary, dialogs, settings/info controls, metadata |
| Browser/responsive/cross-browser | Not executed: browser-control connection unavailable |
| API/database/AI/security isolation | Not executable: corresponding production services do not exist |

## Defects fixed

### LROI-001 — Invalid projection inputs accepted

- Severity/Priority: P1
- Root cause: projection helpers silently clamped or propagated negative, out-of-range, NaN, and infinite inputs.
- Fix: finite/range validation for spending, savings percentage, horizon, return, inflation, time, goal, current value, and contribution.
- Regression: boundary, invalid-input, monotonicity, and independent-formula tests.

### LROI-002 — Public upload implied real secure extraction

- Severity/Priority: P1
- Root cause: the selector generated random data from the filename while surrounding copy implied private extraction and storage.
- Fix: prominent synthetic-samples-only boundary and explicit statement that contents are not read or stored; client validation added.
- Regression: rendered-boundary and upload-validator tests.

### LROI-003 — Dialog keyboard and focus behavior incomplete

- Severity/Priority: P2
- Root cause: no Escape handling, focus containment, or focus restoration.
- Fix: keyboard close, Tab/Shift+Tab containment, initial focus, and restoration.
- Regression: source integration assertions plus clean accessibility lint.

### LROI-004 — Quality gate omitted domain tests and failed lint

- Severity/Priority: P2
- Root cause: the default test script ran only one rendered suite; mutable render calculation and effect patterns violated quality rules.
- Fix: all root test suites now run; chart computation and effects made deterministic/lint-safe.

## Implementation order

1. Build authenticated owner-scoped APIs and enforce identity on every write/read.
2. Implement private R2 upload plus D1 document state machine, byte-signature validation, limits, idempotency, and atomic processing.
3. Implement provider-neutral extraction with strict schemas, provenance, confidence thresholds, prompt-injection isolation, and mandatory review.
4. Implement deduplicated records, calculations, opportunities, goals, retention, export, and complete deletion.
5. Add integration/API suites using isolated D1/R2 fixtures and two-user adversarial tests.
6. Add Playwright Chromium/Firefox/WebKit journeys, axe checks, responsive matrix, reduced motion, and network/provider failure tests.
7. Add concurrency/load/stress suites, observability without sensitive payloads, recovery drills, and CI gates.

## Production-readiness decision

**NOT PRODUCTION READY.** The current prototype cannot yet answer the required user-isolation, duplicate-ingestion, AI hallucination, malicious-document, storage-recovery, deletion, or realistic-load questions. Any real-document upload should remain disabled until the P0 trust boundaries and their tests are implemented.
