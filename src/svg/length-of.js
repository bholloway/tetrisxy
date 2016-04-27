export default function lengthOf(points) {
  return Math.pow(
    Math.pow(points[0].x - points[1].x, 2) + Math.pow(points[0].y - points[1].y, 2),
    0.5
  );
}
