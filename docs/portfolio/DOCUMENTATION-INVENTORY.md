# Documentation inventory and authority audit

**19 October 2026 · source baseline main
`a36ae62af385641f2c4d92c07bcd851d10ee24d7`.** Tracked Markdown, repository agent
entry points, skill discovery, relevant operational docs and V2.1 evidence were
inventoried. This is a scope/classification index, not permission to rewrite
historical evidence. [Canonical entry](CURRENT-STATE.md).

## Classification

**ACTIVE** guidance is maintained against current decisions/source. **HISTORICAL**
records retain their dated content and have no current directive authority.
**TECHNICAL RUNBOOK** describes operations, never proves service activation.
**REVIEW EVIDENCE** remains immutable, including outdated status at the time it
was authored. **EXPERIMENTAL** cannot override approved direction. A runbook may
contain historical or experimental sections, explicitly identified below.

## Agent and design guidance

| File / discovery path | Class | Contradiction or gap → action |
| --- | --- | --- |
| [AGENTS.md](../../AGENTS.md) | ACTIVE | Useful product/QA rules lacked a dated entry point; add small canonical reading/precedence references and current photography scope. |
| [CLAUDE.md](../../CLAUDE.md) | ACTIVE | Older generic skills appeared primary; point to same authority and Aberbach workflow, retain useful six-size browser/QA rules. |
| [.codex Aberbach SKILL.md](../../.codex/skills/aberbach-fashion-art-direction/SKILL.md) | ACTIVE workflow | Add current-state entry; align matrix with current six sizes. Nonvisual docs work still excluded from visual implementation workflow. |
| [.codex browser-workflow.md](../../.codex/skills/aberbach-fashion-art-direction/references/browser-workflow.md) | TECHNICAL RUNBOOK | Five-size matrix omitted 1366×768; align six sizes. Retain existing browser, fonts, test/port cautions. |
| [.codex visual-qa.md](../../.codex/skills/aberbach-fashion-art-direction/references/visual-qa.md) | ACTIVE critique reference | Compatible hierarchy/integration/mobile prompts; preserve unchanged. |
| `.agents/skills/aberbach-fashion-art-direction` | ACTIVE discovery alias | Symlink to `.codex` single source; do not create a divergent duplicate. |
| [.claude design-taste](../../.claude/skills/design-taste-frontend/SKILL.md) | ACTIVE advisory skill | Generic suggestions, not approved Aberbach design; unchanged, subordinate to current scope. |
| [.claude emil-design-eng](../../.claude/skills/emil-design-eng/SKILL.md) | ACTIVE advisory skill | Interaction guidance only; initial-response/stack defaults do not override current task. Unchanged. |
| [.claude mobile-native](../../.claude/skills/mobile-native/SKILL.md) | ACTIVE advisory skill | Real hardware caution remains useful; no authority to redesign. Unchanged. |
| [.claude review-animations](../../.claude/skills/review-animations/SKILL.md) | ACTIVE advisory skill | Motion review only when relevant; unchanged. |
| [.claude STANDARDS.md](../../.claude/skills/review-animations/STANDARDS.md) | ACTIVE motion reference | Timing/easing guidance remains contextual, not a new mandatory visual language. Unchanged. |
| [.mcp.json](../../.mcp.json) | TECHNICAL tool configuration | Playwright declaration is not proof tools/browser are available; unchanged, not design authority. |

No additional tracked AGENTS/CLAUDE instruction copies were found. No generic
skill package or unrelated agent framework is changed.

## Maintained canonical set

| File | Class | Reconciliation |
| --- | --- | --- |
| [CURRENT-STATE](CURRENT-STATE.md) | ACTIVE | New concise first-read snapshot: main vs merged candidate vs public observation, authority, protection and next task. |
| [CREATIVE-DIRECTION](CREATIVE-DIRECTION.md) | ACTIVE | Replace open-ended old options with current identity/tokens/chapter constraints, full looks and photography-only Womenswear. Old text remains in linked Git history. |
| [PORTFOLIO-ROADMAP](PORTFOLIO-ROADMAP.md) | ACTIVE | Replace obsolete REFERENCE HARVEST phase, stale SHA and broken ROADMAP.md reference with thirteen prioritized workstreams and explicit gates. Old text remains in linked Git history. |
| [SITE-MAP-AND-NAVIGATION](SITE-MAP-AND-NAVIGATION.md) | ACTIVE | New actual routes, labels, hashes, layers/history, sitemap and DEV exclusions. No invented pattern-development path. |
| [DESIGN-DECISIONS](DESIGN-DECISIONS.md) | ACTIVE | New accepted/superseded choices; distinguish explicit owner decisions, implementation and exploratory proposals. |
| [PHOTO-CONTENT-HANDOFF](PHOTO-CONTENT-HANDOFF.md) | ACTIVE | New maintained guide over real slot/FinalViews architecture; no parallel image model. Record world-level verified-publication migration risk. |
| [This inventory](DOCUMENTATION-INVENTORY.md) | ACTIVE | Classification, contradictions, actions and evidence boundaries. |
| [Reconciliation report](DOCUMENTATION-RECONCILIATION.md) | REVIEW EVIDENCE | This task's discrepancy/validation record, not an application QA rerun. |
| [19 October public observations](PUBLIC-OBSERVATIONS-2026-10-19.md) | REVIEW EVIDENCE | New limited GET record; no overwrite of the 3 October production audit. |

## Historical design guidance

| File | Class | Action |
| --- | --- | --- |
| [REFERENCE-HARVEST-01](REFERENCE-HARVEST-01.md) | HISTORICAL / SUPERSEDED | Add status notice; preserve original sources, old opening/index proposal, old chapter order and baseline. Not the next implementation brief. |
| [RTW-PRODUCTION-INTEGRATION](RTW-PRODUCTION-INTEGRATION.md) | HISTORICAL / SUPERSEDED | Add status notice; PR #41 report's RTW-only files, automatic Back and 17-look archive are replaced by #42. Preserve its reliability investigation. |

## Operational and content handoff guidance

| File | Class | Gap / action |
| --- | --- | --- |
| [PRODUCTION-STATE](../PRODUCTION-STATE.md) | REVIEW EVIDENCE | Dated 3 October audit already states its limits. Preserve every observation/hash/result unchanged; link current limited observations separately. |
| [BACKEND-ACTIVATION](../BACKEND-ACTIVATION.md) | TECHNICAL RUNBOOK | Retain commands/failure behavior; add current-context notice. Code does not prove KV/R2/Turnstile/Resend/Gmail activation. |
| [DOMAIN-MIGRATION](../DOMAIN-MIGRATION.md) | TECHNICAL RUNBOOK + HISTORICAL PLANNING | Add notice: canonical source is current; pending/dashboard and later locale/measurement plans are not verified deployment or active creative instructions. |
| [DISCOVERY-ACTIVATION](../DISCOVERY-ACTIVATION.md) | TECHNICAL RUNBOOK | Add current-context notice; account verification/indexing/crawler policy requires independent evidence. Fragment SEO limitation remains valid. |
| [SECURITY-PREPARATION](../SECURITY-PREPARATION.md) | TECHNICAL RUNBOOK + EXPERIMENTAL policy | Add notice: CSP is candidate only; no implicit approval to enforce headers/HSTS. |
| [Expertise SOURCES](../../assets/source/expertise-temp/SOURCES.md) | ACTIVE content handoff | Four temporary supplied visuals, not verified owner work. Keep existing asset facts; add retention/canonical notice rather than executing old deletion suggestion. |
| [Process SOURCES](../../assets/source/process-temp/SOURCES.md) | ACTIVE content handoff | Three neutral plates, not photos. Keep source facts; add same retention/canonical notice. Do not run old generators over current assets. |

Engineering facts were cross-checked against package.json, Astro routes/config,
SiteLayout, route manifest, Worker/config, shared navigation, Portfolio components,
photo adapter/controllers and tests. Those source/configuration files are factual
references, **not modified documents**. Existing CI runs build/dry-run, Worker,
domain, diagnostics and smoke; no repository documentation/link-check npm script
exists. The reconciliation uses a task-local validator rather than adding a dependency.

## Review evidence: preserve all files unchanged

| Files / folder | Class and interpretation |
| --- | --- |
| [white-editorial README](review/white-editorial/README.md) and its assets | REVIEW EVIDENCE / HISTORICAL; merged PR #40 was subsequently rejected as a creative direction. Do not promote implementation to approval. |
| [RTW README](review/rtw-production-integration/README.md), [QA](review/rtw-production-integration/QA.md), [FOCUS](review/rtw-production-integration/FOCUS.md), manifests/screens/films | REVIEW EVIDENCE / HISTORICAL PR #41. “Draft PR” and old counts remain truthful to that record, not current task state. |
| [V2 README](review/womenswear-v2/README.md), [QA](review/womenswear-v2/QA.md), [STORYBOARDS](review/womenswear-v2/STORYBOARDS.md), other manifests/screens/films | REVIEW EVIDENCE; reviewed 49-look stage at `17b119f…`, superseded by ten-slot V2.1 for current content. |
| [V2.1 README](review/womenswear-v21/README.md), [QA](review/womenswear-v21/QA.md), [STORYBOARDS](review/womenswear-v21/STORYBOARDS.md) | REVIEW EVIDENCE; latest merged photographic design at `34c0286…`. Original “candidate/no PR” wording is dated, not current merge status. |
| [V2.1 REPLACEMENT](review/womenswear-v21/REPLACEMENT.md), [ATTRIBUTION](review/womenswear-v21/ATTRIBUTION.md), [RECOVERY](review/womenswear-v21/RECOVERY.md) | REVIEW EVIDENCE; factual handoff/provenance/recovery at that commit. Maintained handoff now lives outside the immutable review folder. |
| V2.1 SLOTS.tsv/json, RESULTS.json, FOCUS.json, FILES.txt and media | REVIEW EVIDENCE; exact historical mapping/test outputs. FILES.txt is a delta against reviewed V2, not cumulative main-to-feature diff. Do not update past counts/results in place. |
| III / IV / V studies on retained `review/rtw-art-direction-*` branches | EXPERIMENTAL / HISTORICAL REVIEW EVIDENCE; no production authority, no corresponding garment-development story. Do not copy their technical examples to public references. |

## Remote branch and PR reconciliation

GitHub verified PR #42 merged 19 October 2026 at `a36ae62…`; #41 merged
18 October at `dfc2f3d…`; #40 merged 6 October at `e979311…`; #39 design environment
merged at `fd5d1b3…`; #38 trust foundation at `66418f4…`. Merge chronology is not
a list of enduring artistic approvals. No open PRs were returned before this
new documentation PR was prepared.

The remote branch inventory retained implementation and research history,
including `feat/womenswear-cinematic-experience-v2` (`34c0286…`, merged),
`feat/rtw-cinematic-production-integration` (`4bea355…`, merged),
`feat/rtw-cinematic-prototype` (`22bc6a1…`, historical),
`review/rtw-art-direction-iii-studies` (`2c346c8…`), IV (`7be2db9…`),
V-final (`88dce68…`) and V-recovery (`320b537…`). Old `claude/*`, `codex/*`,
`backup/*`, other `feat/*`, `release/*` and documentation branches also remain.
A separately named uppercase `Main` exists; **lowercase `main` is the baseline**.
Do not merge, delete or infer active approval from a retained branch's name.
Only `docs/aberbach-current-vision-roadmap` is written by this task.
