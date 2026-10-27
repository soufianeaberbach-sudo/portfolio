import entries from './garment-copy.json';
import type { Subject } from './portfolio';

/** Editorial garment copy is independent of photograph alt text and provenance.
 * Reviewed against the actual Front photograph; no fibre or internal-seam claims. */
export function garmentCopy(subject: Subject): { title: string; description: string } {
  const copy = entries[subject.id as keyof typeof entries];
  if (copy) return copy;
  // Internal story-lab fixtures are not public collection records.
  if (subject.fixture) return { title: subject.title || 'Development study', description: '' };
  throw new Error(`Missing reviewed garment copy: ${subject.id}`);
}
