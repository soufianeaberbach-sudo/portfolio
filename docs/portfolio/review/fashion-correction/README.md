# Four Womenswear worlds / continuous Menswear

Corrective review candidate, 21 October 2026. Continues
`refine/portfolio-fashion-categories-photo-finalization` from rejected delivery
`23ef565a9e187b0ff2bea107d4fa016f717877a6`. Main baseline remains
`a4b0aba1591ac043b11ca9b75b6079b0ed27a9be`. No merge or deployment is implied.
Owner artistic approval is still required.

The preceding delivery retained five Womenswear worlds and mandatory Menswear
film activation. Its nine-world / 90-look QA tested that implementation rather
than the requested product. The previous photographic fixes remain valuable;
[its evidence](../fashion-finalization/README.md) is retained as historical.

## Candidate contract

| Chapter | Public worlds, in order | Featured | Original routes |
| --- | --- | --- | --- |
| Womenswear | Casualwear → Activewear → Occasionwear → Swimwear | 4 × 10 = 40 | 58 |
| Menswear | Streetwear → Activewear → Casualwear → Tailoring & Outerwear | 4 × 10 = 40 | 50 |

Source identity, editorial grouping and display order are separate. Casualwear
selects five everyday looks from `rtw` and five from `streetwear`. It does not
concatenate the former films. All 108 original subject records, image dimensions,
photographic windows and source associations match the preceding fingerprint.
[80 slots](SLOTS.tsv) · [source audit and exact routes](SOURCE-INTEGRITY.json).

Both `#womenswear/rtw` and `#womenswear/streetwear` arrive in Casualwear. Their
subject URLs still open the original garments, including excluded references.
Secondary full-reference disclosures expose all 58 Womenswear and 50 Menswear
identities separately from each forty-look edit. Historical entries may share an
original photograph; the primary edits contain distinct looks. No photograph, identifier or credit is deleted.

## What changed in the films

- **Womenswear Casualwear:** cropped pink shirting establishes the everyday
  proportion; the burgundy hoodie compresses it; olive shirting restores the long
  line; black utility volume resolves the edit. One four-role progression replaces
  two previously independent worlds. Front/primary photography only.
- **Menswear Streetwear:** retain the actual architectural discovery. Replace the
  final body-crossing wipe with an open-jacket / compact-quilt comparison on a
  common floor, then leave the open volume for the final quilted silhouette.
  Portrait uses intact sequential shots because two simultaneous figures became
  too small and overlapped. The sources are independent photographs, not one shoot.
- **Menswear Activewear:** the actual kneeling pose now supplies compression on
  portrait as well as desktop. The final sequence isolates the white tracksuit,
  then a directional diagonal aperture reveals the authentic lifted pose. No
  human movement or garment deformation is fabricated.
- **Menswear Casualwear:** the seated plinth and carried chair establish a visible
  relationship between support and posture, with a desktop two-shot hold. Replace
  the occasion-oriented ruffled-shirt finale with the existing cream overshirt.
  The final cut is deliberately clean; superimposing unrelated bodies weakened it.
- **Menswear Tailoring:** the dark suit and ivory suit form a measured desktop
  negative/positive pairing before the ivory portrait takes the field. Portrait
  uses a clean light reversal; the first attempted shutter fused two bodies and
  was rejected during self-review. The overcoat remains the final street context.

This is an authored editorial refinement, not a claim that stock photographs
have become a real continuous fashion shoot. The room transition remains the
strongest spatial idea. Other worlds still depend on cuts and changing density;
the owner must judge their actual motion, not these explanations.

## Browsing and presenting

Menswear has **one** native scroll container, four films and four archives in
normal flow. Active-world state follows the visible section. Native wheel/touch
passes world boundaries without Next World. A continued gesture after Tailoring's
archive reaches Pattern Development; the explicit handoff link also remains.

Worlds menu jumps straight to a destination. Passive scroll orientation replaces
the current category hash through the Portfolio router; explicit navigation adds
history normally. Readers preserve the actual photographic occurrence. Presentation
Mode holds composed frames, crosses world boundaries with Next/Previous, supports
remote keys and optional fullscreen, then resumes Explore at the current position.

Three-panel photography is preserved: one 5400×2700 master, exact thirds, explicitly
configured Editorial or Detail third view, Complete Original, alpha and white
backgrounds. Films stay on Front. Real owner masters remain unavailable; geometry
fixtures are clearly test-only and excluded from the production build. Existing
single/two-up and inseparable exceptions remain supported.

## Review locally

```sh
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4431
```

Open `http://127.0.0.1:4431/portfolio/#womenswear` and
`http://127.0.0.1:4431/portfolio/#menswear`. Scroll naturally through all worlds.
Use Worlds to jump straight to Tailoring, then return to Streetwear and resume
scrolling. Try Present, arrows/Page Up/Page Down/Space/Home/End while the stage
has focus; controls and reader focus retain their own keyboard behavior. Home/End seek directly; archive arrows retain horizontal exploration without
advancing the enclosing film. Escape
unwinds inspection, reader, menus and Presentation Mode before the chapter.

Test `#womenswear/rtw/rtw-ref-01` and
`#womenswear/streetwear/streetwear-ref-02`. Inspect Front/Back where supplied,
Complete Original and Look Closer; close to the actual source occurrence. View
all ten archive links in every world. GitHub source pages are **not hosted previews**.
There is no new deployment or hosted preview in this delivery.

[Executed QA and acceptance table](QA.md) · [exact changed files](FILES.txt).

For iPhone review on the same local network, serve the candidate with
`npm run preview -- --host 0.0.0.0 --port 4431` and open
`http://<computer-LAN-IP>:4431/portfolio/`. This is a local test, not a public
preview or production deployment. Physical Safari and projector/remote hardware
verification remain owner review steps.

## Browser evidence index

The recordings below are actual continuous browser captures. The native-flow
clips use real wheel input on desktop and touch events through Chromium's input
pipeline on phone; they do not click intermediate category links. The transition
studies use the actual scene controls, followed by inspection, interruption and
reduced-motion examples. Before clips run the untouched `23ef565` baseline in a
detached local worktree. No recording was reconstructed from still images.

| Evidence | Desktop | Phone |
| --- | --- | --- |
| Womenswear four-world natural flow | [Wheel recording](womenswear-wheel-desktop.mp4) | [Touch recording](womenswear-touch-mobile.mp4) |
| Menswear four-world natural flow | [Wheel recording](menswear-wheel-desktop.mp4) | [Touch recording](menswear-touch-mobile.mp4) |
| Before: four selected Menswear transitions | [23ef565 recording](menswear-before-desktop.mp4) | [23ef565 recording](menswear-before-mobile.mp4) |
| After: transitions, inspection and reduced motion | [Corrected recording](menswear-after-desktop.mp4) | [Corrected recording](menswear-after-mobile.mp4) |
| Matched before/after compositions | [Comparison](before-after-motion-1440.jpg) | [Comparison](before-after-motion-390.jpg) |
| Actual decoded transition frames | [Dense frame review](dense-motion-1440.jpg) | [Dense frame review](dense-motion-390.jpg) |
| Front / Back / Complete Original | [Native reader frames](screens/) | [Reader comparison](reader-390.jpg) |
| Three-panel geometry only — not garment evidence | [Actual component fixture](three-panel-geometry-1440.jpg) | [Actual component fixture](three-panel-geometry-390.jpg) |

[Frame locations/method](MOTION-FRAMES.json) · [1920×1080 presentation overview](presentation-1920.jpg)
· [all native 1920 frames](presentation/) · [full-resolution primary shots](screens/).
Dense panels are decoded from the actual MP4s and located against captured resting
frames; wall-clock timing alone is not used to label a world. Static contacts are
for inspection, not substitutes for watching the videos.

| Viewport | Complete compositions | Archives | Readers | Return | Handoff |
| --- | --- | --- | --- | --- | --- |
|1440×900|[Shots](compositions-1440.jpg)|[Archive](archive-1440.jpg)|[Reader](reader-1440.jpg)|[Return](return-1440.jpg)|[Handoff](handoff-1440.jpg)|
|1366×768|[Shots](compositions-1366.jpg)|[Archive](archive-1366.jpg)|[Reader](reader-1366.jpg)|[Return](return-1366.jpg)|[Handoff](handoff-1366.jpg)|
|1024×768|[Shots](compositions-1024.jpg)|[Archive](archive-1024.jpg)|[Reader](reader-1024.jpg)|[Return](return-1024.jpg)|[Handoff](handoff-1024.jpg)|
|768×1024|[Shots](compositions-768.jpg)|[Archive](archive-768.jpg)|[Reader](reader-768.jpg)|[Return](return-768.jpg)|[Handoff](handoff-768.jpg)|
|430×932|[Shots](compositions-430.jpg)|[Archive](archive-430.jpg)|[Reader](reader-430.jpg)|[Return](return-430.jpg)|[Handoff](handoff-430.jpg)|
|390×844|[Shots](compositions-390.jpg)|[Archive](archive-390.jpg)|[Reader](reader-390.jpg)|[Return](return-390.jpg)|[Handoff](handoff-390.jpg)|

## Rollback

No database/content migration or original-file deletion is involved. Before merge,
stop using this branch to return to main. If a separately authorized merge later
needs rollback, revert that merge through the normal review process; do not reset
or force-push production/history. Reverting restores the earlier five-world/manual
film implementation, while the original photographic files/URLs remain available.
