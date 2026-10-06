/* ==========================================================================
   THE STORY LAB — INTERNAL, DEVELOPMENT ONLY.

   No verified project in this repository yet carries its own sketch, flat,
   pattern, 3D state or fit. The Project = Story architecture still has to be
   designed against something with every stage in it, so this module builds
   ONE test subject that has them all — and makes it impossible to mistake for
   work:

   - It is only ever rendered by src/pages/lab/[story].astro, whose
     getStaticPaths returns nothing outside `astro dev`. A production build
     emits no lab page, and nothing in the public portfolio imports this file.
   - The finished garment is one of the act's existing REFERENCE photographs,
     exactly as the public reader already shows it. No authorship is claimed.
   - Every process stage is a NEUTRAL PLACEHOLDER PLATE: a blank sheet that
     prints, on itself, which stage it stands in for and that no evidence was
     supplied. Nothing is drawn, traced, generated or borrowed to look like a
     sketch, a pattern, a simulation or a fitting.
   - The sentences are written as INSTRUCTIONS for where the designer's own
     words go, not as words put in the designer's mouth.

   When a real project arrives with real stages, it replaces this fixture by
   being supplied as a Project — the reader does not change.
   ========================================================================== */
import type { ImageAsset, Project, ProjectRole, Subject } from './portfolio';
import { womenswear, projectSubject } from './portfolio';

/* A blank plate, at the proportion that stage really arrives in, that says
   what it is. Proportions only — no content. */
const plate = (stage: string, width: number, height: number): ImageAsset => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`
    + `<rect width="100%" height="100%" fill="#fbfaf6"/>`
    + `<rect x="0.5%" y="0.5%" width="99%" height="99%" fill="none" stroke="#d9d4c8" stroke-width="${Math.max(width, height) / 600}"/>`
    + `<text x="50%" y="48%" text-anchor="middle" font-family="ui-monospace, monospace" font-size="${Math.min(width, height) / 18}" letter-spacing="${Math.min(width, height) / 90}" fill="#8d877a">${stage.toUpperCase()}</text>`
    + `<text x="50%" y="56%" text-anchor="middle" font-family="ui-monospace, monospace" font-size="${Math.min(width, height) / 34}" fill="#b2ab9c">placeholder · no evidence supplied</text>`
    + `</svg>`;
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return {
    src,
    srcset: `${src} ${width}w`,
    width,
    height,
    alt: `Placeholder plate standing in for a ${stage.toLowerCase()}. No evidence supplied.`,
    front: 1,
    views: 1,
  };
};

/* The finished garment: the reference photograph the act already shows, used
   as it is. */
const finished = (() => {
  const rtw = womenswear.categories.find((c) => c.id === 'rtw')!;
  const reference = rtw.references.find((r) => r.image.src.includes('/woven/8-'))!;
  return reference.image;
})();

export const LAB_CATEGORY = 'rtw';

const project = (role: ProjectRole): Project => ({
  id: `story-lab-${role}`,
  gender: 'womenswear',
  marketCategory: LAB_CATEGORY,
  title: 'Story lab',
  garmentType: 'Internal fixture',
  finalGarmentImage: finished,
  final: { composite: finished },
  concept: {
    sketch: plate('Sketch', 1200, 1600),
    note: 'The designer’s own line about where the silhouette came from goes here.',
  },
  development: {
    flat: plate('Technical flat', 1600, 1200),
    pattern: plate('2D pattern', 2000, 1150),
    clo: plate('3D development', 1080, 1600),
    fit: plate('Fit', 1200, 1600),
    note: 'The designer’s own line about how the pattern carries that decision goes here.',
    iterations: [
      { image: plate('Iteration 1', 1080, 1440), note: 'What changed, in the designer’s words.' },
      { image: plate('Iteration 2', 1080, 1440) },
      { image: plate('Iteration 3', 1080, 1440) },
    ],
  },
  decision: 'The one design decision this garment turns on, in the designer’s words, goes here.',
  role,
});

/** The lab's test subject at a given presentation weight. */
export const labSubject = (role: ProjectRole): Subject => ({
  ...projectSubject(project(role), womenswear.id),
  fixture: true,
});

export const LAB_ROLES: ProjectRole[] = ['hero', 'featured', 'supporting'];
