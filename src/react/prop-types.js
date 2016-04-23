import { PropTypes } from 'react';

export const point = PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired
});

export const classes = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.string)
]);

export const colour = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number
]);

export function fraction(props, propName, componentName) {
  var value   = props[propName],
      isValid = (typeof value === 'number') && !isNaN(value) && (value >= 0.0) && (value <= 1.0);
  return isValid ? null :
    new Error(`${propName} in ${componentName || 'ANONYMOUS'} must be fraction 0.0-1.0 but got ${value}`);
}
