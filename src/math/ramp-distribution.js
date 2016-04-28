/**
 * A random linear ramp distribution with expected value 1.0 where 0.0 is least likely
 *
 * Uses n=2 irwin hall distribution with adjusted range.
 *
 * @see https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution
 * @returns {number}
 */
export default function rampDistribution() {
  return 1.0 - Math.abs(Math.random() + Math.random() - 1.0);
}