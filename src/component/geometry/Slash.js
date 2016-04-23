import React, { Component, PropTypes } from 'react';

import prop           from '../../decorator/prop';
import * as types     from '../../react/prop-types';
import closedPathData from '../../svg/closed-path-data';

import styles from './slash.scss';

export default class Slash extends Component {

  @prop(types.classes)
  className;

  @prop(types.fraction, 1.0)
  progress;

  @prop(types.colour.isRequired)
  colour;

  @prop(types.point.isRequired)
  size;

  @prop(PropTypes.number)
  lineWidth;

  render() {
    // no progress implies empty
    if (this.progress <= 0) {
      return <svg/>;
    }
    // progress implies partial display about the centroid
    else {
      var classNames = [styles.main].concat(this.className).filter(Boolean).join(' '),
          centroid   = {
            x: this.size.x / 2,
            y: this.size.y / 2
          },
          viewBox    = [0, 0, this.size.x, this.size.y],
          limits     = {
            left  : centroid.x - centroid.x * this.progress,
            top   : centroid.y - centroid.y * this.progress,
            right : centroid.x + centroid.x * this.progress,
            bottom: centroid.y + centroid.y * this.progress
          },
          radius     = this.lineWidth / 2,
          angle      = Math.atan2(this.size.y, this.size.x),
          delta      = {
            x: radius * Math.sin(angle),
            y: radius * Math.cos(angle)
          },
          pathData   = closedPathData(
            [limits.left + delta.x, limits.top - delta.y],
            [limits.right + delta.x, limits.bottom - delta.y],
            [limits.right - delta.x, limits.bottom + delta.y],
            [limits.left - delta.x, limits.top + delta.y],
            [limits.left + delta.x, limits.top - delta.y]
          );

      return (
        <div className={classNames}>
          <svg viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">

            {/* diagonal line path */}
            <path fill={this.colour} d={pathData}/>

            {/* circular line endings */}
            <circle fill={this.colour} cx={limits.left} cy={limits.top} r={radius}/>
            <circle fill={this.colour} cx={limits.right} cy={limits.bottom} r={radius}/>
          </svg>
        </div>
      );
    }
  }
}
