# Expertise and Process — final creative reset

Based on merged main `fe5c373a2fc1a3c64ef9580c77f8ec5d36ae6bc1`.
Four new Expertise images and five new Process images replace every image from
the previous `/expertise-studio/` and `/process-studio/` active mappings.
The site structure, copy, typography, stage behavior and responsive frames remain.

**The previous images were not used as visual references.** All twelve new
candidate generations used text-only prompts. Four final Expertise and five
final Process images were selected; three candidates were discarded/replaced.

[Shot plans, complete prompts, final selection, rejected natives and hashes](../../../../assets/source/studio-reset-2026-10-24/README.md).

## One scene per topic

| Page / actual subsection | Final subject and action |
| --- | --- |
| Expertise / Design intent | One length of wool crepe supported by hand to assess drape |
| Expertise / Fit system | Side-waist ease checked in an unfinished cotton bodice toile |
| Expertise / Technical translation | One hanging paper sleeve pattern reviewed at its wrist edge |
| Expertise / Production control | Enclosed seam finish checked inside a finished navy shirt |
| Process / Brief / Intent lock | Two colleagues discuss one finished reference shirt |
| Process / Technical build | One sleeve-cap curve drafted in pencil on paper |
| Process / Fit / Validation | Upper-back ease checked in a live shirt-toile fitting |
| Process / Size / Specification lock | One finished shirt chest measurement checked with a flat tape |
| Process / Pre-production / Handoff | One finished reference shirt passed between colleagues |

No scene combines patterns, garments, paperwork, tools and a mannequin into a
symbolic tableau. Unsewn yardage, paper drafts, cotton prototypes and finished
navy garments remain distinct. The only measuring tool is the flat tape in
Process 04. Its consecutive 0–54cm scale, even divisions, physical contact and
alignment with the garment side edges were inspected at native resolution.
There are no rulers, fake technical sheets, garment annotations or graphic overlays.

## Source review, browser critique and refinement

- **Technical logic:** plain cotton toiles have real seams and raw unfinished
  edges. Finished navy garments have normal collars, plackets and clean edges.
  Paper remains physically separate from sewn cloth. Hands were checked at full
  size for plausible grip, finger count, joints and contact with the subject.
- **Rejected finish:** the first Production-control candidate had unconvincing
  fringed buttonhole stitching. It was excluded before integration and replaced
  with a simpler enclosed-seam inspection, inspected again at full size.
- **Sequence critique:** the first browser review showed a shirt reference
  switching to a skirt fitting and trouser measurement. Those two otherwise
  plausible candidates were archived and freshly generated as shirt development
  steps. The final five-step sequence follows reference → sleeve draft → shirt
  toile fitting → chest measurement → reference handoff. No rejected candidate
  was supplied as a reference for its replacement.
- **Hierarchy and composition:** the action is immediately visible in each
  image. Expertise's original large desktop stage remains beside the question;
  Process's original 3:2 frames retain a consistent scale within the decision
  spine. The seam-inspection focal point is shifted to 60% horizontally so its
  hand and seam remain readable in the square phone crop.
- **Tone and integration:** white tables/walls remain clean and neutral. Warm
  paper and unbleached cotton are actual subjects rather than a beige color cast
  across the environment. Navy fabric creates clear separation from the white
  surroundings. No new border, shadow, frame decoration or UI styling was added.
- **Typography and rhythm:** all subsection questions, supporting copy, type and
  spacing remain unchanged. Image changes carry the new direction; the existing
  sticky-stage / inline-photo grammar and five-step decision spine still work.
- **Mobile and interaction:** all four Expertise square crops retain their
  action, including the pattern hook and paper contour, the fitter's pinch and
  the inspected seam. Process retains full 3:2 scenes. No stretch or horizontal
  overflow was seen. Native index anchors, keyboard access, stage selection,
  reduced-motion access and decoded responsive delivery were tested.

[Desktop sequence](browser/REVIEW-1440.jpg) ·
[Phone sequence](browser/REVIEW-390.jpg) ·
[Other responsive sizes](browser/REVIEW-RESPONSIVE.jpg).
All 26 final viewport screenshots are retained in `browser/`. The two superseded
Process screenshots are saved separately under `first-pass/`, never as final QA.

## Executed verification

Built-preview Chromium review, using the repository's committed production-font
fixtures, at **1440×900, 1366×768, 1024×768, 768×1024, 430×932 and 390×844**.

| Check | Final result |
| --- | --- |
| Production build | Passed, 11 pages |
| Responsive imagery, decoded delivery, stage selection, anchors and reduced motion | 420 passed |
| Existing site smoke and navigation suite | 303 passed, 0 failed |
| Protected source/artwork and correction-evidence integrity | 4,849 passed; 1,733 unique evidence files SHA256 verified |
| Native and delivery asset audit | 9 natives and 18 renditions SHA256/geometry verified |
| Old active image URLs | Absent from both built pages |
| Existing portfolio source/data/style spot checks | Byte-identical to merged main |

[Browser results](browser/RESULTS.json) · [Logs](logs/) ·
[Asset audit](ASSET-AUDIT.json) · [Protected sources](PROTECTED-SOURCES.json).

The existing preservation guard keeps its full source/artwork/evidence graph;
its exact-hash fixture is updated only for the two explicitly authorized image
component/page files. Its Womenswear hash stays unchanged. No wildcard or
photographic-asset exemptions are added.

All nine requested replacements are integrated. The imagery is generated
photographic illustration, not claimed evidence of actual clients, physical
samples or the owner's studio. This is local Chromium verification; no production
deployment or physical-device Safari testing was performed.
