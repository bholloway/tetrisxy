export default function closedPathData(...args) {
  return args
    .map((v, i) => [(i === 0) ? 'M' : 'L'].concat(v).join(' '))
    .join(' ');
}
