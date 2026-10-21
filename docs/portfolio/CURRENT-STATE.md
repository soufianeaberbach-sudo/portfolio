# ABERBACH — current state

**ACTIVE · repository/Portfolio source verified 21 October 2026 (UTC).** Start here for substantial Portfolio
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
| IMPLEMENTED IN MAIN | `a4b0aba1591ac043b11ca9b75b6079b0ed27a9be`, merge of [PR #44](https://github.com/soufianeaberbach-sudo/portfolio/pull/44); contains Womenswear V2.1 and the four-world Menswear implementation. This is GitHub source verification, not deployment verification. |
| Latest Womenswear V2.1 review | `feat/womenswear-cinematic-experience-v2` at `34c0286978de846298dbb2a4340979dd4b8887a6`; independently reviewed per owner instructions, now merged, **not pending merge**. [Immutable review](https://github.com/soufianeaberbach-sudo/portfolio/tree/34c0286978de846298dbb2a4340979dd4b8887a6/docs/portfolio/review/womenswear-v21). |
| Active refinement candidate | `refine/portfolio-fashion-categories-photo-finalization`, based on the main SHA above. The corrective candidate replaces the rejected five-world edit with four public Womenswear worlds and continuous Menswear Explore. Three-panel masters and valid reader/motion corrections are retained; see [corrective review](review/fashion-correction/README.md). Not merged/deployed. |
| Other open feature PRs | GitHub returned none at the initial 21 October check. Retained branches are not an active queue or authorization. See [inventory](DOCUMENTATION-INVENTORY.md). |
| VERIFIED IN PRODUCTION, limited observation dated 19 October only | Read-only apex GETs returned nine public pages; Portfolio HTML contained five ten-entry archives and 58 reader articles. This is consistent with V2.1, **not proof of an exact deployed SHA or tested live interactions**. [Dated observations](PUBLIC-OBSERVATIONS-2026-10-19.md). |
| External services | Exact deployment version, dashboard settings, storage/email delivery and search account activation remain unverified. The [3 October audit](../PRODUCTION-STATE.md) remains dated evidence. |

The V2.1 [QA report](review/womenswear-v21/QA.md) records 4,682 assertions across
14 suites, four additional focus-stress cases and a build. Those are historical
executed results, not tests rerun by the current refinement or an assertion about its CI. PR #42's
queued CI state belongs to that historical check, not the present feature.

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
`garment-photo.ts` and isolated `womenswear-cinematic.css`. Menswear uses `MenswearAct`,
`MenswearPhoto`, `MenswearReader`, `menswear-film.ts`, `menswear-reader.ts` and
`menswear-cinematic.css`: four films, ten looks each, fifty routable identities
over the intact sixteen-entry historical pool. The old RTW-only
components are historical, not files to restore. [Full navigation map](SITE-MAP-AND-NAVIGATION.md).

## Current approved content and navigation contract

**Candidate, pending merge:** four public Womenswear worlds: `casualwear`,
`activewear`, `evening` (Occasionwear), `swimwear`. Ten unique looks each = **40**.
The historical `rtw` and `streetwear` source pools remain separate and unchanged;
both category hashes resolve to Casualwear. All 58 subject URLs remain exact.
The public ten-look edit is independent of source identity; a full-reference list
provides discreet access to the eighteen excluded photographs.

Menswear: `m-streetwear`, `m-activewear`, `m-rtw` (Casualwear), `m-tailoring`;
**40 displayed / 50 routable**. The candidate renders four films in one native
scroll flow. Direct world jumps, Presentation Mode and exact reader return remain.
Explore scrolling updates orientation without creating excessive history entries.

Total candidate: **eight worlds / eighty featured / 108 routable subjects**.
Main at `a4b0aba1591ac043b11ca9b75b6079b0ed27a9be` still has five Womenswear worlds,
fifty displayed Womenswear looks and manual Menswear activation. Do not describe
the corrective branch as merged or deployed. No exact deployed SHA is verified.

All fashion images remain temporary references. No owner development evidence is
linked. Main films show Front/primary only; additional supplied views are reader
choices. Existing single, inseparable/two-up and explicit three-panel masters
remain supported. Owner three-panel source acceptance is **pending actual media**.
Sketch/Pattern/Flat/CLO stories in fashion readers remain **POSTPONED**; separate
Development and Tech Packs chapters remain intact.

Use [photo handoff](PHOTO-CONTENT-HANDOFF.md),
[current slots](review/fashion-correction/SLOTS.tsv),
[source audit](review/fashion-correction/SOURCE-INTEGRITY.json) and
[current QA](review/fashion-correction/QA.md). Earlier nine-world/90-look audits
in `review/fashion-finalization` are historical and document the rejected structure.

## Next action and limits

Review the corrective candidate's actual Portfolio motion, native continuity,
legacy-route identity audit and reader regression evidence. Owner artistic approval
remains separate from technical verification. Then physical iPhone Safari and
projector/hardware performance checks, PR approval, explicit merge authorization,
separate deployment authorization and verification. No automatic merge/deployment.

Owner photography/rights, hardware performance, backend end-to-end readiness,
HTTPS/www and search-service activation remain separate unresolved workstreams.

## Maintained index

[Creative direction](CREATIVE-DIRECTION.md) · [Roadmap](PORTFOLIO-ROADMAP.md) ·
[Site map](SITE-MAP-AND-NAVIGATION.md) · [Decision log](DESIGN-DECISIONS.md) ·
[Photo handoff](PHOTO-CONTENT-HANDOFF.md) · [Documentation inventory](DOCUMENTATION-INVENTORY.md) ·
[Reconciliation / validation](DOCUMENTATION-RECONCILIATION.md) ·
[Public observations](PUBLIC-OBSERVATIONS-2026-10-19.md).
