export default function rampDistribution() {

  // take n=2 irwin hall distribution and make a single-sided triangular distribution with mean 1.0
  //  https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution
  return 1.0 - Math.abs(Math.random() + Math.random() - 1.0);
}