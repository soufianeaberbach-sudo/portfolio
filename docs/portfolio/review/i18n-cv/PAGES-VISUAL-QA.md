# Page typography and composition review

Reviewed actual Chromium renders of the current shared pages with committed
Archivo, Inter and JetBrains Mono font fixtures. These captures came from the
built preview on port 4458; `reducedMotion: reduce` makes the complete composition
visible. Images were decoded before final full-page screenshots so lazy-loading
is not mistaken for absent photography. Final release checks are recorded in the
main QA report; this is the page-specific visual critique.

## Captured evidence and findings

| Page / state | Rendered inspection | Concrete visual finding |
| --- | --- | --- |
| [French Experience, 390](screenshots/pages/fr-experience-390.png) | Full page, current-language PDF CTA, six positions, synthesis and spoken languages | Four-line opening reads naturally; portrait keeps its original proportions. The CV action sits quietly between the senior-role summary and career measure. Earlier roles remain subordinate to the current senior role. No overlapping text or clipped job titles. |
| [Spanish Experience, 390](screenshots/pages/es-experience-390.png) | Same complete journey | Longer current title wraps across three clear lines. All six periods remain visible; Árabe/Francés/Inglés appear as the actual working languages. “Descargar CV — Español” fits in the existing intro column. |
| [French Experience, 1440](screenshots/pages/fr-experience-1440.png) | Full desktop page | The headline/portrait balance and geometric career grid remain intact. French headings occupy their existing column without colliding with perspective text. Download action has the intended small editorial weight. |
| [Spanish Experience, 1440](screenshots/pages/es-experience-1440.png) | Full desktop page | The current senior fashion role stays strongest in the narrative. All six periods, tools and working languages remain aligned. The locale-matched CV action does not create a new large section. |
| [French Contact, 390](screenshots/pages/fr-contact-390.png) | Full page including upload controls, references and FAQ | The intro ends before the first form field. Company name, five stage choices, upload surface and fallback link stay inside the viewport. Existing workspace image and captions retain their intended separation. |
| [Spanish Contact, 390](screenshots/pages/es-contact-390.png) | Same complete form journey | Longer Spanish labels remain legible. The upload input stays inside its fieldset, stage labels fit and the form does not drift under the fixed header. Reference statements and procurement facts have clear spacing. |

Additional images inspected in `.qa-director/i18n-pages/` (kept outside the Git
review evidence to avoid unnecessary duplicate renders): FR/ES Home, Expertise
and Process at 390; English Contact at 390. The five current Process illustrations
are present, and no technical UI is drawn over them. Expertise's four illustrations
remain cleanly separated from their technical vocabulary. FR/ES headings, accents,
line breaks and body copy were examined directly in the rendered screenshots.

## Refinement

The initial full-page Process screenshots left off-screen lazy photographs
unloaded. That was a capture defect: current paths and assets existed. The final
capture script explicitly decodes the page images, and the corrected screenshots
show all five current illustrations.

The Spanish Home headline was refined from literal “error caro / costura” to
“El error más caro ocurre antes de coser”. The initially refined word
“confeccionar” exceeded the 390px display column; the final shorter construction
preserves the meaning and existing type size. The rotating production-role
label was expanded to “técnico de seguimiento de producción”, matching its source
meaning and the existing complete role sentence. No English content was changed.

A separate 390px probe inserted every rotating role in EN, FR and ES: the original
21 role strings all had zero page overflow and no clipping. The refined Spanish
production role receives the same check in final release verification.

## Functional boundaries

Navigation/language switching, all six widths, Contact contract tests, final
localized routes, CV files, Portfolio readers/zoom/touch and full CI checks belong
to the release QA report. Physical iPhone/Android hardware was not available in
this environment. One additional ES desktop Expertise full-page screenshot hit
a 30-second Playwright capture timeout; the ES mobile composition was captured
and inspected successfully, and this timeout is not counted as a passing capture.
