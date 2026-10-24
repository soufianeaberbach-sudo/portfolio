# Womenswear recovery — 24 October 2026

**40 featured looks reviewed; 31 complete sets preserved; all nine unresolved looks now usable and integrated on `fix/womenswear-recovery-seamless-integration`.** Based on latest main `2c90815dda21ec6183e7e283f94935e2a49c793c`. Menswear, historical photographs, accepted generated natives and all 33 previous registry entries are unchanged. No merge or deployment.

| Recovered source | Active views | Method |
| --- | --- | --- |
| activewear-ref-09 | Front + Back | Existing two-view source, carefully segmented; ivory mesh and white footwear preserved |
| evening-ref-02 | Front + Back | Faithful V1 views recovered; RGB Front background cleaned |
| swimwear-ref-01 | Front / primary only | Two background-only image-tool edits; original garment and pose retained |
| swimwear-ref-02 | Front + Back | Faithful V1 views recovered; studio rectangles removed |
| swimwear-ref-03 | Front / primary only | Existing source segmented; garment/model pixels retained |
| swimwear-ref-04 | Front + Editorial | Faithful V1 views recovered; Editorial background cleaned |
| swimwear-ref-05 | Front only | Existing faithful V1 Front recovered |
| swimwear-ref-06 | Front / primary only | Existing source segmented; blue garment, ring and accessories retained |
| swimwear-ref-07 | Front / primary only | Existing source segmented; fine waist ties preserved |

No usable look remains unresolved. There are **31 complete three-view sets and nine partial/retouched presentations**, comprising 106 selected actual views. Fourteen optional views are still absent relative to the old 120-view ideal; none is fabricated or required for completion under this brief. Source-primary poses are not falsely described as newly generated frontal poses.

Eight new missing-view requests and four background-only retouch requests were refused. Two background edits for Swimwear 01 succeeded. [Exact returned refusals and request IDs](ATTEMPTS.json). No casting changes, garment redesigns or rejected V2 concepts were activated. The source-preserving segmentation fallback was used where retouch generation failed; it does not invent an unseen view.

## Already complete and preserved

- Casualwear, woven: `rtw-ref-02`, `rtw-ref-03`, `rtw-ref-04`, `rtw-ref-05`, `rtw-ref-15`.
- Casualwear, streetwear: `streetwear-ref-02`, `streetwear-ref-05`, `streetwear-ref-04`, `streetwear-ref-01`, `streetwear-ref-10`.
- Activewear: `activewear-ref-08`, `activewear-ref-04`, `activewear-ref-01`, `activewear-ref-07`, `activewear-ref-02`, `activewear-ref-03`, `activewear-ref-05`, `activewear-ref-06`, `activewear-ref-10`.
- Occasionwear: `evening-ref-04`, `evening-ref-11`, `evening-ref-03`, `evening-ref-01`, `evening-ref-05`, `evening-ref-06`, `evening-ref-07`, `evening-ref-08`, `evening-ref-10`.
- Swimwear: `swimwear-ref-10`, `swimwear-ref-08`, `swimwear-ref-09`.

## Integration and preservation

Each recovery has a new `ww-recovery-*` route; all 108 historical subject routes and source geometry remain unchanged. Only real optional views appear. Recovery photographs use the existing reader and cinematic system; no master or nonexistent Back is synthesized. The reader distinguishes background-retouched references from generated studies.

Original files and first-pass recovery exports remain retained. Final white exports, alpha refinements, masks, hashes and per-look receipts are versioned separately. The original production manifest retains its historical rejected candidates; `recoveryPresentation` records the active fallback. [Current progress](../womenswear-regeneration/PROGRESS.json) explicitly separates usable coverage from strict three-view completeness. The former progress record is [preserved](PRE-RECOVERY-PROGRESS.json).

[Asset audit](TECHNICAL-AUDIT.json) · [Historical source audit](SOURCE-INTEGRITY.json) · [Browser results](browser/RESULTS.json) · [31-set regression](preserved-set-regression/RESULTS.json) · [QA and visual critique](QA.md).

## Review images

[Desktop review](DESKTOP-REVIEW.jpg) · [Mobile review](MOBILE-REVIEW.jpg) · [All final screenshots](browser/) · [Before integration](comparison/before-swimwear-01.jpg).

Actual native dimensions are retained in receipts. 1800×2700 PNGs and responsive WebPs are review exports, not claims of native generated detail. Artistic owner acceptance and physical Safari testing remain separate from branch integration and browser verification.
