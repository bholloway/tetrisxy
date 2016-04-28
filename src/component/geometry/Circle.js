import React, { Component, PropTypes } from 'react';

import prop  from '../../decorator/prop';
import types from '../../react/prop-types';

import styles from './circle.scss';

export default class Slash extends Component {

  @prop(types.classes)
  className;

  @prop(types.fraction, 1.0)
  progress;

  @prop(types.colour.isRequired)
  colour;

  @prop(types.point.isRequired)
  size;

  render() {
    let scaling = 1.0 - this.progress;

    // complete progress implies empty
    if (scaling <= 0) {
      return <svg/>;
    }
    // incomplete progress implies circle about the centroid
    //  full size should cover the viewport
    else {
      let classNames = [styles.main].concat(this.className)
        .filter(Boolean)
        .join(' ');

      let centroid   = {
            x: this.size.x / 2,
            y: this.size.y / 2
          },
          viewBox    = [0, 0, this.size.x, this.size.y],
          radius     = Math.pow(
            Math.pow(this.size.x / 2 * scaling, 2) + Math.pow(this.size.y / 2 * scaling, 2),
            0.5
          );

      return (
        <div className={classNames}>
          <svg viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
            <circle fill={this.colour} cx={centroid.x} cy={centroid.y} r={radius}/>
          </svg>
        </div>
      );
    }
  }
}
