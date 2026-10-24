# Studio imagery — 24 October 2026

Nine selected images newly generated with the OpenAI native image tool, with
no current Expertise or Process image supplied as a reference. These are
editorial illustrations of professional practice, not photographs documenting
Soufiane's studio, a client project, manufactured samples or actual production.

`MANIFEST.json` records retained native dimensions, hashes and all 18 responsive
delivery files. Expertise natives are 1448×1086; Process natives are 1536×1024.
`scripts/prepare-studio-imagery.py` reproduces the delivery files. No native
resolution claim is made for the larger Womenswear review exports.

| Page / actual topic | Selected subject | Native |
| --- | --- | --- |
| Expertise / Design intent | Jacket silhouette, shoulder volume and twill drape | `expertise/01-design-intent.png` |
| Expertise / Fit system | Bodice toile, balance stitching and measurement | `expertise/02-fit-system.png` |
| Expertise / Technical translation | Sleeve geometry and opened cuff construction | `expertise/03-technical-translation.png` |
| Expertise / Production control | Repeated cuffs, seam finish and inspection gauge | `expertise/04-production-control.png` |
| Process / Brief / Intent lock | Product sketch and material selection | `process/01-brief.png` |
| Process / Technical build | Body, sleeve and cuff patterns with sewn sleeve | `process/02-technical-build.png` |
| Process / Fit / Validation | Overshirt toile with recorded side-seam correction | `process/03-validation.png` |
| Process / Size / Specification lock | Graded sleeves and material / trim references | `process/04-specification.png` |
| Process / Pre-production / Handoff | Finished reference, folder and matching production rail | `process/05-handoff.png` |

All original prompts are retained. The first Process 04 candidate is preserved
under `rejected/`: its body neckline/shoulder geometry was questionable. A fresh
generation with simple sleeve geometry replaced it; the rejected image is never
referenced by public code. Ten candidates were generated; nine are selected.

The attempted Womenswear 07 generative edge retouch was declined by the image
service (request `9ad20e0d-dac3-4c71-84b2-c855a8ac3478`, output moderation).
No generative workaround was attempted. The existing recovery matte/export
pipeline instead received deterministic alpha finishing with unchanged interior
RGB, reused framing transforms and a single faint neutral contact shadow.
Every previous native and presentation file remains intact.

See [integration, visual critique and executed verification](../../../docs/portfolio/review/studio-imagery-2026-10-24/README.md).
