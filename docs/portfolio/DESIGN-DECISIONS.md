# Design decisions

**ACTIVE · reconciled 19 October 2026.** This is a record of decisions, not a
claim that every proposed detail has been approved. Current owner instructions
and source facts take precedence as set out in [CURRENT-STATE](CURRENT-STATE.md).
“Approved” below refers to explicit owner direction in the corresponding brief;
merge history is separately identified as implementation evidence.

| Decision / scope | Current status | Reason and superseded approach | Evidence |
| --- | --- | --- | --- |
| BETWEEN INSTINCT & CONSTRUCTION; Fashion Designer / Industrial Patternmaker / Technical Product Developer | APPROVED DESIGN DECISION, site-wide | Fashion instinct and technical intelligence form one professional practice, not a generic freelancer/services grid. | Current owner reconciliation brief; existing masthead and source identity. |
| Continuous outer editorial chapter journey | APPROVED DESIGN DECISION; IMPLEMENTED IN MAIN | Opening → Womenswear → Menswear → Development → Tech Packs → ending. Chapters retain deliberate entrances; not a mandatory scroll through all their contents. Supersedes separate large Living Chapter Index/cutting-table exploration. | Current brief; `chapters` in portfolio.ts, portfolio.astro; [map](SITE-MAP-AND-NAVIGATION.md). |
| Chapter identities remain independent | APPROVED DESIGN DECISION | Womenswear does not dictate Menswear, Development or Tech Packs choreography. Shared typography/access do not require identical presentation. | Womenswear V2 and current owner brief; source cover system. |
| Bone opening/covers, white Womenswear interiors | APPROVED DESIGN DECISION; IMPLEMENTED IN MAIN | Protect opening identity and integrate studio photography; intentional source framing is preferable to destructive image editing. | Owner RTW/Womenswear briefs; current CSS; [creative direction](CREATIVE-DIRECTION.md). |
| Full garments in primary resting frames | APPROVED DESIGN DECISION | Primary cropped bodies concealed the design in earlier cinematic studies. Specific detail inspection remains optional. | RTW Art Direction III onward, reaffirmed V2.1; final QA source audit. |
| Five photography-led Womenswear worlds | APPROVED DESIGN DECISION; IMPLEMENTED IN MAIN | Fluidity / precision / attitude / ceremony / clarity, one reader/access system. Supersedes RTW-only cinema plus four legacy editorial category systems. | Owner V2 brief; [PR #42](https://github.com/soufianeaberbach-sudo/portfolio/pull/42); [storyboards](review/womenswear-v21/STORYBOARDS.md). |
| Exactly ten displayed references per category, 50 total | APPROVED DESIGN DECISION; IMPLEMENTED IN MAIN | Stable explicit presentation slots; not a destructive historical-pool edit or counting angles as looks. Supersedes 17/10/2/11/9 visible counts (49 total). | Owner V2.1 brief; collectionSlots; [SLOTS.tsv](review/womenswear-v21/SLOTS.tsv). |
| Preserve 58 reference routes and source identity | APPROVED DESIGN DECISION; IMPLEMENTED IN MAIN | Original 49 plus eight Streetwear/one Swim. Excluded references retain old URLs and sources. No array reorder to renumber IDs. | Owner V2.1 continuation; historical-return tests and slot manifest. |
| Front/primary-only cinematic exhibition | APPROVED DESIGN DECISION; IMPLEMENTED IN MAIN | Additional viewpoints require deliberate visitor action. Supersedes automatic front→back travel/turn in RTW prototypes and PR #41. Inseparable sources remain whole. | Owner V2 explicit correction; final-photography and direction adapter; QA. |
| Genuine optional multi-view reader | APPROVED DESIGN DECISION; IMPLEMENTED IN MAIN | Composite or separate Front/Back, optional Side/Editorial/Detail, Complete Original and Look Closer; missing media produces no control. No guessed angles. | Owner V2/V2.1 briefs; Subject.views / FinalViews; [photo handoff](PHOTO-CONTENT-HANDOFF.md). |
| Photography-only Womenswear now | APPROVED DESIGN DECISION | Technical development inside Womenswear is POSTPONED. III–V studies remain historical/experimental; do not attach independent sketch/pattern/digital samples to a reference dress. | Owner V2 content-strategy change, reaffirmed V2.1 and current brief. |
| Pattern Development and Tech Packs remain separate chapters | APPROVED DESIGN DECISION; chapter interfaces IMPLEMENTED IN MAIN | Photography-only Womenswear does not cancel the professional engineering chapters. Demo PDFs are not genuine client packs; recordings are not linked garment evidence. | Current brief; SimulationWorld / TechPackWorld and supplied data. |
| Replace temporary photographs through metadata | APPROVED DESIGN DECISION; slot adapter IMPLEMENTED IN MAIN, actual replacement PLANNED | Owner media is pending. Credits/geometry must be reverified; changing copy cannot make references original work. | Owner V2.1 brief; [replacement evidence](review/womenswear-v21/REPLACEMENT.md), maintained handoff. |
| Single Portfolio router and exact occurrence return | APPROVED FUNCTIONAL DECISION; IMPLEMENTED IN MAIN | Browser history, Escape, focus and locks stay centrally owned; camera/archive occurrence matters. No independent #A–E router. | Production integration and V2 briefs; portfolio.astro; continuity/historical-return QA. |
| Visual approval is separate from tests, merge and release | APPROVED PROCESS DECISION | Green assertions are not creative approval; merged source is not proof of an exact deployed release. | Repeated explicit owner approval checkpoints and current reconciliation brief. |

## Superseded references, not alternate specifications

- [Reference Harvest 01](REFERENCE-HARVEST-01.md): historical opening/index research,
  old branch recommendation and chapter order. Do not reimplement its next action.
- [RTW integration report](RTW-PRODUCTION-INTEGRATION.md): PR #41 stage. Its source
  turn and 17-look RTW-only architecture were replaced by V2/V2.1. Useful historical
  reliability evidence remains in its review folder.
- PR #40 white-editorial implementation: merged historically, later rejected by
  owner; implementation does not imply enduring creative approval.
- RTW Art Direction III / IV / V branches: isolated review demonstrations. V's
  real third-party specimens demonstrated media handling, not the champagne
  slip's development history. No production authorization follows from them.
- Older creative direction's open list of WebGL/morph/index possibilities is
  not approved work. Pattern/Tech Packs future concepts still require real
  evidence and a specific new brief.

No approval is asserted for a speculative Menswear redesign, new pattern viewer,
locale rollout, analytics implementation or infrastructure activation. These
remain separately scoped decisions in the [roadmap](PORTFOLIO-ROADMAP.md).
