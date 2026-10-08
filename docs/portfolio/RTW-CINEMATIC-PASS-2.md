# RTW cinematic — art-direction pass 2

Prototype for visual review, on `feat/rtw-cinematic-prototype`. Continued from
`e701d2f0e0f27168c02af3544292f3518f7e9855`; no rejected PR #40 layout was reused.

**Cut, drape and reverse.** A close view of actual cloth answers a complete
silhouette. The camera approaches a garment, discovers its construction and
reframes around the next look. The deliberate contrast is close/whole, rather
than artificially large/small people. Resting shots carry the composition.

The Portfolio opening, Womenswear cover, approved RTW threshold/approach,
reader layout, navigation and other categories remain protected. All sources
remain real reference photography: no authorship, development history or shared
collection provenance is claimed.

## Curation and shots

| Reference | Visible reason | Camera use |
| --- | --- | --- |
| 01 · champagne satin slip | Long drape, low back, gathered neckline | Threshold; reverse close/whole; neutral payoff foreground |
| 06 · rust halter mini | Short knit silhouette, cutout, real neck tie | Arrival; push into the reverse; warm closing foreground |
| 02 · pink cropped shirt / stone trousers | Defined hem and waist, broad trouser line, clean floor | Traverse midpoint, next close foreground, first payoff subject |
| 03 · stone jumpsuit | One continuous silhouette, V-neck and shaped waist | Quiet interruption; complete back and front detail |
| 05 · floral shirt jacket / rust trousers | Print and layering against the rust knit | Traverse destination and final payoff subject |

These are visual comparisons, not assertions that the garments belong to one
collection. Every one of the 17 references remains reachable in the archive and
through its existing deep link.

- **03:** satin's low back shown close and whole. Upright screens pause on one
  large complete back, with space in the direction of the model's gaze.
- **04:** satin foreground / rust silhouette on wide screens; an opaque full
  rust arrival on the vertical canvas. No miniature third person.
- **05:** three authored viewpoints: satin/rust → rust reverse/pink tailoring →
  pink waist/printed look. The established complete photograph pushes into its
  close position, then hands to a duplicate at the identical transform. The next
  full silhouette enters from the other side; no common horizontal image slide.
- **06:** monochrome jumpsuit punctuation. Wide: complete reverse and close
  V-neck/waist. Upright: one complete reverse. Removed the decorative red line.
- **07:** two connected campaign views: satin neckline/pink silhouette, then
  rust/printed silhouette. Five curated looks return across the sequence; they
  never reunite as equal cards, a staggered row, or a six-person lineup.
- **08:** native, restrained 17-reference rail; complete silhouettes, consistent
  baseline, swipe, focus and reader entry. It remains utility after the campaign.
- **12:** the archive's closing type moves from READY—TO—WEAR to ACTIVEWEAR.
  The running head follows. No repeated slip, extra splash stage or new Activewear
  content; the archive is framed so the preceding scene has left the viewport.

## Image, motion and mobile integrity

Same pure-white floor. Original studio pixels, colour, proportions and evidence
remain untouched. Source windows still travel through measured empty gaps for
front/back. Close crops are explicit editorial details, not background cutouts.
White photographic grounds blend on white inside the isolated stage; no coloured
silhouettes overlap in the reviewed resting compositions. The selected camera
sources load their existing 1400px version to retain detail at closer viewpoints.
Archive and reader image defaults remain unchanged.

Existing GSAP/ScrollTrigger and CSS sticky stage; no new library, shader or canvas.
Full arrivals enter opaque, rather than dissolving into a group. Decorative close
copies are hidden from assistive technology; full subjects and the complete
archive own access. Zoomed foreground copies do not become oversized tab targets.
The original 560ms measured WAAPI entry/return architecture and reader controls
are retained. Hidden photographs skip scroll-frame crop work; there is no
perpetual effect. Resize rebuilds the authored framing when stage dimensions change.

Phone: full reverse → full rust arrival → a tighter sequence of complete subjects
and edge details → single jumpsuit → two payoff views. Rust's front knit/cutout is
used in the narrow foreground, where the reverse arm otherwise obstructed the
next silhouette. Tablet retains the reverse tie. The existing main camera lasts
5.4 phone viewport heights, plus the archive; no tiny three-person casts.
Reduced motion retains the existing resting cast and immediate reader access.

## Critique and corrections

1. **Hierarchy / composition:** first close crops showed too much arm and dead
   central air. Reframed the torso against the viewport edge; removed the portrait
   back/arrival close copy and used a single dominant full figure there.
2. **Integration:** the beige blouse's floor patch distracted at full scale.
   Recurated the full subject to pink shirting. Original floor/shadow retouch marks
   in some archive photographs remain source limitations; no pixels were altered.
3. **Mobile anatomy:** an early rust close view crossed the trousers. Reduced
   close magnification, moved the full subject, and chose the front knit for phones.
4. **Rhythm / motion:** recorded arrivals looked translucent. Replaced visible
   dissolves with opaque entrances/exits and an exact-position close-view handoff.
   The final recording also exposed a stale enlarged re-entry transform; reset
   that subject to a full offstage frame before it returns, avoiding body overlap.
5. **Typography / ending:** a separate slip-and-small-label ending had no payoff.
   Replaced it with the archive's typographic chapter movement. Final review caught
   departing feet above the archive; reframed its resting viewport to remove them.
6. **Source resolution:** the narrow close crops initially used a smaller srcset
   image. Camera views now request the existing maximum source, without new imagery.

## Visual proof

[Original committed screenshots](review/rtw-cinematic-prototype/) remain untouched.

- [Before / after — middle](review/rtw-cinematic-pass-2/before-after-middle.jpg)
- [Before / after — payoff and ending](review/rtw-cinematic-pass-2/before-after-payoff-ending.jpg)
- [Camera beginning / midpoint / destination](review/rtw-cinematic-pass-2/camera-shots.jpg)
- [Tablet and phone compositions](review/rtw-cinematic-pass-2/vertical-shots.jpg)
- [Recorded browser sequence and match cut](review/rtw-cinematic-pass-2/sequence.mp4)
  — 14 seconds, 960×600 desktop canvas; entry and return occur at the midpoint.

Actual timeline captures reviewed at 1440×900, 768×1024 and 390×844; sanity checks
at 1024×768 and 430×932. Local full captures and recorded frame strips:
`.qa-director/rtw-pass2/`. Evidence above is a compact selection, not the full dump.

## Verification and limits

Final build: 11 routes. Smoke: **366/366**. Protected opening: **100/100**.
RTW continuity: **181/181**, including all 17 deep links, front/back, Look Closer,
touch pan, keyboard/focus, reduced motion, rapid match-cut reversal and exact
return from the revised arrival, midpoint and closing subject. Live resizing
through all five sizes and reduced-motion changes also passed.

Final five-size review: zero runtime errors, zero horizontal world overflow,
zero return-scroll difference. Isolated headless Chromium motion samples:
399 desktop / 400 phone frames; **16.7ms median and p95**, no observed long tasks.
Native video capture adds overhead and is not the performance measurement. Art direction
still requires visual approval; functional tests do not provide it. Physical
Safari/device behaviour remains unverified. Close detail is bounded by the
resolution of existing source photography; intrinsic source floor retouch marks
remain visible in some references.
