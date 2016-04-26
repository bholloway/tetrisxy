export default function closedPathData(list) {
  return list
    .map((v) => Array.isArray(v) ? v : [v.x, v.y])
    .map((v, i) => [(i === 0) ? 'M' : 'L'].concat(v).join(' '))
    .join(' ');
}