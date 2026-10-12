import type { Subject } from '../../data/portfolio';

/** This selector reads the existing model; independent lab examples never
 * become a Project's evidence. Fixtures are not verified owner history. */
export function storyContent(subject: Subject) {
  const verified = subject.verified && !subject.fixture;
  const sketch = verified ? subject.origin.filter(s => s.key === 'sketch' || s.key === 'illustration') : [];
  const construction = verified ? subject.build.filter(s => s.key === 'flat' || s.key === 'pattern') : [];
  const dimension = verified ? subject.build.filter(s => s.key === 'clo') : [];
  const refinement = verified ? subject.build.filter(s => s.key === 'fit') : [];
  const movements = ['A', ...(sketch.length ? ['B'] : []), ...(construction.length ? ['C'] : []), ...(dimension.length ? ['D'] : [])];
  if (movements.length > 1 || refinement.length) movements.push('E');
  return { mode: verified ? 'verified' : 'reference', movements, views: subject.views, sketch, construction, dimension, refinement };
}

/** Source roles for a future supplied Subject. Never falls back to demo media. */
export function storyAssets(subject: Subject) {
  const plan=storyContent(subject);
  return {
    sketch: plan.sketch[0]?.image,
    flat: plan.construction.find(s=>s.key==='flat')?.image,
    pattern: plan.construction.find(s=>s.key==='pattern')?.image,
    digital: plan.dimension[0]?.image,
    refinement: plan.refinement,
  };
}
