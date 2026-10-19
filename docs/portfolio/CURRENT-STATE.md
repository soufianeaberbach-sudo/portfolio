# ABERBACH — current state

**ACTIVE · verified 19 October 2026 (UTC).** Start here for substantial Portfolio
work. This snapshot must be refreshed when main, content or verified production
changes; it is not a perpetual deployment certificate.

## Authority and reading order

1. Latest explicit user instructions.
2. Latest explicitly approved creative and functional decisions.
3. Current verified implementation, for facts about existing behavior.
4. Current maintained project documentation.
5. [AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md) and applicable development rules.
6. Historical documents, for background only.
7. AI interpretation and suggestions.

Read the current task → this file → relevant [creative direction](CREATIVE-DIRECTION.md)
→ relevant [roadmap](PORTFOLIO-ROADMAP.md) workstream → relevant source. A merged
experiment is not automatically creatively approved; approval is not deployment.
Rules still govern execution unless the current authorized task changes them.

## Repository and production are separate

| State | Verified evidence |
| --- | --- |
| IMPLEMENTED IN MAIN | `a36ae62af385641f2c4d92c07bcd851d10ee24d7`, merge of [PR #42](https://github.com/soufianeaberbach-sudo/portfolio/pull/42) at 2026-10-19 15:41:30 UTC. Its tree matches feature head below. |
| Latest Womenswear V2.1 review | `feat/womenswear-cinematic-experience-v2` at `34c0286978de846298dbb2a4340979dd4b8887a6`; independently reviewed per owner instructions, now merged, **not pending merge**. [Immutable review](https://github.com/soufianeaberbach-sudo/portfolio/tree/34c0286978de846298dbb2a4340979dd4b8887a6/docs/portfolio/review/womenswear-v21). |
| Active documentation work | `docs/aberbach-current-vision-roadmap`, based on the main SHA above; documentation reconciliation awaiting review. No application changes authorized by this task. |
| Other open feature PRs | GitHub search returned none at the initial 19 October check. Retained branches are not an active queue or authorization. See [inventory](DOCUMENTATION-INVENTORY.md). |
| VERIFIED IN PRODUCTION, limited observation | Read-only apex GETs returned nine public pages; Portfolio HTML contained five ten-entry archives and 58 reader articles. This is consistent with V2.1, **not proof of an exact deployed SHA or tested live interactions**. [Dated observations](PUBLIC-OBSERVATIONS-2026-10-19.md). |
| External services | Exact deployment version, dashboard settings, storage/email delivery and search account activation remain unverified. The [3 October audit](../PRODUCTION-STATE.md) remains dated evidence. |

The V2.1 [QA report](review/womenswear-v21/QA.md) records 4,682 assertions across
14 suites, four additional focus-stress cases and a build. Those are historical
executed results, not tests rerun by this documentation task or an assertion that
current GitHub Actions passed. PR #42's CI run was still queued when checked.

## Identity and protected language

**Fashion Designer · Industrial Patternmaker · Technical Product Developer.**
**BETWEEN INSTINCT & CONSTRUCTION.** Premium B2B fashion editorial; the garment
and professional intelligence should outlast the memory of the interface.

Established Archivo / Inter / JetBrains Mono; site paper and ink, bone chapter
covers, white Womenswear interiors and restrained chapter accents. Actual token
values and their scope are in [creative direction](CREATIVE-DIRECTION.md).
Do not invent a new palette, font system or global animation language.

Protect Home, Portfolio opening, chapter covers, Menswear, Development, Tech
Packs, Contact, navigation, source photographs and backend/hosting unless the
specific user task authorizes changes there. Protection is not a claim that all
those areas are finished or creatively approved forever.

## Implemented Portfolio

Opening → Womenswear → Menswear → **Development** (Pattern Development content)
→ Tech Packs → ending. `Development` deliberately retains `#3d-simulation`.
The continuous outer cover journey opens chapter layers; it is not one forced
scroll through every chapter's contents. No large intermediate chapter index.
A compact chapter control and continuity links supply orientation.

Astro static pages; GSAP/ScrollTrigger, CSS and measured WAAPI photographic
continuity. `portfolio.astro` owns history, layers, Escape, focus and scroll locks.
Womenswear uses `WomenswearExhibition`, `FinalPhoto`, `FinalPhotoReader`,
`womenswear-exhibition.ts`, `womenswear-reader.ts`, `garment-match-cut.ts`,
`garment-photo.ts` and isolated `womenswear-cinematic.css`. The old RTW-only
components are historical, not files to restore. [Full navigation map](SITE-MAP-AND-NAVIGATION.md).

## Womenswear content contract

- Five worlds: `rtw`, `activewear`, `streetwear`, `evening` (Occasion), `swimwear` (Swim).
- Exactly ten displayed unique looks per world: **50**. All **58** current/historical
  references remain routable. Eight new Streetwear and one Swim photo supplement
  the intact original 49-reference pool. Excluded looks retain their IDs/URLs.
- `portfolio.ts` holds historical content, `womenswear-collection.ts` the explicit
  ten-slot edit and photographic overrides, `womenswear-references.json` the new
  sources/credits. `final-photography.ts` adapts existing Subject/FinalViews.
- Photography-only. Exhibition uses front/primary; no automatic Back, Side or
  Editorial turn. Readers expose only supplied genuine views, including complete
  originals and Look Closer. A two-angle composite is one look, not two.
- All current Womenswear photographs are temporary references, not verified
  owner projects. Existing verified project lists are empty. New stock credits
  do not establish authorship; legacy provenance remains unknown where absent.
- Sketch / Pattern / Flat / CLO / fit-development stories in Womenswear are
  **POSTPONED**, despite types and a DEV-only story lab still existing. Separate
  Pattern Development and Tech Packs chapters remain in scope as independent chapters.

Use the [photo handoff](PHOTO-CONTENT-HANDOFF.md), [50-slot manifest](review/womenswear-v21/SLOTS.tsv)
and [latest storyboards](review/womenswear-v21/STORYBOARDS.md); do not resurrect
RTW I–V demos or earlier hero/selected/supporting schemes as current direction.

## Remaining work and next task

Next recommended task: **read-only release verification and physical iPhone
Safari review of merged V2.1**, recording what version can actually be identified
and any safe-area, touch, focus or frame-pacing defects. Do not reopen PR #42 or
merge it again. No deployment or production configuration change is authorized
by this recommendation.

Owner photography/provenance, hardware performance, backend end-to-end readiness,
HTTPS redirect behavior, www reachability and search-account status remain gaps.
Menswear has its older four-category deck, Development five supplied recordings,
and Tech Packs five explicitly stamped demo PDFs; none has received Womenswear
V2.1's treatment by implication. Content and creative approvals must precede their
own future work. [Prioritized roadmap](PORTFOLIO-ROADMAP.md).

## Maintained index

[Creative direction](CREATIVE-DIRECTION.md) · [Roadmap](PORTFOLIO-ROADMAP.md) ·
[Site map](SITE-MAP-AND-NAVIGATION.md) · [Decision log](DESIGN-DECISIONS.md) ·
[Photo handoff](PHOTO-CONTENT-HANDOFF.md) · [Documentation inventory](DOCUMENTATION-INVENTORY.md) ·
[Reconciliation / validation](DOCUMENTATION-RECONCILIATION.md) ·
[Public observations](PUBLIC-OBSERVATIONS-2026-10-19.md).
