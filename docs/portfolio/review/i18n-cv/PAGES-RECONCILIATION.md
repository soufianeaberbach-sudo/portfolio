# Current-page localization reconciliation

Baseline: current main `6a487817cd4a585c5140547aa9b74e2b8c6dac35`.
Translation reference: unmerged PR #46 (`ccccb7f13e777ebd50eb000d40bbda64f437ee27`),
original English baseline `80ccdacb861fa63afedc5e593675e71a4f4dc42a`.
This matrix records the non-Portfolio page reconciliation. Portfolio's dynamic
copy is reconciled separately. The old branch was not merged or restored over
current components.

| Current English source | Existing FR | Existing ES | Change since PR #46 | Required update / disposition |
| --- | --- | --- | --- | --- |
| Home, current introduction, production record, programme exposure and CLO3D description | Complete page dictionary | Complete page dictionary | English copy unchanged | Reused faithful dictionaries; render same current page and assets. Localized rotating-role text, stats, video label, links and metadata. Brand names remain unchanged. |
| Experience, six factual roles, dates, verified software and working languages | Complete translated titles, month names, descriptions | Complete translated titles, month names, descriptions | English career facts unchanged | Reused translations without changing employers, dates, seniority or career narrative. Kept actual spoken Arabic; Spanish is not added as a spoken language. CV download integration handled alongside shared career source. |
| Expertise, four professional systems | Complete text, old four illustration descriptions | Complete text, old four illustration descriptions | Four studio illustrations now depict different actions; filenames and photo crops replaced after PR #46 | Preserved current illustration paths, 800/1400 renditions and focal points. Replaced all four EN alt descriptions with current verified source text and supplied matching FR/ES descriptions. No technical annotations added to photographs. |
| Process, five decision stages | Complete copy, three old neutral plates | Complete copy, three old neutral plates | Current page has five studio illustrations, new paths, current 900/1440 renditions and image geometry | Reused unchanged five-stage copy. Retained every current stage, image and intrinsic dimension; localized all five new alt descriptions. Optional stage text follows the same shared structure. |
| Contact, current direct routes, FAQs, registered-business facts | Complete dictionary | Complete dictionary | Latest main corrects sticky intro/form separation on mobile/tablet | Ported words only. Contact stylesheet remains byte-identical to current main, preserving all recent layout and spacing corrections. |
| Brief form, current /api/brief contract, validation, uploads and Turnstile | Complete display and message dictionary | Complete display and message dictionary | Current main adds file-input overflow guard, scroll margin and Safari-safe centered error focus | Retained exact current styles and focusError helper. Preserved field names, English stage values, endpoint, upload limits/encoding, spam logic and Turnstile control flow. Localized labels, hidden honeypot label, errors, mailto fallback, upload messages and success state. Worker unchanged. |
| Privacy, Working Terms and Before We Start | Complete structured sections | Complete structured sections | Current English copy unchanged | Reused translated section content through TrustSections; localized internal links with stable section IDs. Public contact email retained. No new legal assurances or claims added. |
| Contact confirmation and 404 | Complete existing dictionaries | Complete existing dictionaries | Current English copy unchanged | Shared pages render locale-specific content, metadata and return links. Backend redirect remains unchanged. |
| Material image credits, current representative-material disclosures, 43 attributions | Missing | Missing | Entire public page introduced after localization, including actual photographs and explicitly identified visualizations | Added typed EN/FR/ES dictionary for title, description, paragraphs, link labels, six image kinds, all 16 distinct modification notes, generated-artwork source names and licence descriptions. Kept original credited work titles, authors, IDs, file paths and legal licence URLs unchanged. |
| References: two personal statements and one Fiverr review | Faithful translated quotations | Faithful translated quotations | Current source unchanged | Reused translations, marked them as translated through shared UI. Names, platform and source rating remain factual; no employer endorsements introduced. |

## Editorial review

Reviewed distinctions between design, industrial patternmaking, grading, fit,
construction, simulation and production. French uses **modélisme/patronage** for
patternmaking, **gradation** for grading, **bien-aller** for garment fit,
**tombé** for drape, **aisance** for ease and **dossier technique** for a tech
pack. Spanish uses **patronaje**, **escalado**, **ajuste**, **caída**, **holgura**
and **ficha técnica**, respectively. Technical context and approved professional
seniority remain intact. Existing FR uses professional “vous”; existing ES uses
a consistent direct “tú” register for visitors.

The five Process and four Expertise alt descriptions describe the actual current
images instead of retaining the old branch's neutral plates. Material credit
notes preserve all limitations about representative images, physical approval,
size verification, fibre/Tex authentication and supplier endorsement. Original
work titles are attribution metadata and retain their original spelling.

All three website editions are left-to-right. No Arabic website dictionary,
font, route or RTL override was carried into these page templates. The word
“Arabic” and its FR/ES equivalents remain in the verified working-languages list.

## Verification boundary

This document records source comparison and editorial work, not a claim of live
deployment or a substitute for the final build, browser screenshots and complete
regression results documented by the release QA report.
