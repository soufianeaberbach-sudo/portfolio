# RTW IV — one look, changing representations

Exploratory review work. **Not approved for production integration.**
Based on prototype `22bc6a14` and preserved III review `2c346c8d`.

## Decision before implementation

The approved foundations are the white photographic ground, original source
windows, front/back inspection, 560ms measured entry/return, and existing reader
navigation. None of those public files is changed here. III's five page-like
compositions were rejected: isolated imagery, empty evidence rectangles,
insufficient construction relationships and no motion proof.

Three approaches were considered:

| Approach | Decision |
| --- | --- |
| Five richer editorial spreads connected by transitions | Rejected: preserves the separate-page problem. |
| Literal sketch → pattern pieces → simulated garment morph | Rejected: without real corresponding evidence, invents construction relationships. |
| One viewing space, persistent garment identity, changing representation | Chosen: continuity belongs to the object and medium; documents can be inspected without a forced scroll film. |

The selected photograph stays one DOM object. The line specimen begins at its
proportions, becomes an outline key beside an inspectable curve sheet, then gives
way to a registered volume specimen and photograph comparison. The final photo
turns to its genuine back and returns to the measured exhibition source.

## Evidence contract

There are still no verified project-linked development stages in the repository.
All final imagery here is existing `rtw-ref-01`, `woven/1` reference photography.
No authorship is asserted. The new lab media replace empty rectangles with:

- An **approximate photo-proportion contour**, not an original design sketch.
- A **neutral vector curve inspection sheet**, not a garment pattern. No
  measurements, notches, grain directions, seam allowances or assembly data.
- The contour as a **UI outline key**, not a technical flat.
- A **ruled envelope for registration testing**, not a CLO render, simulation,
  validated fit or real development result.

Every stage, inspector, review page and recording labels this distinction.
These specimens test composition, movement, resolution and inspection. They do
not prove industrial patternmaking expertise or this reference's design history.
Real corresponding evidence remains necessary for that approval.

## Stage and motion intentions

| Movement | Object / continuity |
| --- | --- |
| Exhibition → A | Reuse measured WAAPI entry. The white floor remains; typography recedes as the selected complete look becomes the subject. |
| A → B | The explicitly photo-based UI contour emerges at the garment's source coordinates, then becomes the drawing focus while the complete reference moves aside. This demonstration does not infer a genuine sketch/photo alignment. Phone gives one representation the canvas, with a direct photo/line switch. |
| B → C | The same contour becomes the outline key. The curve sheet becomes the architectural field, at uniform scale with source inspection; no fake pieces assemble into a garment. |
| C → D | The same outline key travels into the registered envelope frame; the mesh appears at that contour. No curve-sheet pieces pretend to assemble. A controlled slider compares the UI envelope with the original photograph; no simulation or fit claim. |
| D → E | The photograph takes over the frame, then the original composite source travels to the complete back. No large closing headline; the genuine garment resolves the sequence. |
| E → exhibition | Existing measured match-cut returns to the source, carrying the chosen front/back state and restoring entry position/focus. |

Transitions can be interrupted. Direct stage buttons, wheel steps and keyboard
navigation avoid a prolonged pinned journey. Reduced motion and keyboard stage
changes settle immediately. There are no perpetual animations.

## Inspection / mobile / partial evidence

The same native dialog inspects photo, line and curve sheet. Vector media retain
their geometry and resolution; uniform zoom, drag, pinch, keyboard pan, fit and
Escape are supplied. The photo uses the existing unchanged source window.

Vertical canvases show one primary representation at a time. B switches line/photo;
C switches outline/sheet. The technical sheet initially frames one column without
distorting geometry; source inspection offers the entire sheet. D compares in one
frame. Important physical garment shots remain complete. No tiny side-by-side
mobile evidence cards or vertically stacked document sections.

Lab query examples `?evidence=none`, `?evidence=design` and
`?evidence=construction` exercise omitted stages. With none, there is only photo
inspection—no empty process stages or redundant closing page. Future integration
must use `projectSubject`'s actual origin/build fields; the lab fixtures must
never populate a public Project. A real CLO screenshot remains a screenshot;
the registered comparison must only align if actual evidence permits it.

## Isolation and review

`/lab/rtw-iv/journey/` exists only in `astro dev`. The dynamic route emits no
production pages. Its script is dynamically imported only under `import.meta.env.DEV`.
All new specimen media live in `src/lab/rtw-iv`, not public assets or project data.
No public reader, exhibition, archive, infrastructure or unrelated page is edited.

Approval of a demonstration does not make its media valid project evidence.

## Published review materials

- [Eight-page desktop/mobile review PDF](review/rtw-art-direction-iv/design-studies.pdf)
- [Desktop A–E](review/rtw-art-direction-iv/desktop-studies.jpg) · [Phone A–E](review/rtw-art-direction-iv/mobile-studies.jpg)
- [Desktop browser recording](review/rtw-art-direction-iv/desktop-motion.mp4) · [Phone browser recording](review/rtw-art-direction-iv/mobile-motion.mp4)
- [Individual full-resolution frames](review/rtw-art-direction-iv/)
- [Self-contained interactive HTML](review/rtw-art-direction-iv/interactive-proof.html)
- [Exact changed-file manifest](review/rtw-art-direction-iv/FILES.txt)

**Interactive review without Cloud access:** download the HTML using GitHub's
Raw/download action, save it as `interactive-proof.html`, and open it locally.
The photograph, fonts, specimen media, styling and existing GSAP/WAAPI code are
embedded. No server, installation, network request or deployment is required.
GitHub's HTML source preview itself does not execute the proof. Alternatively,
checkout this review branch and run the existing Astro dev server, then open
`/lab/rtw-iv/journey/`.

The recordings are actual Playwright browser captures at 1440×900 and 390×844,
encoded to H.264 MP4. Only the initial 0.30s browser-loading interval is trimmed;
the exhibition, entry, every movement, source inspection, comparison, back/front
controls and return remain. They are not screenshot animations or simulated
interaction descriptions. Phone recording includes actual emulated touch input,
including a two-pointer pinch in source inspection.

## Visual critique and corrections

| Dimension | Browser finding / correction |
| --- | --- |
| Fashion hierarchy | Initial full looks had too little canvas. Increased the A/E photographic field, keeping a fixed source height and compensating transforms across material stages. Complete heads, hems and shoes remain visible. |
| Image integration | Native phone tap highlighting briefly boxed the source in blue. Removed the touch highlight while retaining keyboard focus outlines. Original photography and all published III assets are unchanged. |
| Composition | The phone curve sheet crowded its caption. Shortened its viewing field; source inspection retains the complete undistorted document. Replaced III's empty paper rectangles with explicitly identified line/curve/envelope specimens. |
| Rhythm | The same contour moves from design emphasis to construction key. Volume comparison belongs to the same viewing frame. Final resolves on the genuine back rather than another front-photo closing page. |
| Typography | Outgoing opening type overlapped incoming reader copy during entry. Retimed their handoff. Removed the oversized result headline. Phone source/action labels are larger than III's. |
| Motion | Dense decoded recording frames revealed a blank first clone paint. The local adapter retains the original for two animation frames before resuming the existing measured motion. Frozen loaded image candidates and synchronous decoding avoid clone source-selection churn. Production match-cut code is unchanged. A partial-face comparison wipe was replaced by a whole-figure registered crossfade. |
| Mobile / interaction | One primary representation occupies the vertical canvas. Direct line/photo and outline/sheet switches replace tiny simultaneous comparisons. Added source inspection to volume and fixed same-document hash navigation. No long compulsory scroll or repeated stacked document screens. |

The measured match-cut is used when a photograph is visible (including E).
If returning from an evidence-only frame, the proof retreats directly in 220ms;
it does not invent a shared element from an offscreen photograph. Both paths
restore source position, view and focus. Reduced motion and keyboard return are
immediate. Native recordings were inspected as decoded sequences, including
dense entry frames, inspection, representation handoff and return.

## Functional / isolation verification

- Browser review at **1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844**.
  Six-size raw captures remain in ignored `.qa-director/rtw-iv/`; selected review
  frames are published. No page overflow or cropped primary photo-source bounds.
- Focused lab checks cover stage navigation, keyboard entry/views, source zoom,
  Escape/focus return, interruption, complete photographic comparison, genuine
  back view, omitted stages, deep links, direct intermediate return, reduced
  motion, unchanged source position and returned view. See
  `tests/rtw-art-direction-iv.mjs`: **211 checks passed**.
- `?media=raster` tests the same neutral specimens as native-resolution PNG
  inputs; no original photography is processed. Inspection receives the full
  3000×2320 sheet rather than the phone's initial column view. Image surfaces
  preserve intrinsic aspect ratio; no automatic tracing or fake 3D viewer.
- Existing public RTW regression: **181 continuity checks passed**, including
  reference discovery, deep links, reader views and return behavior.
- `npm run build`: **11 production pages**, no `/lab/` output. The proof's
  development import is eliminated from production (an empty-chunk warning is
  expected). No proof content appears in the public Portfolio HTML.
- Downloadable HTML verified at desktop and phone sizes without network
  dependencies. All A–E controls and return work, with no browser errors.
- No new dependency, shader, WebGL scene or perpetual effect. Motion uses
  transforms/opacity, a short vector stroke reveal and the existing crop-window
  view switch. This is not a real-device performance or Safari certification.

## Limits and approval compromises

1. **These are UI specimens, not development evidence.** Real project-linked
   sketches, flats, patterns, CLO images and designer notes are still absent.
   The curve sheet cannot prove patternmaking decisions; the ruled envelope
   cannot prove simulation, drape, fit or production readiness. No genuine
   industrial-development story is claimed for the selected reference.
2. **Registration is approximate and demonstrational.** Actual assets must be
   reviewed at their real proportions and density. A genuine sketch/CLO pairing
   may only align when evidence supports that alignment; otherwise use complete
   alternating representations. No inferred seams, measurements or outcomes.
3. **Navigation is a controlled viewing space.** Approve or revise the proposed
   direct movement navigation and wheel stepping before integrating it. A proof
   is not authorization to replace the approved public reader/router.
4. **Missing evidence stays absent.** For future verified projects, derive the
   sequence from `projectSubject`'s supplied origin/build data. If only a flat
   exists, it owns the construction frame and no pattern is invented; if only a
   pattern exists, omit the flat key. If no process evidence exists, retain the
   honest photograph reader. Fit/handoff stages require actual supplied files.
5. **Browser emulation has limits.** Touch, pinch and six responsive sizes were
   exercised in Chromium; physical phones, Safari and large future 3D/PDF assets
   still require device-specific review. No heavy model viewer is assumed.

Public Portfolio integration remains **not authorized**. This branch publishes
only review materials, an isolated development proof and its focused checks.
No main merge, PR or deployment is part of this pass.
