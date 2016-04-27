import React, { Component, PropTypes } from 'react';
import memoizee                        from 'memoizee';
import Prefixer                        from 'inline-style-prefixer';

import prop       from '../../decorator/prop';
import * as types from '../../react/prop-types';
import lengthOf   from '../../svg/length-of';

import styles from './triangle-mask.scss';

export default class TriangleMask extends Component {

  static prefixer = new Prefixer();

  @prop(types.point.isRequired)
  size;

  @prop(PropTypes.number, 0)
  offset;

  @prop(PropTypes.bool.isRequired)
  isYnotX;

  componentWillMount() {
    this.memoGeometry = memoizee(TriangleMask.getGeometry, {primitive: true, length: 3, max: 2});
  }

  componentWillUnmount() {
    this.memoGeometry.clear();
  }

  render() {
    let geom = this.memoGeometry(this.size, this.offset, this.isYnotX);

    return (
      <div className={styles.main} style={geom.transform.outer}>
        <div className={styles.main} style={geom.transform.inner}>
          {this.props.children}
        </div>
      </div>
    );
  }

  static getGeometry(size, offset, isYnotX) {

    // create transforms for the clipping rectangles
    let radians    = Math.atan2(size.y, size.x),
        hypotenuse = lengthOf([{x: 0, y: 0}, size]),
        outer      = TriangleMask.prefixer.prefix({
          width          : hypotenuse,
          top            : isYnotX ? 0 : `${offset}px`,
          bottom         : isYnotX ? `${offset}px` : 0,
          left           : isYnotX ? undefined : 0,
          right          : isYnotX ? 0 : undefined,
          transform      : `rotate(${radians}rad)`,
          transformOrigin: isYnotX ? `${hypotenuse}px ${size.y}px` : `0 0`
        }),
        inner      = TriangleMask.prefixer.prefix({
          width          : `${size.x}px`,
          height         : '100%',
          left           : isYnotX ? undefined : 0,
          right          : isYnotX ? 0 : undefined,
          transform      : `rotate(-${radians}rad)`,
          transformOrigin: isYnotX ? `${size.x}px ${size.y}px` : `0 0`
        });

    return {transform: {outer, inner}};
  }
}